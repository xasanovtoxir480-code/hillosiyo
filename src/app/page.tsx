'use client'

import { useState, useEffect } from 'react'
import AppContent from './app-content'

export default function Page() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Both server and client render the same empty div during hydration.
  // After mount, client renders the full AppContent.
  if (!mounted) {
    return <div data-app-loading="" />
  }

  return <AppContent />
}
