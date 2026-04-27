'use client'

import { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { formatPrice } from '@/lib/format'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus, ShoppingCart, Star, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useCartStore } from '@/store/cart-store'
import { useToast } from '@/hooks/use-toast'

interface Product {
  id: string
  name: string
  nameUz: string
  price: number
  oldPrice: number | null
  unit: string
  image: string
  stock: number
  isFeatured: boolean
  category: {
    id: string
    name: string
    nameUz: string
    icon: string
  }
}

interface ProductGridProps {
  categoryId: string
  searchQuery: string
}

export function ProductGrid({ categoryId, searchQuery }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { items, addItem, updateQuantity } = useCartStore()
  const { toast } = useToast()

  const fetchProducts = useCallback((catId: string, query: string) => {
    setLoading(true)
    const params = new URLSearchParams()
    if (catId && catId !== 'all') params.set('categoryId', catId)
    if (query) params.set('search', query)

    return fetch(`/api/products?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products || [])
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    fetchProducts(categoryId, searchQuery)
  }, [categoryId, searchQuery, fetchProducts])

  const getQuantity = (productId: string) => {
    return items.find((i) => i.productId === productId)?.quantity || 0
  }

  const handleAdd = (product: Product) => {
    addItem({
      id: product.id,
      productId: product.id,
      productName: product.nameUz,
      productImage: product.image,
      price: product.price,
      unit: product.unit,
      categoryId: product.category.id,
      categoryIcon: product.category.icon,
    })
    toast({
      title: `${product.category.icon} ${product.nameUz}`,
      description: 'Savatga qo\'shildi',
      duration: 2000,
    })
  }

  return (
    <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search Bar */}
      <div className="relative mb-8 max-w-md mx-auto lg:mx-0">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          placeholder="Mahsulot qidirish..."
          className="pl-12 h-12 rounded-xl border-2 border-gray-200 focus:border-emerald-500 text-base"
          value={searchQuery}
          onChange={(e) => useCartStore.getState().setSearchQuery(e.target.value)}
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-2xl h-64 animate-pulse" />
          ))}
        </div>
      )}

      {/* Products */}
      {!loading && products.length === 0 && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-bold text-gray-700">Mahsulot topilmadi</h3>
          <p className="text-gray-500 mt-2">Boshqa kategoriya yoki kalit so&apos;zni tanlang</p>
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <AnimatePresence mode="popLayout">
            {products.map((product) => {
              const quantity = getQuantity(product.id)
              const discount = product.oldPrice
                ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
                : 0

              return (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-300 overflow-hidden"
                >
                  {/* Image */}
                  <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                    {product.image && (product.image.startsWith('/products/') || product.image.startsWith('/uploads/') || product.image.startsWith('/api/files/')) ? (
                      <img
                        src={product.image}
                        alt={product.nameUz}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                          const fallback = target.nextElementSibling as HTMLElement
                          if (fallback) fallback.style.display = 'flex'
                        }}
                      />
                    ) : null}
                    <div
                      className="w-full h-full items-center justify-center text-6xl absolute inset-0"
                      style={{ display: (!product.image || !(product.image.startsWith('/products/') || product.image.startsWith('/uploads/') || product.image.startsWith('/api/files/'))) ? 'flex' : 'none' }}
                    >
                      {product.category.icon}
                    </div>

                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {discount > 0 && (
                        <Badge className="bg-red-500 text-white text-xs font-bold px-2 py-0.5">
                          -{discount}%
                        </Badge>
                      )}
                      {product.isFeatured && (
                        <Badge className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5">
                          <Star className="h-3 w-3 mr-0.5" /> Top
                        </Badge>
                      )}
                    </div>

                    {/* Stock indicator */}
                    {product.stock < 20 && (
                      <div className="absolute bottom-2 right-2">
                        <Badge variant="outline" className="bg-white/90 text-orange-600 text-xs border-orange-200">
                          Kam qoldi: {product.stock}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3 sm:p-4">
                    <div className="text-xs text-emerald-600 font-medium mb-1">
                      {product.category.icon} {product.category.nameUz}
                    </div>
                    <h3 className="font-bold text-sm sm:text-base text-gray-900 mb-2 line-clamp-2 min-h-[2.5rem]">
                      {product.nameUz}
                    </h3>

                    <div className="flex items-end justify-between">
                      <div>
                        <div className="text-lg sm:text-xl font-bold text-emerald-700">
                          {formatPrice(product.price)}
                        </div>
                        <div className="text-xs text-gray-400">
                          /{product.unit}
                          {product.oldPrice && (
                            <span className="ml-2 line-through text-gray-400">
                              {formatPrice(product.oldPrice)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Add to Cart Button */}
                      <AnimatePresence mode="wait">
                        {quantity === 0 ? (
                          <motion.div
                            key="add"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                          >
                            <Button
                              size="sm"
                              className={cn(
                                'rounded-xl w-10 h-10 p-0 shadow-md',
                                'bg-emerald-600 hover:bg-emerald-700 text-white'
                              )}
                              onClick={() => handleAdd(product)}
                            >
                              <Plus className="h-5 w-5" />
                            </Button>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="quantity"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex items-center gap-1"
                          >
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-lg w-8 h-8 p-0 border-emerald-300 hover:bg-emerald-50"
                              onClick={() => updateQuantity(product.id, quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center font-bold text-emerald-700 text-sm">
                              {quantity}
                            </span>
                            <Button
                              size="sm"
                              className="rounded-lg w-8 h-8 p-0 bg-emerald-600 hover:bg-emerald-700 text-white"
                              onClick={() => updateQuantity(product.id, quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </section>
  )
}
