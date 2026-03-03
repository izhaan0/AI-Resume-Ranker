import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { UploadCloud, FileText, X, CheckCircle2 } from 'lucide-react'
import { useUpload } from '../hooks/useUpload.js'
import { cn } from './ui/cn.js'

export default function UploadZone() {
  const { files, onDrop, removeFile, ACCEPTED, MAX_SIZE } = useUpload()

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: ACCEPTED,
    maxSize: MAX_SIZE,
    multiple: true,
  })

  return (
    <div className="space-y-4">
      {/* Drop area */}
      <div
        {...getRootProps()}
        className={cn(
          'relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300',
          isDragActive && !isDragReject && 'border-brand-500 bg-brand-500/8 scale-[1.01]',
          isDragReject && 'border-red-500 bg-red-500/8',
          !isDragActive && 'border-white/10 hover:border-brand-500/50 hover:bg-brand-500/5',
        )}
      >
        <input {...getInputProps()} />

        <motion.div
          animate={{ y: isDragActive ? -6 : 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="flex flex-col items-center gap-3"
        >
          <div className={cn(
            'w-14 h-14 rounded-2xl flex items-center justify-center transition-colors duration-200',
            isDragActive ? 'bg-brand-500/20' : 'bg-white/5'
          )}>
            <UploadCloud size={26} className={isDragActive ? 'text-brand-400' : 'text-gray-500'} />
          </div>

          {isDragReject ? (
            <div>
              <p className="font-display font-semibold text-red-400">Unsupported file type</p>
              <p className="text-sm text-gray-500 mt-1">Only PDF and DOCX files are accepted</p>
            </div>
          ) : isDragActive ? (
            <p className="font-display font-semibold text-brand-300">Drop resumes here</p>
          ) : (
            <div>
              <p className="font-display font-semibold text-gray-200">
                Drag & drop resumes here
              </p>
              <p className="text-sm text-gray-500 mt-1">
                or <span className="text-brand-400 hover:underline">click to browse</span>
              </p>
              <p className="text-xs text-gray-600 mt-2 font-mono">PDF · DOCX · max 10 MB · up to 20 files</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* File list */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <p className="text-xs text-gray-500 font-mono uppercase tracking-widest px-1">
              {files.length} file{files.length !== 1 ? 's' : ''} queued
            </p>
            {files.map((file, i) => (
              <motion.div
                key={file.name + i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-3 glass rounded-xl px-4 py-3"
              >
                <FileText size={15} className="text-brand-400 shrink-0" />
                <span className="text-sm text-gray-300 flex-1 truncate font-mono">{file.name}</span>
                <span className="text-xs text-gray-600 shrink-0">
                  {(file.size / 1024).toFixed(0)} KB
                </span>
                <CheckCircle2 size={14} className="text-brand-500 shrink-0" />
                <button
                  onClick={(e) => { e.stopPropagation(); removeFile(i) }}
                  className="text-gray-600 hover:text-red-400 transition-colors ml-1"
                >
                  <X size={14} />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
