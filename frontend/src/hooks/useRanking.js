// import { useCallback } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { rankResumes } from '../services/api.js'
// import { useStore } from '../store/useStore.js'

// export function useRanking() {
//   const navigate = useNavigate()
//   const {
//     jobDescription, files,
//     setResults, setLoading, setUploadProgress, setError, addToHistory,
//   } = useStore()

//   const analyze = useCallback(async () => {
//     if (!jobDescription.trim() || files.length === 0) return

//     setLoading(true)
//     setError(null)
//     setUploadProgress(0)

//     try {
//       const data = await rankResumes(jobDescription, files, setUploadProgress)
//       setResults(data)
//       addToHistory({
//         jobDescription: jobDescription.slice(0, 120),
//         candidateCount: data.ranked_candidates?.length ?? 0,
//         topScore: data.ranked_candidates?.[0]?.ats_score ?? 0,
//         fileNames: files.map((f) => f.name),
//       })
//       navigate('/results')
//     } catch (err) {
//       setError(err.message)
//     } finally {
//       setLoading(false)
//     }
//   }, [jobDescription, files, navigate, setResults, setLoading, setUploadProgress, setError, addToHistory])

//   return { analyze }
// }



import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { rankResumes } from '../services/api.js'
import { useStore } from '../store/useStore.js'

export function useRanking() {
  const navigate = useNavigate()

  const {
    jobDescription,
    files,
    setResults,
    setLoading,
    setUploadProgress,
    setError,
    addToHistory,
  } = useStore()

  const analyze = useCallback(async () => {

    if (!jobDescription.trim() || files.length === 0) {
      setError("Please provide a job description and upload at least one resume.")
      return
    }

    setLoading(true)
    setError(null)
    setUploadProgress(0)

    try {

      const data = await rankResumes(jobDescription, files, setUploadProgress)

      // backend returns:
      // {
      //   ranked_candidates: [],
      //   total: number,
      //   job_description_preview: ""
      // }

      if (!data || !data.ranked_candidates) {
        throw new Error("Invalid response from server")
      }

      setResults(data)

      addToHistory({
        jobDescription: jobDescription.slice(0, 120),
        candidateCount: data.ranked_candidates.length,
        topScore: data.ranked_candidates[0]?.ats_score ?? 0,
        fileNames: files.map((f) => f.name),
      })

      navigate('/results')

    } catch (err) {

      console.error("Ranking API error:", err)

      const message =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        "Failed to analyze resumes"

      setError(message)

    } finally {
      setLoading(false)
    }

  }, [
    jobDescription,
    files,
    navigate,
    setResults,
    setLoading,
    setUploadProgress,
    setError,
    addToHistory
  ])

  return { analyze }
}
