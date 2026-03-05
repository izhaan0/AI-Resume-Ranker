// import axios from 'axios'

// const api = axios.create({
//   baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
//   timeout: 120_000,
// })

// api.interceptors.response.use(
//   (res) => res,
//   (err) => {
//     const message = err.response?.data?.detail || err.message || 'Something went wrong'
//     return Promise.reject(new Error(message))
//   }
// )

// /**
//  * Rank resumes against a job description.
//  * @param {string} jobDescription
//  * @param {File[]} files
//  * @param {(pct: number) => void} onProgress
//  */
// export async function rankResumes(jobDescription, files, onProgress) {
//   const form = new FormData()
//   form.append('job_description', jobDescription)
//   files.forEach((f) => form.append('resumes', f))

//   const { data } = await api.post('/api/rank', form, {
//     headers: { 'Content-Type': 'multipart/form-data' },
//     onUploadProgress: (e) => {
//       if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100))
//     },
//   })
//   return data
// }

// /**
//  * Parse a single resume and return structured data.
//  * @param {File} file
//  */
// export async function parseResume(file) {
//   const form = new FormData()
//   form.append('resume', file)
//   const { data } = await api.post('/api/parse', form, {
//     headers: { 'Content-Type': 'multipart/form-data' },
//   })
//   return data
// }

// /**
//  * Fetch ranking history from the backend.
//  */
// export async function fetchHistory() {
//   const { data } = await api.get('/api/history')
//   return data
// }

// /**
//  * Health check.
//  */
// export async function healthCheck() {
//   const { data } = await api.get('/api/health')
//   return data
// }

// export default api





import axios from "axios"

// Use backend URL from environment
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

const api = axios.create({
  baseURL: API_URL,
  timeout: 300000, // 5 minutes (ML models can take time)
})

/**
 * Global response interceptor
 */
api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("API Error:", err)

    const message =
      err.response?.data?.detail ||
      err.response?.data?.message ||
      err.message ||
      "Something went wrong"

    return Promise.reject(new Error(message))
  }
)

/**
 * Rank resumes against a job description
 */
export async function rankResumes(jobDescription, files, onProgress) {
  const form = new FormData()

  form.append("job_description", jobDescription)

  files.forEach((file) => {
    form.append("resumes", file)
  })

  const res = await api.post("/api/rank", form, {
    headers: {
      "Content-Type": "multipart/form-data",
    },

    onUploadProgress: (progressEvent) => {
      if (!onProgress) return

      if (progressEvent.total) {
        const percent = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        )
        onProgress(percent)
      }
    },
  })

  return res.data
}

/**
 * Parse a single resume
 */
export async function parseResume(file) {
  const form = new FormData()
  form.append("resume", file)

  const res = await api.post("/api/parse", form, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })

  return res.data
}

/**
 * Fetch ranking history
 */
export async function fetchHistory() {
  const res = await api.get("/api/history")
  return res.data
}

/**
 * Health check endpoint
 */
export async function healthCheck() {
  const res = await api.get("/api/health")
  return res.data
}

export default api