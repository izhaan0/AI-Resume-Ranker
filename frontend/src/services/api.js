import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 120_000,
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.detail || err.message || 'Something went wrong'
    return Promise.reject(new Error(message))
  }
)

/**
 * Rank resumes against a job description.
 * @param {string} jobDescription
 * @param {File[]} files
 * @param {(pct: number) => void} onProgress
 */
export async function rankResumes(jobDescription, files, onProgress) {
  const form = new FormData()
  form.append('job_description', jobDescription)
  files.forEach((f) => form.append('resumes', f))

  const { data } = await api.post('/api/rank', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100))
    },
  })
  return data
}

/**
 * Parse a single resume and return structured data.
 * @param {File} file
 */
export async function parseResume(file) {
  const form = new FormData()
  form.append('resume', file)
  const { data } = await api.post('/api/parse', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

/**
 * Fetch ranking history from the backend.
 */
export async function fetchHistory() {
  const { data } = await api.get('/api/history')
  return data
}

/**
 * Health check.
 */
export async function healthCheck() {
  const { data } = await api.get('/api/health')
  return data
}

export default api
