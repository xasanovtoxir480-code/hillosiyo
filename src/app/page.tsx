'use client'

import { useEffect } from 'react'

export default function Page() {
  useEffect(() => {
    let cancelled = false

    Promise.all([
      import('./app-content'),
      import('react-dom/client'),
    ]).then(([{ default: AppContent }, { createRoot }]) => {
      if (cancelled) return

      // Create a fresh DOM node outside React's hydration tree.
      // This completely bypasses React hydration — no mismatch possible.
      const container = document.createElement('div')
      container.id = '__app'
      document.body.appendChild(container)

      const root = createRoot(container)
      root.render(<AppContent />)
    })

    return () => { cancelled = true }
  }, [])

  // Return null — both server and client render identical empty output.
  // No DOM nodes = nothing to mismatch during hydration.
  return null
}
