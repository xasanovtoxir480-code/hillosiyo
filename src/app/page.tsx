'use client'

import dynamic from 'next/dynamic'

const AppContent = dynamic(() => import('./app-content'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Yuklanmoqda...</p>
      </div>
    </div>
  ),
})

export default function Page() {
  return <AppContent />
}
