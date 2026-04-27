'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Plus, Minus, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useCartStore } from '@/store/cart-store'
import { formatPrice } from '@/lib/format'
import { cn } from '@/lib/utils'

export function CartSheet() {
  const { items, isCartOpen, setCartOpen, removeItem, updateQuantity, getTotal, getItemCount, setCurrentView } = useCartStore()
  const total = getTotal()
  const count = getItemCount()

  return (
    <>
      {/* Floating Cart Button */}
      <AnimatePresence>
        {count > 0 && !isCartOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              size="lg"
              className={cn(
                'rounded-full w-16 h-16 shadow-2xl shadow-emerald-600/30',
                'bg-emerald-600 hover:bg-emerald-700 text-white',
                'transition-all duration-300 hover:scale-110'
              )}
              onClick={() => setCartOpen(true)}
            >
              <ShoppingCart className="h-6 w-6" />
              <Badge className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white">
                {count}
              </Badge>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Sheet Overlay */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setCartOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <div className="flex items-center gap-3">
                  <ShoppingCart className="h-6 w-6 text-emerald-600" />
                  <h2 className="text-xl font-bold">Savat</h2>
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                    {count} ta
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-gray-100"
                  onClick={() => setCartOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Items */}
              {items.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 px-6">
                  <ShoppingCart className="h-20 w-20 mb-4 opacity-30" />
                  <p className="text-lg font-medium">Savat bo&apos;sh</p>
                  <p className="text-sm mt-1">Mahsulot qo&apos;shish uchun katalogga o&apos;ting</p>
                  <Button
                    className="mt-6 bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => setCartOpen(false)}
                  >
                    Mahsulotlarga o&apos;tish
                  </Button>
                </div>
              ) : (
                <>
                  <ScrollArea className="flex-1 px-6 py-4">
                    <div className="space-y-4">
                      {items.map((item) => (
                        <motion.div
                          key={item.productId}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: 100 }}
                          className="flex gap-4 p-3 bg-gray-50 rounded-xl"
                        >
                          {/* Image */}
                          <div className="w-16 h-16 rounded-lg bg-white overflow-hidden flex-shrink-0 border relative">
                            {item.productImage && (item.productImage.startsWith('/products/') || item.productImage.startsWith('/uploads/') || item.productImage.startsWith('/api/files/')) ? (
                              <img
                                src={item.productImage}
                                alt={item.productName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.style.display = 'none'
                                  const fallback = target.nextElementSibling as HTMLElement
                                  if (fallback) fallback.style.display = 'flex'
                                }}
                              />
                            ) : null}
                            <div
                              className="w-full h-full items-center justify-center text-2xl absolute inset-0 bg-gray-50"
                              style={{ display: (!item.productImage || !(item.productImage.startsWith('/products/') || item.productImage.startsWith('/uploads/') || item.productImage.startsWith('/api/files/'))) ? 'flex' : 'none' }}
                            >
                              {item.categoryIcon}
                            </div>
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm truncate">{item.productName}</h4>
                            <p className="text-emerald-700 font-bold text-sm mt-1">
                              {formatPrice(item.price)} / {item.unit}
                            </p>

                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 w-7 p-0 rounded-lg"
                                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                >
                                  {item.quantity === 1 ? <Trash2 className="h-3 w-3 text-red-500" /> : <Minus className="h-3 w-3" />}
                                </Button>
                                <span className="font-bold text-sm w-6 text-center">{item.quantity}</span>
                                <Button
                                  size="sm"
                                  className="h-7 w-7 p-0 rounded-lg bg-emerald-600 hover:bg-emerald-700"
                                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                              <span className="font-bold text-sm">
                                {formatPrice(item.price * item.quantity)}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>

                  {/* Footer */}
                  <div className="border-t p-6 space-y-4 bg-gray-50">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Jami ({count} ta)</span>
                        <span>{formatPrice(total)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-lg font-bold">
                        <span>Umumiy</span>
                        <span className="text-emerald-700">{formatPrice(total)}</span>
                      </div>
                    </div>

                    <Button
                      className="w-full h-14 text-lg font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/25"
                      onClick={() => {
                        setCartOpen(false)
                        setCurrentView('checkout')
                      }}
                    >
                      Buyurtma berish
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
