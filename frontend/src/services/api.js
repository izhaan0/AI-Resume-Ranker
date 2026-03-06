// import axios from "axios"

// // Use backend URL from environment
// const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

// const api = axios.create({
//   baseURL: API_URL,
//   timeout: 300000, // 5 minutes (ML models can take time)
// })

// /**
//  * Global response interceptor
//  */
// api.interceptors.response.use(
//   (res) => res,
//   (err) => {
//     console.error("API Error:", err)

//     const message =
//       err.response?.data?.detail ||
//       err.response?.data?.message ||
//       err.message ||
//       "Something went wrong"

//     return Promise.reject(new Error(message))
//   }
// )

// /**
//  * Rank resumes against a job description
//  */
// export async function rankResumes(jobDescription, files, onProgress) {
//   const form = new FormData()

//   form.append("job_description", jobDescription)

//   files.forEach((file) => {
//     form.append("resumes", file)
//   })

//   const res = await api.post("/api/rank", form, {
//     headers: {
//       "Content-Type": "multipart/form-data",
//     },

//     onUploadProgress: (progressEvent) => {
//       if (!onProgress) return

//       if (progressEvent.total) {
//         const percent = Math.round(
//           (progressEvent.loaded * 100) / progressEvent.total
//         )
//         onProgress(percent)
//       }
//     },
//   })

//   return res.data
// }

// /**
//  * Parse a single resume
//  */
// export async function parseResume(file) {
//   const form = new FormData()
//   form.append("resume", file)

//   const res = await api.post("/api/parse", form, {
//     headers: {
//       "Content-Type": "multipart/form-data",
//     },
//   })

//   return res.data
// }

// /**
//  * Fetch ranking history
//  */
// export async function fetchHistory() {
//   const res = await api.get("/api/history")
//   return res.data
// }

// /**
//  * Health check endpoint
//  */
// export async function healthCheck() {
//   const res = await api.get("/api/health")
//   return res.data
// }

// export default api



import axios from 'axios'

// ── Base URL ──────────────────────────────────────────────────────────────────
// Priority order:
//   1. VITE_API_URL env variable (set in Vercel dashboard)
//   2. Render production URL (hardcoded fallback)
//   3. Local dev server
const BASE_URL =
  import.meta.env.VITE_API_URL ||
  'https://ai-resume-ranker-zexp.onrender.com'

// ── Axios instance ────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 180_000, // 3 min — Render free tier can be slow on cold starts
  headers: {
    Accept: 'application/json',
  },
})

// ── Request interceptor — log outgoing requests in dev ───────────────────────
api.interceptors.request.use(
  (config) => {
    if (import.meta.env.DEV) {
      console.debug(`[API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`)
    }
    return config
  },
  (err) => Promise.reject(err)
)

// ── Response interceptor — normalise errors ───────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Network error (Render cold start, offline, etc.)
    if (!err.response) {
      const msg =
        err.code === 'ECONNABORTED'
          ? 'Request timed out. The server may be waking up — please try again in a moment.'
          : 'Network error. Please check your connection and try again.'
      return Promise.reject(new Error(msg))
    }

    // HTTP error from backend
    const status = err.response.status
    const detail = err.response.data?.detail

    if (status === 413) {
      return Promise.reject(new Error('One or more files exceed the 10 MB size limit.'))
    }
    if (status === 415) {
      return Promise.reject(new Error('Unsupported file type. Only PDF and DOCX are accepted.'))
    }
    if (status === 422) {
      // Pydantic validation error — extract first message
      const errors = err.response.data?.detail
      if (Array.isArray(errors)) {
        const first = errors[0]
        return Promise.reject(new Error(first?.msg || 'Validation error. Please check your input.'))
      }
      return Promise.reject(new Error('Validation error. Please check your input.'))
    }
    if (status === 500) {
      return Promise.reject(new Error('Server error. Please try again or contact support.'))
    }

    return Promise.reject(new Error(detail || `Request failed (${status})`))
  }
)


// ── API functions ─────────────────────────────────────────────────────────────

/**
 * Rank resumes against a job description.
 *
 * @param {string} jobDescription   - Raw JD text (min 20 chars)
 * @param {File[]} files            - Array of File objects (PDF/DOCX)
 * @param {(pct: number) => void} [onProgress] - Upload progress callback (0–100)
 * @returns {Promise<{ranked_candidates: object[], total: number, job_description_preview: string}>}
 */
export async function rankResumes(jobDescription, files, onProgress) {
  const form = new FormData()
  form.append('job_description', jobDescription)
  files.forEach((f) => form.append('resumes', f))

  const { data } = await api.post('/api/rank', form, {
    // Do NOT set Content-Type manually — axios sets multipart/form-data
    // with the correct boundary automatically when FormData is passed
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        onProgress(Math.round((e.loaded / e.total) * 100))
      }
    },
  })

  return data
}

/**
 * Parse a single resume file and return structured data.
 *
 * @param {File} file
 * @returns {Promise<{filename, name, email, phone, skills, experience_years, education, job_titles}>}
 */
export async function parseResume(file) {
  const form = new FormData()
  form.append('resume', file)

  const { data } = await api.post('/api/parse', form)
  return data
}

/**
 * Fetch paginated ranking history from the backend.
 *
 * @param {number} [limit=20]
 * @param {number} [offset=0]
 * @returns {Promise<{sessions: object[], total: number}>}
 */
export async function fetchHistory(limit = 20, offset = 0) {
  const { data } = await api.get('/api/history', {
    params: { limit, offset },
  })
  return data
}

/**
 * Health check — also useful to wake up Render's free tier.
 *
 * @returns {Promise<{status: string, version: string, models_loaded: boolean}>}
 */
export async function healthCheck() {
  const { data } = await api.get('/api/health')
  return data
}

/**
 * Ping the server to wake it up (Render free tier sleeps after 15 min).
 * Call this on app mount so the backend is ready when the user clicks Analyze.
 */
export async function warmUp() {
  try {
    await api.get('/api/health', { timeout: 10_000 })
    if (import.meta.env.DEV) console.debug('[API] Server warm-up successful.')
  } catch {
    // Silently ignore — this is just a best-effort ping
  }
}

export { BASE_URL }
export default api
