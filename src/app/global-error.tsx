'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="uz">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-white p-4">
          <div className="max-w-lg w-full text-center space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Global Error</h2>
            <div className="bg-gray-50 rounded-xl p-4 text-left">
              <p className="text-sm font-mono text-red-600 break-all">{error?.message || 'Unknown error'}</p>
            </div>
            <button
              onClick={reset}
              className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
            >
              Qayta yuklash
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
