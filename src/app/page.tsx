'use client'

import { useState, useEffect } from 'react'

export default function Page() {
  const [AppContent, setAppContent] = useState<React.ComponentType | null>(null)

  useEffect(() => {
    import('./app-content')
      .then(mod => setAppContent(() => mod.default))
      .catch(err => console.error('Failed to load app:', err))
  }, [])

  if (!AppContent) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontFamily: 'system-ui, sans-serif',
        color: '#666',
      }}>
        <p>Yuklanmoqda...</p>
      </div>
    )
  }

  return <AppContent />
}
