'use client'

import { useState, useEffect } from 'react'
import { useCartStore } from '@/store/cart-store'
import { useDataStore } from '@/store/data-store'
import { HeroSection } from '@/components/store/hero-section'
import { CategoryBar } from '@/components/store/category-bar'
import { ProductGrid } from '@/components/store/product-grid'
import { CartSheet } from '@/components/store/cart-sheet'
import { CheckoutView } from '@/components/store/checkout-view'
import { OrderSuccessView } from '@/components/store/order-success-view'
import { AdminPanel } from '@/components/store/admin-panel'
import { Footer } from '@/components/store/footer'

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const currentView = useCartStore((s) => s.currentView)
  const selectedCategory = useCartStore((s) => s.selectedCategory)
  const searchQuery = useCartStore((s) => s.searchQuery)
  const setSelectedCategory = useCartStore((s) => s.setSelectedCategory)

  // Wait for client-side hydration to complete before rendering dynamic content
  useEffect(() => {
    setMounted(true)
  }, [])

  // During SSR/initial hydration, show the static shell only
  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md shadow-emerald-600/25">
                P
              </div>
              <div>
                <h1 className="font-bold text-lg leading-none">PickUp Market</h1>
                <p className="text-xs text-gray-500">Toshkent • Yashirin Ombor</p>
              </div>
            </div>
          </div>
        </nav>
        <HeroSection />
        <CategoryBar selected="all" onSelect={() => {}} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <p className="text-gray-400">Yuklanmoqda...</p>
        </div>
        <Footer />
      </div>
    )
  }

  if (currentView === 'checkout') return <CheckoutView />
  if (currentView === 'order-success') return <OrderSuccessView />
  if (currentView === 'admin') return <AdminPanel />

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md shadow-emerald-600/25">
              P
            </div>
            <div>
              <h1 className="font-bold text-lg leading-none">PickUp Market</h1>
              <p className="text-xs text-gray-500">Toshkent • Yashirin Ombor</p>
            </div>
          </div>
        </div>
      </nav>
      <HeroSection />
      <CategoryBar selected={selectedCategory} onSelect={setSelectedCategory} />
      <ProductGrid categoryId={selectedCategory} searchQuery={searchQuery} />
      <Footer />
      <CartSheet />
    </div>
  )
}
