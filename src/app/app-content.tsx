'use client'

import { useState, useEffect } from 'react'
import { useCartStore } from '@/store/cart-store'
import { HeroSection } from '@/components/store/hero-section'
import { CategoryBar } from '@/components/store/category-bar'
import { ProductGrid } from '@/components/store/product-grid'
import { CartSheet } from '@/components/store/cart-sheet'
import { CheckoutView } from '@/components/store/checkout-view'
import { OrderSuccessView } from '@/components/store/order-success-view'
import { AdminPanel } from '@/components/store/admin-panel'
import { Footer } from '@/components/store/footer'
import { ShoppingCart, Settings } from 'lucide-react'

function NavBar({ onAdmin }: { onAdmin: () => void }) {
  const items = useCartStore((s) => s.items)
  const setCartOpen = useCartStore((s) => s.setCartOpen)
  const count = items.reduce((c, i) => c + i.quantity, 0)

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md shadow-emerald-600/25">P</div>
          <div>
            <h1 className="font-bold text-lg leading-none">PickUp Market</h1>
            <p className="text-xs text-gray-500">Toshkent</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={onAdmin} className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors" title="Admin">
            <Settings className="h-5 w-5" />
          </button>
          <button type="button" onClick={() => setCartOpen(true)} className="relative w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors">
            <ShoppingCart className="h-5 w-5" />
            {count > 0 && <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">{count > 99 ? '99+' : count}</span>}
          </button>
        </div>
      </div>
    </nav>
  )
}

export default function AppContent() {
  const currentView = useCartStore((s) => s.currentView)
  const selectedCategory = useCartStore((s) => s.selectedCategory)
  const searchQuery = useCartStore((s) => s.searchQuery)
  const setSelectedCategory = useCartStore((s) => s.setSelectedCategory)
  const setCurrentView = useCartStore((s) => s.setCurrentView)

  if (currentView === 'checkout') return <CheckoutView />
  if (currentView === 'order-success') return <OrderSuccessView />
  if (currentView === 'admin') return <AdminPanel />

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <NavBar onAdmin={() => setCurrentView('admin')} />
      <HeroSection />
      <CategoryBar selected={selectedCategory} onSelect={setSelectedCategory} />
      <ProductGrid categoryId={selectedCategory} searchQuery={searchQuery} />
      <Footer />
      <CartSheet />
    </div>
  )
}
