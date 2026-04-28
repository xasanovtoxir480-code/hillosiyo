'use client'

import { useState, useEffect } from 'react'
import AppContent from './app-content'

export default function Page() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Yuklanmoqda...</p>
        </div>
      </div>
    )
  }

  return <AppContent />
}
