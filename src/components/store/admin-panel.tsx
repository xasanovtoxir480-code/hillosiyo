'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Package,
  ShoppingCart,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  Settings,
  BarChart3,
  TrendingUp,
  Users,
  Warehouse,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useCartStore } from '@/store/cart-store'
import { formatPrice, formatDate } from '@/lib/format'

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerPhone: string
  status: string
  totalAmount: number
  createdAt: string
  items: OrderItem[]
  warehouse: { name: string; address: string } | null
  pickupTime: string | null
}

interface OrderItem {
  id: string
  productName: string
  productImage: string
  price: number
  quantity: number
  unit: string
}

interface Warehouse {
  id: string
  name: string
  address: string
  district: string
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'Kutilmoqda', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: <Clock className="h-3 w-3" /> },
  preparing: { label: 'Tayyorlanmoqda', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: <Loader2 className="h-3 w-3" /> },
  ready: { label: 'Tayyor', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: <CheckCircle2 className="h-3 w-3" /> },
  cancelled: { label: 'Bekor qilindi', color: 'bg-red-100 text-red-700 border-red-200', icon: <XCircle className="h-3 w-3" /> },
  completed: { label: 'Topshirildi', color: 'bg-gray-100 text-gray-700 border-gray-200', icon: <CheckCircle2 className="h-3 w-3" /> },
}

export function AdminPanel() {
  const { setCurrentView } = useCartStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [ordersRes, warehousesRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/warehouses'),
      ])
      const ordersData = await ordersRes.json()
      const warehousesData = await warehousesRes.json()
      setOrders(ordersData.orders || [])
      setWarehouses(warehousesData.warehouses || [])
    } catch (err) {
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const updateOrderStatus = async (orderId: string, status: string, warehouseId?: string) => {
    try {
      const body: Record<string, string> = { orderId, status }
      if (warehouseId) body.warehouseId = warehouseId
      if (status === 'ready') {
        body.pickupTime = new Date(Date.now() + 30 * 60000).toISOString()
      }

      await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      fetchData()
    } catch (err) {
      console.error('Update error:', err)
    }
  }

  // Stats
  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0)
  const pendingOrders = orders.filter((o) => o.status === 'pending').length
  const readyOrders = orders.filter((o) => o.status === 'ready').length
  const totalOrders = orders.length

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50"
    >
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setCurrentView('shop')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Admin Panel
              </h1>
              <p className="text-xs text-gray-500">Buyurtma va mahsulot boshqaruvi</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl"
            onClick={fetchData}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Yangilash
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: 'Jami buyurtmalar', value: totalOrders, icon: <ShoppingCart className="h-5 w-5" />, color: 'text-blue-600 bg-blue-50' },
            { title: 'Kutilmoqda', value: pendingOrders, icon: <Clock className="h-5 w-5" />, color: 'text-amber-600 bg-amber-50' },
            { title: 'Tayyor', value: readyOrders, icon: <CheckCircle2 className="h-5 w-5" />, color: 'text-emerald-600 bg-emerald-50' },
            { title: "Umumiy daromad", value: formatPrice(totalRevenue), icon: <TrendingUp className="h-5 w-5" />, color: 'text-purple-600 bg-purple-50' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2.5 rounded-xl ${stat.color}`}>{stat.icon}</div>
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.title}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Warehouses */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Warehouse className="h-5 w-5 text-emerald-600" />
              Omborlar ({warehouses.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {warehouses.map((wh) => (
                <div key={wh.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                  <MapPin className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">{wh.name}</p>
                    <p className="text-xs text-gray-500">{wh.district}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{wh.address}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Orders */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-5 w-5 text-emerald-600" />
              Buyurtmalar ({orders.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Hali buyurtma yo&apos;q</p>
              </div>
            ) : (
              <ScrollArea className="max-h-[600px]">
                <div className="space-y-3">
                  {orders.map((order) => {
                    const status = statusConfig[order.status] || statusConfig.pending
                    const isExpanded = expandedOrder === order.id

                    return (
                      <motion.div
                        key={order.id}
                        layout
                        className="border rounded-xl overflow-hidden"
                      >
                        {/* Order Header */}
                        <button
                          className="w-full text-left p-4 hover:bg-gray-50 transition-colors"
                          onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div>
                                <p className="font-bold">{order.orderNumber}</p>
                                <p className="text-xs text-gray-500">{order.customerName} • {order.customerPhone}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-emerald-700 text-sm">{formatPrice(order.totalAmount)}</span>
                              <Badge variant="outline" className={status.color}>
                                {status.icon}
                                <span className="ml-1">{status.label}</span>
                              </Badge>
                            </div>
                          </div>
                          <p className="text-xs text-gray-400 mt-2">{formatDate(order.createdAt)}</p>
                        </button>

                        {/* Expanded Content */}
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            className="border-t bg-gray-50"
                          >
                            <div className="p-4 space-y-4">
                              {/* Items */}
                              <div>
                                <p className="text-sm font-semibold mb-2">Mahsulotlar:</p>
                                <div className="space-y-2">
                                  {order.items.map((item) => (
                                    <div key={item.id} className="flex justify-between text-sm">
                                      <span className="text-gray-600">
                                        {item.productName} × {item.quantity} {item.unit}
                                      </span>
                                      <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <Separator />

                              {/* Warehouse */}
                              {order.warehouse && (
                                <div className="flex items-start gap-2 text-sm">
                                  <MapPin className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                                  <span>{order.warehouse.name} — {order.warehouse.address}</span>
                                </div>
                              )}

                              {/* Actions */}
                              <div className="flex flex-wrap gap-2">
                                {order.status === 'pending' && (
                                  <>
                                    <Button
                                      size="sm"
                                      className="bg-blue-600 hover:bg-blue-700 rounded-lg"
                                      onClick={() => updateOrderStatus(order.id, 'preparing')}
                                    >
                                      <Loader2 className="h-3 w-3 mr-1" />
                                      Tayyorlashni boshlash
                                    </Button>
                                    {warehouses.map((wh) => (
                                      <Button
                                        key={wh.id}
                                        size="sm"
                                        variant="outline"
                                        className="rounded-lg text-xs"
                                        onClick={() => updateOrderStatus(order.id, 'preparing', wh.id)}
                                      >
                                        <MapPin className="h-3 w-3 mr-1" />
                                        {wh.name}
                                      </Button>
                                    ))}
                                  </>
                                )}
                                {order.status === 'preparing' && (
                                  <Button
                                    size="sm"
                                    className="bg-emerald-600 hover:bg-emerald-700 rounded-lg"
                                    onClick={() => updateOrderStatus(order.id, 'ready')}
                                  >
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Tayyor deb belgilash
                                  </Button>
                                )}
                                {order.status === 'ready' && (
                                  <Button
                                    size="sm"
                                    className="bg-gray-600 hover:bg-gray-700 rounded-lg"
                                    onClick={() => updateOrderStatus(order.id, 'completed')}
                                  >
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Topshirildi
                                  </Button>
                                )}
                                {(order.status === 'pending' || order.status === 'preparing') && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-600 border-red-200 hover:bg-red-50 rounded-lg"
                                    onClick={() => updateOrderStatus(order.id, 'cancelled')}
                                  >
                                    <XCircle className="h-3 w-3 mr-1" />
                                    Bekor qilish
                                  </Button>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    )
                  })}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}
