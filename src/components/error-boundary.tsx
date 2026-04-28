'use client'

import React from 'react'

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col bg-white">
          <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md shadow-emerald-600/25">P</div>
              <div>
                <h1 className="font-bold text-lg leading-none">PickUp Market</h1>
                <p className="text-xs text-gray-500">Toshkent</p>
              </div>
            </div>
          </nav>
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center space-y-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Xatolik yuz berdi</h2>
              <p className="text-gray-500">
                Sahifani yuklashda xatolik yuz berdi. Iltimos, sahifani qayta yuklang.
              </p>
              {this.state.error && (
                <details className="text-left bg-gray-50 rounded-xl p-4">
                  <summary className="text-sm font-medium text-gray-600 cursor-pointer">
                    Xatolik tafsilotlari
                  </summary>
                  <pre className="mt-2 text-xs text-red-600 overflow-auto whitespace-pre-wrap">
                    {this.state.error.message}
                  </pre>
                </details>
              )}
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null })
                  window.location.reload()
                }}
                className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/25"
              >
                Qayta yuklash
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
