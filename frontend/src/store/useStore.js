import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useStore = create(
  persist(
    (set, get) => ({
      // ── Current session ──────────────────────────────────
      jobDescription: '',
      files: [],
      results: null,
      isLoading: false,
      uploadProgress: 0,
      error: null,

      setJobDescription: (jd) => set({ jobDescription: jd }),
      setFiles: (files) => set({ files }),
      setResults: (results) => set({ results }),
      setLoading: (isLoading) => set({ isLoading }),
      setUploadProgress: (pct) => set({ uploadProgress: pct }),
      setError: (error) => set({ error }),
      clearSession: () => set({ jobDescription: '', files: [], results: null, error: null, uploadProgress: 0 }),

      // ── History ───────────────────────────────────────────
      history: [],
      addToHistory: (entry) =>
        set((state) => ({
          history: [
            { ...entry, id: Date.now(), timestamp: new Date().toISOString() },
            ...state.history,
          ].slice(0, 50),
        })),
      clearHistory: () => set({ history: [] }),

      // ── UI preferences ────────────────────────────────────
      filterScore: 0,
      sortBy: 'score', // 'score' | 'name' | 'experience'
      setFilterScore: (v) => set({ filterScore: v }),
      setSortBy: (v) => set({ sortBy: v }),
    }),
    {
      name: 'ats-ranker-store',
      partialize: (state) => ({ history: state.history }),
    }
  )
)
