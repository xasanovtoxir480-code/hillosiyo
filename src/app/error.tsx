'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  // Auto-retry once for hydration errors (error #185).
  // React can recover after the first failed hydration attempt.
  useEffect(() => {
    const msg = error?.message || ''
    if (msg.includes('185') || msg.includes('hydration') || msg.includes('Hydration')) {
      const t = setTimeout(() => reset(), 0)
      return () => clearTimeout(t)
    }
  }, [error, reset])

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="max-w-lg w-full text-center space-y-6">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Xatolik yuz berdi</h2>
        <p className="text-gray-500">Sahifani yuklashda xatolik yuz berdi.</p>
        <button
          onClick={reset}
          className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
        >
          Qayta yuklash
        </button>
      </div>
    </div>
  )
}
