import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ========== TYPES ==========
export interface Category {
  id: string
  nameUz: string
  icon: string
  isActive: boolean
}

export interface Product {
  id: string
  name: string
  nameUz: string
  price: number
  oldPrice: number | null
  unit: string
  image: string
  isActive: boolean
  isFeatured: boolean
  categoryId: string
}

export interface Warehouse {
  id: string
  name: string
  address: string
  district: string
  isActive: boolean
}

export interface WarehouseStock {
  id: string
  warehouseId: string
  productId: string
  quantity: number
}

export interface OrderItem {
  id: string
  productId: string
  productName: string
  productImage: string
  price: number
  quantity: number
  unit: string
}

export interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerPhone: string
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled'
  totalAmount: number
  createdAt: string
  items: OrderItem[]
  warehouseId: string | null
  pickupTime: string | null
}

// ========== DEFAULT DATA ==========
const defaultCategories: Category[] = [
  { id: 'cat-1', nameUz: 'Sabzavotlar', icon: '🥕', isActive: true },
  { id: 'cat-2', nameUz: 'Mevalar', icon: '🍎', isActive: true },
  { id: 'cat-3', nameUz: "Quritilgan mevalar", icon: '🥜', isActive: true },
  { id: 'cat-4', nameUz: "Ko'katlar", icon: '🥬', isActive: true },
]

// ========== HELPERS ==========
function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// ========== STORE INTERFACE ==========
interface DataStore {
  // Data
  categories: Category[]
  products: Product[]
  warehouses: Warehouse[]
  warehouseStock: WarehouseStock[]
  orders: Order[]

  // Category actions
  addCategory: (category: Omit<Category, 'id'>) => string

  // Product actions
  addProduct: (product: Omit<Product, 'id'>) => string
  updateProduct: (id: string, updates: Partial<Product>) => void
  deleteProduct: (id: string) => void

  // Warehouse actions
  addWarehouse: (warehouse: Omit<Warehouse, 'id'>) => string
  updateWarehouse: (id: string, updates: Partial<Warehouse>) => void
  deleteWarehouse: (id: string) => void

  // Stock actions
  addStock: (warehouseId: string, productId: string, quantity: number) => void
  removeStock: (warehouseId: string, productId: string) => void
  transferStock: (fromWarehouseId: string, toWarehouseId: string, productId: string, quantity: number) => boolean

  // Order actions
  addOrder: (order: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'status'>) => Order
  updateOrderStatus: (orderId: string, status: Order['status'], warehouseId?: string, pickupTime?: string) => void

  // Helper getters
  getProduct: (id: string) => Product | undefined
  getProductsForCustomer: () => CustomerProduct[]
  getWarehouseStock: (warehouseId: string) => WarehouseStockItem[]
  getTotalStockForProduct: (productId: string) => number
  getWarehousesForProduct: (productId: string) => { name: string; address: string }[]
  getWarehouseById: (id: string) => Warehouse | undefined
}

// ========== CUSTOMER PRODUCT TYPE ==========
export interface CustomerProduct {
  id: string
  name: string
  nameUz: string
  price: number
  oldPrice: number | null
  unit: string
  image: string
  stock: number
  isFeatured: boolean
  category: { id: string; name: string; nameUz: string; icon: string }
  warehouses: { name: string; address: string }[]
}

// ========== WAREHOUSE STOCK ITEM TYPE ==========
export interface WarehouseStockItem {
  id: string
  quantity: number
  product: {
    id: string
    nameUz: string
    price: number
    unit: string
    image: string
    category: { icon: string; nameUz: string }
  }
}

// ========== STORE ==========
export const useDataStore = create<DataStore>()(
  persist(
    (set, get) => ({
      // Initial data
      categories: defaultCategories,
      products: [],
      warehouses: [],
      warehouseStock: [],
      orders: [],

      // ========== CATEGORY ACTIONS ==========
      addCategory: (category) => {
        const id = generateId('cat')
        set((state) => ({
          categories: [...state.categories, { ...category, id }],
        }))
        return id
      },

      // ========== PRODUCT ACTIONS ==========
      addProduct: (product) => {
        const id = generateId('prod')
        set((state) => ({
          products: [...state.products, { ...product, id }],
        }))
        return id
      },

      updateProduct: (id, updates) => {
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        }))
      },

      deleteProduct: (id) => {
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
          warehouseStock: state.warehouseStock.filter((s) => s.productId !== id),
        }))
      },

      // ========== WAREHOUSE ACTIONS ==========
      addWarehouse: (warehouse) => {
        const id = generateId('wh')
        set((state) => ({
          warehouses: [...state.warehouses, { ...warehouse, id }],
        }))
        return id
      },

      updateWarehouse: (id, updates) => {
        set((state) => ({
          warehouses: state.warehouses.map((w) =>
            w.id === id ? { ...w, ...updates } : w
          ),
        }))
      },

      deleteWarehouse: (id) => {
        set((state) => ({
          warehouses: state.warehouses.filter((w) => w.id !== id),
          warehouseStock: state.warehouseStock.filter((s) => s.warehouseId !== id),
        }))
      },

      // ========== STOCK ACTIONS ==========
      addStock: (warehouseId, productId, quantity) => {
        set((state) => {
          const existing = state.warehouseStock.find(
            (s) => s.warehouseId === warehouseId && s.productId === productId
          )
          if (existing) {
            return {
              warehouseStock: state.warehouseStock.map((s) =>
                s.id === existing.id
                  ? { ...s, quantity: s.quantity + quantity }
                  : s
              ),
            }
          }
          return {
            warehouseStock: [
              ...state.warehouseStock,
              {
                id: generateId('stock'),
                warehouseId,
                productId,
                quantity,
              },
            ],
          }
        })
      },

      removeStock: (warehouseId, productId) => {
        set((state) => ({
          warehouseStock: state.warehouseStock.filter(
            (s) => !(s.warehouseId === warehouseId && s.productId === productId)
          ),
        }))
      },

      transferStock: (fromWarehouseId, toWarehouseId, productId, quantity) => {
        const state = get()
        const fromStock = state.warehouseStock.find(
          (s) => s.warehouseId === fromWarehouseId && s.productId === productId
        )
        if (!fromStock || fromStock.quantity < quantity) {
          return false
        }

        set((state) => {
          let updated = state.warehouseStock.map((s) =>
            s.id === fromStock.id
              ? { ...s, quantity: s.quantity - quantity }
              : s
          )

          const existing = updated.find(
            (s) => s.warehouseId === toWarehouseId && s.productId === productId
          )
          if (existing) {
            updated = updated.map((s) =>
              s.id === existing.id
                ? { ...s, quantity: s.quantity + quantity }
                : s
            )
          } else {
            updated = [
              ...updated,
              {
                id: generateId('stock'),
                warehouseId: toWarehouseId,
                productId,
                quantity,
              },
            ]
          }

          return { warehouseStock: updated }
        })
        return true
      },

      // ========== ORDER ACTIONS ==========
      addOrder: (orderData) => {
        const state = get()
        const orderCount = state.orders.length
        const orderNumber = `PK-${String(orderCount + 1).padStart(5, '0')}`
        const order: Order = {
          ...orderData,
          id: generateId('order'),
          orderNumber,
          createdAt: new Date().toISOString(),
          status: 'pending',
        }

        // Decrease stock for each item
        for (const item of orderData.items) {
          const stockEntry = state.warehouseStock.find((s) => s.productId === item.productId)
          if (stockEntry) {
            set((s) => ({
              warehouseStock: s.warehouseStock.map((ws) =>
                ws.id === stockEntry.id
                  ? { ...ws, quantity: Math.max(0, ws.quantity - item.quantity) }
                  : ws
              ),
            }))
          }
        }

        set((state) => ({
          orders: [order, ...state.orders],
        }))
        return order
      },

      updateOrderStatus: (orderId, status, warehouseId, pickupTime) => {
        set((state) => ({
          orders: state.orders.map((o) => {
            if (o.id !== orderId) return o
            const updated = { ...o, status }
            if (warehouseId !== undefined) updated.warehouseId = warehouseId
            if (pickupTime !== undefined) updated.pickupTime = pickupTime
            return updated
          }),
        }))
      },

      // ========== HELPERS ==========
      getProduct: (id) => {
        return get().products.find((p) => p.id === id)
      },

      getProductsForCustomer: () => {
        const state = get()
        return state.products
          .filter((p) => p.isActive)
          .map((p) => {
            const productStocks = state.warehouseStock.filter(
              (s) => s.productId === p.id && s.quantity > 0
            )
            const totalStock = productStocks.reduce((sum, s) => sum + s.quantity, 0)
            const category = state.categories.find((c) => c.id === p.categoryId)
            const warehouses = productStocks
              .map((s) => {
                const wh = state.warehouses.find((w) => w.id === s.warehouseId)
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
              warehouses,
            }
          })
          .filter((p) => p.stock > 0)
      },

      getWarehouseStock: (warehouseId) => {
        const state = get()
        return state.warehouseStock
          .filter((s) => s.warehouseId === warehouseId)
          .map((s) => {
            const product = state.products.find((p) => p.id === s.productId)
            const category = product
              ? state.categories.find((c) => c.id === product.categoryId)
              : null
            return {
              id: s.id,
              quantity: s.quantity,
              product: {
                id: product?.id || '',
                nameUz: product?.nameUz || '',
                price: product?.price || 0,
                unit: product?.unit || '',
                image: product?.image || '',
                category: {
                  icon: category?.icon || '',
                  nameUz: category?.nameUz || '',
                },
              },
            }
          })
      },

      getTotalStockForProduct: (productId) => {
        return get()
          .warehouseStock.filter((s) => s.productId === productId)
          .reduce((sum, s) => sum + s.quantity, 0)
      },

      getWarehousesForProduct: (productId) => {
        const state = get()
        return state.warehouseStock
          .filter((s) => s.productId === productId && s.quantity > 0)
          .map((s) => {
            const wh = state.warehouses.find((w) => w.id === s.warehouseId)
            if (!wh) return null
            return { name: wh.name, address: wh.address }
          })
          .filter(Boolean) as { name: string; address: string }[]
      },

      getWarehouseById: (id) => {
        return get().warehouses.find((w) => w.id === id)
      },
    }),
    {
      name: 'darkstore-data',
      partialize: (state) => ({
        categories: state.categories,
        products: state.products,
        warehouses: state.warehouses,
        warehouseStock: state.warehouseStock,
        orders: state.orders,
      }),
    }
  )
)
