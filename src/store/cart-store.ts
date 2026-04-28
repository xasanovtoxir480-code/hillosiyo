import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string
  productId: string
  productName: string
  productImage: string
  price: number
  quantity: number
  unit: string
  categoryId: string
  categoryIcon: string
  maxStock: number
}

export interface WarehouseInfo {
  name: string
  address: string
}

interface CartStore {
  items: CartItem[]
  isCartOpen: boolean
  currentView: 'shop' | 'cart' | 'checkout' | 'order-success' | 'admin'
  selectedCategory: string
  searchQuery: string
  orderSuccessData: { orderNumber: string; warehouseName: string; warehouseAddress: string; pickupTime: string } | null
  warehouseInfo: WarehouseInfo | null

  // Cart actions
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
  getItemCount: () => number

  // UI actions
  setCartOpen: (open: boolean) => void
  setCurrentView: (view: CartStore['currentView']) => void
  setSelectedCategory: (category: string) => void
  setSearchQuery: (query: string) => void
  setOrderSuccessData: (data: CartStore['orderSuccessData']) => void
  setWarehouseInfo: (info: WarehouseInfo | null) => void
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isCartOpen: false,
      currentView: 'shop',
      selectedCategory: 'all',
      searchQuery: '',
      orderSuccessData: null,
      warehouseInfo: null,

      addItem: (item) => {
        const { items } = get()
        const existingItem = items.find((i) => i.productId === item.productId)
        const maxStock = item.maxStock || 999

        if (existingItem) {
          if (existingItem.quantity >= maxStock) return // stock limit
          set({
            items: items.map((i) =>
              i.productId === item.productId
                ? { ...i, quantity: Math.min(i.quantity + 1, maxStock) }
                : i
            ),
          })
        } else {
          if (maxStock <= 0) return // no stock
          set({ items: [...items, { ...item, quantity: 1 }] })
        }
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.productId !== productId) })
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }
        const item = get().items.find((i) => i.productId === productId)
        const maxStock = item?.maxStock || 999
        set({
          items: get().items.map((i) =>
            i.productId === productId ? { ...i, quantity: Math.min(quantity, maxStock) } : i
          ),
        })
      },

      clearCart: () => set({ items: [], warehouseInfo: null }),

      getTotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0)
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0)
      },

      setCartOpen: (open) => set({ isCartOpen: open }),
      setCurrentView: (view) => set({ currentView: view }),
      setSelectedCategory: (category) => set({ selectedCategory: category }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setOrderSuccessData: (data) => set({ orderSuccessData: data }),
      setWarehouseInfo: (info) => set({ warehouseInfo: info }),
    }),
    {
      name: 'darkstore-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
)
