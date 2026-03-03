import { motion, AnimatePresence } from 'framer-motion'
import { Zap, AlertCircle, Loader2, CheckCircle2, FileText, Sparkles } from 'lucide-react'
import UploadZone from '../components/UploadZone.jsx'
import JobDescEditor from '../components/JobDescEditor.jsx'
import { useRanking } from '../hooks/useRanking.js'
import { useStore } from '../store/useStore.js'

export default function Upload() {
  const { analyze } = useRanking()
  const { jobDescription, files, isLoading, uploadProgress, error, clearSession } = useStore()

  const ready = jobDescription.trim().length > 20 && files.length > 0

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-display font-extrabold text-3xl text-gray-100 tracking-tight flex items-center gap-2">
          <Sparkles size={26} className="text-brand-400" />
          New Analysis
        </h1>
        <p className="text-gray-500 mt-1.5">Paste a job description and upload candidate resumes to begin ranking.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Left — JD */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="card space-y-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-semibold text-gray-100 flex items-center gap-2">
                <FileText size={16} className="text-brand-400" />
                Job Description
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">The role you're hiring for</p>
            </div>
            {jobDescription.length > 0 && (
              <CheckCircle2 size={16} className="text-brand-400" />
            )}
          </div>
          <JobDescEditor />
        </motion.div>

        {/* Right — Upload */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="card space-y-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-semibold text-gray-100 flex items-center gap-2">
                <Zap size={16} className="text-brand-400" />
                Upload Resumes
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">PDF or DOCX, up to 20 files</p>
            </div>
            {files.length > 0 && (
              <span className="text-xs font-mono text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-md">
                {files.length} file{files.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <UploadZone />
        </motion.div>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="mt-4 flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3"
          >
            <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
            <p className="text-sm text-red-300">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            className="mt-6 space-y-2"
          >
            <div className="flex items-center justify-between text-xs font-mono text-gray-500">
              <span className="flex items-center gap-2">
                <Loader2 size={12} className="animate-spin text-brand-400" />
                Analyzing {files.length} resume{files.length !== 1 ? 's' : ''}…
              </span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-brand-600 to-brand-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="mt-6 flex items-center gap-3">
        <motion.button
          whileHover={{ scale: ready && !isLoading ? 1.02 : 1 }}
          whileTap={{ scale: ready && !isLoading ? 0.97 : 1 }}
          onClick={analyze}
          disabled={!ready || isLoading}
          className="btn-primary flex items-center gap-2 px-8 py-3 text-base"
        >
          {isLoading ? (
            <><Loader2 size={16} className="animate-spin" /> Analyzing…</>
          ) : (
            <><Zap size={16} /> Analyze Resumes</>
          )}
        </motion.button>

        <button
          onClick={clearSession}
          disabled={isLoading}
          className="btn-ghost text-sm"
        >
          Clear All
        </button>
      </div>
    </div>
  )
}
