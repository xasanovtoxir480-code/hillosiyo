'use client'

import { useState, useEffect } from 'react'

export default function Page() {
  const [AppContent, setAppContent] = useState<React.ComponentType | null>(null)

  useEffect(() => {
    // Only import app-content AFTER the component mounts on the client.
    // This guarantees the server and client render identical HTML during hydration.
    import('./app-content').then((mod) => {
      setAppContent(() => mod.default)
    })
  }, [])

  // Both server and client render <div /> during hydration — no mismatch possible.
  if (!AppContent) {
    return <div />
  }

  return <AppContent />
}
