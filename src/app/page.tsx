'use client'

import dynamic from 'next/dynamic'

const AppContent = dynamic(() => import('./app-content'), {
  ssr: false,
  loading: () => null,
})

export default function Page() {
  return <AppContent />
}
