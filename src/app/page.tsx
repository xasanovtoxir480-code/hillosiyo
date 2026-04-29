'use client'

import dynamic from 'next/dynamic'

// Skip SSR entirely — no hydration step = no hydration mismatch possible.
const AppContent = dynamic(() => import('./app-content'), {
  ssr: false,
  loading: () => null,
})

export default function Page() {
  return <AppContent />
}
