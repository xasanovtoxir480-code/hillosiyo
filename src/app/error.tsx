'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div style={{ padding: 40, fontFamily: 'monospace' }}>
      <h2 style={{ color: 'red', fontSize: 20, marginBottom: 10 }}>ERROR</h2>
      <p style={{ color: '#333', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
        {error?.message || 'Unknown error'}
      </p>
      {error?.stack && (
        <pre style={{ fontSize: 11, color: '#666', marginTop: 10, whiteSpace: 'pre-wrap', maxHeight: 300, overflow: 'auto' }}>
          {error.stack}
        </pre>
      )}
      <button
        onClick={reset}
        style={{ marginTop: 20, padding: '10px 24px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, fontSize: 16, cursor: 'pointer' }}
      >
        Qayta yuklash
      </button>
    </div>
  )
}
