'use client'

import { useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import AppContent from './app-content'

// This page COMPLETELY bypasses React hydration to prevent error #185.
// Server renders an empty <div>. Client hydrates that same empty <div> (no mismatch).
// Then useEffect mounts AppContent via createRoot() — a fresh client-only render tree.
export default function Page() {
  const hostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!hostRef.current) return
    const el = document.createElement('div')
    el.id = 'client-app'
    hostRef.current.appendChild(el)
    const root = createRoot(el)
    root.render(<AppContent />)
  }, [])

  return <div ref={hostRef} />
}
