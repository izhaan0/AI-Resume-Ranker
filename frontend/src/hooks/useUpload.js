import { useCallback } from 'react'
import { useStore } from '../store/useStore.js'

const ACCEPTED = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
}

const MAX_SIZE = 10 * 1024 * 1024 // 10 MB

export function useUpload() {
  const { files, setFiles } = useStore()

  const onDrop = useCallback((accepted, rejected) => {
    if (rejected.length > 0) {
      console.warn('Rejected files:', rejected.map((r) => r.file.name))
    }
    setFiles([...files, ...accepted].slice(0, 20)) // cap at 20 resumes
  }, [files, setFiles])

  const removeFile = useCallback((index) => {
    setFiles(files.filter((_, i) => i !== index))
  }, [files, setFiles])

  const clearFiles = useCallback(() => setFiles([]), [setFiles])

  return { files, onDrop, removeFile, clearFiles, ACCEPTED, MAX_SIZE }
}
