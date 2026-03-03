import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { rankResumes } from '../services/api.js'
import { useStore } from '../store/useStore.js'

export function useRanking() {
  const navigate = useNavigate()
  const {
    jobDescription, files,
    setResults, setLoading, setUploadProgress, setError, addToHistory,
  } = useStore()

  const analyze = useCallback(async () => {
    if (!jobDescription.trim() || files.length === 0) return

    setLoading(true)
    setError(null)
    setUploadProgress(0)

    try {
      const data = await rankResumes(jobDescription, files, setUploadProgress)
      setResults(data)
      addToHistory({
        jobDescription: jobDescription.slice(0, 120),
        candidateCount: data.ranked_candidates?.length ?? 0,
        topScore: data.ranked_candidates?.[0]?.ats_score ?? 0,
        fileNames: files.map((f) => f.name),
      })
      navigate('/results')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [jobDescription, files, navigate, setResults, setLoading, setUploadProgress, setError, addToHistory])

  return { analyze }
}
