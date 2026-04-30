'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { formatPrice } from '@/lib/format'
import { Plus, Minus, Star, Search, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useCartStore } from '@/store/cart-store'
import { useDataStore, type CustomerProduct } from '@/store/data-store'
import { useToast } from '@/hooks/use-toast'

interface ProductGridProps {
  categoryId: string
  searchQuery: string
}

export function ProductGrid({ categoryId, searchQuery }: ProductGridProps) {
  const items = useCartStore((s) => s.items)
  const addItem = useCartStore((s) => s.addItem)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const { toast } = useToast()

  // Subscribe to raw state (not derived values) to avoid infinite loop
  const products = useDataStore((s) => s.products)
  const warehouseStock = useDataStore((s) => s.warehouseStock)
  const categories = useDataStore((s) => s.categories)
  const warehouses = useDataStore((s) => s.warehouses)

  // Compute customer-visible products in useMemo
  const allProducts = useMemo(() => {
    return products
      .filter((p) => p.isActive)
      .map((p) => {
        const productStocks = warehouseStock.filter(
          (s) => s.productId === p.id && s.quantity > 0
        )
        const totalStock = productStocks.reduce((sum, s) => sum + s.quantity, 0)
        const category = categories.find((c) => c.id === p.categoryId)
        const whs = productStocks
          .map((s) => {
            const wh = warehouses.find((w) => w.id === s.warehouseId)
            if (!wh) return null
            return { name: wh.name, address: wh.address }
          })
          .filter(Boolean) as { name: string; address: string }[]

        return {
          id: p.id,
          name: p.name,
          nameUz: p.nameUz,
          price: p.price,
          oldPrice: p.oldPrice,
          unit: p.unit,
          image: p.image,
          stock: totalStock,
          isFeatured: p.isFeatured,
          category: {
            id: category?.id || '',
            name: category?.nameUz || '',
            nameUz: category?.nameUz || '',
            icon: category?.icon || '📦',
          },
          warehouses: whs,
        }
      })
      .filter((p) => p.stock > 0)
  }, [products, warehouseStock, categories, warehouses])

  // Filter by category and search
  const filteredProducts = useMemo(() => {
    let filtered = allProducts
    if (categoryId && categoryId !== 'all') {
      filtered = filtered.filter((p) => p.category.id === categoryId)
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.nameUz.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q)
      )
    }
    return filtered
  }, [allProducts, categoryId, searchQuery])

  const getQuantity = (productId: string) => {
    return items.find((i) => i.productId === productId)?.quantity || 0
  }

  const handleAdd = (product: CustomerProduct) => {
    const currentQty = getQuantity(product.id)
    const stock = product.stock

    if (currentQty >= stock) {
      toast({
        title: 'Zaxira yetarli emas',
        description: `Omborda faqat ${stock} ${product.unit} mavjud`,
        variant: 'destructive',
        duration: 2000,
      })
      return
    }

    // Find the warehouse with the most stock for this product
    const warehouseInfo = product.warehouses?.[0] || null
    if (warehouseInfo) {
      useCartStore.getState().setWarehouseInfo(warehouseInfo)
    }

    addItem({
      id: product.id,
      productId: product.id,
      productName: product.nameUz,
      productImage: product.image,
      price: product.price,
      unit: product.unit,
      categoryId: product.category.id,
      categoryIcon: product.category.icon,
      maxStock: stock,
    })
    toast({
      title: `${product.category.icon} ${product.nameUz}`,
      description: 'Savatga qo\'shildi',
      duration: 2000,
    })
  }

  // Add multiple units at once (e.g., +5 kg, +10 kg)
  const handleAddMultiple = (product: CustomerProduct, qty: number) => {
    const currentQty = getQuantity(product.id)
    const stock = product.stock
    const addQty = Math.min(qty, stock - currentQty)

    if (addQty <= 0) {
      toast({
        title: 'Zaxira yetarli emas',
        description: `Omborda faqat ${stock} ${product.unit} mavjud`,
        variant: 'destructive',
        duration: 2000,
      })
      return
    }

    const warehouseInfo = product.warehouses?.[0] || null
    if (warehouseInfo) {
      useCartStore.getState().setWarehouseInfo(warehouseInfo)
    }

    // Set quantity directly
    const newQty = currentQty + addQty
    updateQuantity(product.id, newQty)
    toast({
      title: `${product.category.icon} ${product.nameUz}`,
      description: `+${addQty} ${product.unit} savatga qo'shildi`,
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

      {/* No Products */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-bold text-gray-700">Hozircha mahsulot yo&apos;q</h3>
          <p className="text-gray-500 mt-2">Ombor mahsulotlari qo&apos;shilganda shu yerda ko&apos;rinadi</p>
        </div>
      )}

      {/* Products */}
      {filteredProducts.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredProducts.map((product) => {
            const quantity = getQuantity(product.id)
            const stock = product.stock
            const isMaxed = quantity >= stock
            const discount = product.oldPrice
              ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
              : 0

            return (
              <div
                key={product.id}
                className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-300"
              >
                {/* Image */}
                <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden rounded-t-2xl">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.nameUz}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : null}
                  {!product.image && (
                    <div className="w-full h-full flex items-center justify-center text-6xl absolute inset-0">
                      {product.category.icon}
                    </div>
                  )}

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
                  <div className="absolute bottom-2 right-2">
                    <Badge variant="outline" className={cn(
                      'text-xs px-2 py-0.5',
                      stock <= 5
                        ? 'bg-red-100 text-red-700 border-red-200'
                        : stock <= 20
                          ? 'bg-orange-100 text-orange-700 border-orange-200'
                          : 'bg-white/90 text-emerald-700 border-emerald-200'
                    )}>
                      <Package className="h-3 w-3 mr-0.5" />
                      {stock} {product.unit}
                    </Badge>
                  </div>
                </div>

                {/* Info */}
                <div className="p-3 sm:p-4">
                  <div className="text-xs text-emerald-600 font-medium mb-1">
                    {product.category.icon} {product.category.nameUz}
                  </div>
                  <h3 className="font-bold text-sm sm:text-base text-gray-900 mb-2 line-clamp-2 min-h-[2.5rem]">
                    {product.nameUz}
                  </h3>

                  {/* Warehouse info */}
                  {product.warehouses?.[0]?.name && (
                    <p className="text-xs text-gray-400 mb-2 truncate">
                      📍 {product.warehouses[0].name}
                    </p>
                  )}

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
                    {quantity === 0 ? (
                      <button
                        type="button"
                        className={cn(
                          'rounded-xl w-10 h-10 flex items-center justify-center shadow-md transition-colors',
                          stock <= 0
                            ? 'bg-gray-300 cursor-not-allowed'
                            : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white'
                        )}
                        onClick={() => handleAdd(product)}
                        disabled={stock <= 0}
                      >
                        <Plus className="h-5 w-5" />
                      </button>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            className="rounded-lg w-8 h-8 flex items-center justify-center border border-emerald-300 hover:bg-emerald-50 active:bg-emerald-100 transition-colors"
                            onClick={() => updateQuantity(product.id, quantity - 1)}
                          >
                            <Minus className="h-3 w-3 text-emerald-700" />
                          </button>
                          <span className="w-8 text-center font-bold text-emerald-700 text-sm">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            className={cn(
                              'rounded-lg w-8 h-8 flex items-center justify-center transition-colors',
                              isMaxed
                                ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                                : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white'
                            )}
                            onClick={() => handleAdd(product)}
                            disabled={isMaxed}
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        {/* Quick add buttons */}
                        <div className="flex gap-1">
                          {[3, 5, 10].map((qty) => {
                            const wouldExceed = quantity + qty > stock
                            return (
                              <button
                                key={qty}
                                type="button"
                                disabled={wouldExceed || isMaxed}
                                className={cn(
                                  'flex-1 rounded-md py-1 text-[10px] font-semibold transition-colors',
                                  wouldExceed || isMaxed
                                    ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 active:bg-emerald-200'
                                )}
                                onClick={(e) => { e.stopPropagation(); handleAddMultiple(product, qty) }}
                              >
                                +{qty}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
