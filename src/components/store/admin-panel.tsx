'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  TrendingUp,
  Warehouse,
  Plus,
  Trash2,
  LogOut,
  Lock,
  Eye,
  ArrowRightLeft,
  ChevronRight,
  AlertCircle,
  Search,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCartStore } from '@/store/cart-store'
import { formatPrice, formatDate } from '@/lib/format'
import { useToast } from '@/hooks/use-toast'

// ========== TYPES ==========
interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerPhone: string
  status: string
  totalAmount: number
  createdAt: string
  items: OrderItem[]
  warehouse: { id: string; name: string; address: string } | null
  pickupTime: string | null
}

interface OrderItem {
  id: string
  productName: string
  productImage: string
  price: number
  quantity: number
  unit: string
  productId: string
}

interface Warehouse {
  id: string
  name: string
  address: string
  district: string
  isActive: boolean
  _count?: { stock: number; orders: number }
}

interface WarehouseStockItem {
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

interface Product {
  id: string
  nameUz: string
  price: number
  unit: string
  image: string
  stock: number
  category: { icon: string; nameUz: string }
}

// ========== CONSTANTS ==========
const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'Kutilmoqda', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: <Clock className="h-3 w-3" /> },
  preparing: { label: 'Tayyorlanmoqda', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: <Loader2 className="h-3 w-3" /> },
  ready: { label: 'Tayyor', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: <CheckCircle2 className="h-3 w-3" /> },
  cancelled: { label: 'Bekor qilindi', color: 'bg-red-100 text-red-700 border-red-200', icon: <XCircle className="h-3 w-3" /> },
  completed: { label: 'Topshirildi', color: 'bg-gray-100 text-gray-700 border-gray-200', icon: <CheckCircle2 className="h-3 w-3" /> },
}

type AdminTab = 'orders' | 'warehouses' | 'create-order' | 'transfer'

// ========== LOGIN SCREEN ==========
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()

      if (data.success) {
        localStorage.setItem('admin-token', data.token)
        toast({ title: 'Xush kelibsiz, Admin!' })
        onLogin()
      } else {
        setError(data.error || "Login xatosi")
      }
    } catch {
      setError('Server bilan aloqada xatolik')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-600/25">
            <Lock className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
          <p className="text-slate-400 mt-2">PickUp Market boshqaruv tizimiga kirish</p>
        </div>

        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-xl">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-slate-300">Login</Label>
                <Input
                  id="username"
                  placeholder="Foydalanuvchi nomi"
                  className="h-12 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 rounded-xl"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">Parol</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Parol"
                  className="h-12 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 rounded-xl"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-xl">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 rounded-xl font-semibold text-base"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Tekshirilmoqda...
                  </div>
                ) : (
                  'Kirish'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

// ========== WAREHOUSE DETAIL VIEW ==========
function WarehouseDetail({
  warehouse,
  onBack,
  warehouses,
}: {
  warehouse: Warehouse
  onBack: () => void
  warehouses: Warehouse[]
}) {
  const [stock, setStock] = useState<WarehouseStockItem[]>([])
  const [loading, setLoading] = useState(true)
  const [addProductOpen, setAddProductOpen] = useState(false)
  const [transferOpen, setTransferOpen] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const { toast } = useToast()

  // Add product state
  const [addProductId, setAddProductId] = useState('')
  const [addQuantity, setAddQuantity] = useState('')

  // Transfer state
  const [transferProductId, setTransferProductId] = useState('')
  const [transferQuantity, setTransferQuantity] = useState('')
  const [transferToWarehouse, setTransferToWarehouse] = useState('')

  const fetchStock = useCallback(async () => {
    try {
      const res = await fetch(`/api/stock?warehouseId=${warehouse.id}`)
      const data = await res.json()
      setStock(data.stock || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [warehouse.id])

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/products')
      const data = await res.json()
      setProducts(data.products || [])
    } catch (err) {
      console.error(err)
    }
  }, [])

  useEffect(() => {
    fetchStock()
    fetchProducts()
  }, [fetchStock, fetchProducts])

  const handleAddProduct = async () => {
    if (!addProductId || !addQuantity || parseInt(addQuantity) <= 0) {
      toast({ title: 'Mahsulot va miqdorni kiriting', variant: 'destructive' })
      return
    }
    try {
      const res = await fetch('/api/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          warehouseId: warehouse.id,
          productId: addProductId,
          quantity: parseInt(addQuantity),
        }),
      })
      if (res.ok) {
        toast({ title: 'Mahsulot qo\'shildi!' })
        setAddProductOpen(false)
        setAddProductId('')
        setAddQuantity('')
        fetchStock()
      }
    } catch {
      toast({ title: 'Xatolik yuz berdi', variant: 'destructive' })
    }
  }

  const handleTransfer = async () => {
    if (!transferProductId || !transferQuantity || !transferToWarehouse) {
      toast({ title: 'Barcha maydonlarni to\'ldiring', variant: 'destructive' })
      return
    }
    try {
      const res = await fetch('/api/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromWarehouseId: warehouse.id,
          toWarehouseId: transferToWarehouse,
          productId: transferProductId,
          quantity: parseInt(transferQuantity),
        }),
      })
      const data = await res.json()
      if (res.ok) {
        toast({ title: 'Muvaffaqiyatli o\'tkazildi!', description: data.message })
        setTransferOpen(false)
        setTransferProductId('')
        setTransferQuantity('')
        setTransferToWarehouse('')
        fetchStock()
      } else {
        toast({ title: data.error || 'Xatolik', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Xatolik yuz berdi', variant: 'destructive' })
    }
  }

  const otherWarehouses = warehouses.filter((w) => w.id !== warehouse.id)
  const availableStockProducts = stock.filter((s) => s.quantity > 0)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" className="rounded-full" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Warehouse className="h-5 w-5 text-emerald-600" />
            {warehouse.name}
          </h2>
          <p className="text-sm text-gray-500">{warehouse.address} • {warehouse.district}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <Package className="h-4 w-4" />
              <span className="text-xs font-medium">Mahsulot turlari</span>
            </div>
            <p className="text-2xl font-bold">{stock.filter((s) => s.quantity > 0).length}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-emerald-600 mb-1">
              <ShoppingCart className="h-4 w-4" />
              <span className="text-xs font-medium">Jami dona/kg</span>
            </div>
            <p className="text-2xl font-bold">{stock.reduce((s, i) => s + i.quantity, 0)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mb-6">
        <Dialog open={addProductOpen} onOpenChange={setAddProductOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 rounded-xl">
              <Plus className="h-4 w-4 mr-2" /> Mahsulot qo'shish
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Omborga mahsulot qo'shish</DialogTitle>
              <DialogDescription>{warehouse.name}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Mahsulot</Label>
                <Select value={addProductId} onValueChange={setAddProductId}>
                  <SelectTrigger><SelectValue placeholder="Mahsulot tanlang" /></SelectTrigger>
                  <SelectContent className="max-h-60">
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.category.icon} {p.nameUz} — {formatPrice(p.price)}/{p.unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Miqdor</Label>
                <Input type="number" min="1" placeholder="Miqdor" value={addQuantity} onChange={(e) => setAddQuantity(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddProductOpen(false)}>Bekor qilish</Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleAddProduct}>Qo'shish</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="rounded-xl border-emerald-300 text-emerald-700 hover:bg-emerald-50">
              <ArrowRightLeft className="h-4 w-4 mr-2" /> O'tkazish
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Mahsulot o'tkazish</DialogTitle>
              <DialogDescription>{warehouse.name} dan boshqa omborga</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Mahsulot (faqat mavjud)</Label>
                <Select value={transferProductId} onValueChange={setTransferProductId}>
                  <SelectTrigger><SelectValue placeholder="Mahsulot tanlang" /></SelectTrigger>
                  <SelectContent className="max-h-60">
                    {availableStockProducts.map((s) => (
                      <SelectItem key={s.product.id} value={s.product.id}>
                        {s.product.category.icon} {s.product.nameUz} (mavjud: {s.quantity})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Miqdor</Label>
                <Input type="number" min="1" placeholder="Miqdor" value={transferQuantity} onChange={(e) => setTransferQuantity(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Qaysi omborga?</Label>
                <Select value={transferToWarehouse} onValueChange={setTransferToWarehouse}>
                  <SelectTrigger><SelectValue placeholder="Ombor tanlang" /></SelectTrigger>
                  <SelectContent>
                    {otherWarehouses.map((w) => (
                      <SelectItem key={w.id} value={w.id}>{w.name} ({w.district})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setTransferOpen(false)}>Bekor qilish</Button>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleTransfer}>O'tkazish</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stock List */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Ombordagi mahsulotlar ({stock.filter((s) => s.quantity > 0).length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-emerald-600" /></div>
          ) : stock.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Package className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Ombor bo&apos;sh</p>
            </div>
          ) : (
            <ScrollArea className="max-h-[500px]">
              <div className="space-y-2">
                {stock
                  .filter((s) => s.quantity > 0)
                  .sort((a, b) => b.quantity - a.quantity)
                  .map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-lg overflow-hidden border">
                          {item.product.image.startsWith('/products/') ? (
                            <img src={item.product.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            item.product.category.icon
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{item.product.category.icon} {item.product.nameUz}</p>
                          <p className="text-xs text-gray-500">{item.product.category.nameUz} • {formatPrice(item.product.price)}/{item.product.unit}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-emerald-700">{item.quantity}</p>
                        <p className="text-xs text-gray-400">{item.product.unit}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ========== CREATE ORDER VIEW ==========
function CreateOrderView({ onCreated }: { onCreated: () => void }) {
  const [products, setProducts] = useState<Product[]>([])
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [selectedWarehouse, setSelectedWarehouse] = useState('')
  const [orderItems, setOrderItems] = useState<{ productId: string; productName: string; productImage: string; price: number; quantity: number; unit: string }[]>([])
  const [addProductOpen, setAddProductOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetch('/api/products').then((r) => r.json()).then((d) => setProducts(d.products || []))
    fetch('/api/warehouses').then((r) => r.json()).then((d) => setWarehouses(d.warehouses || []))
  }, [])

  const addProductToOrder = (product: Product) => {
    const existing = orderItems.find((i) => i.productId === product.id)
    if (existing) {
      setOrderItems(orderItems.map((i) => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i))
    } else {
      setOrderItems([...orderItems, {
        productId: product.id,
        productName: product.nameUz,
        productImage: product.image,
        price: product.price,
        quantity: 1,
        unit: product.unit,
      }])
    }
    toast({ title: `${product.nameUz} qo'shildi`, duration: 1500 })
  }

  const removeItem = (productId: string) => {
    setOrderItems(orderItems.filter((i) => i.productId !== productId))
  }

  const updateQty = (productId: string, qty: number) => {
    if (qty <= 0) return removeItem(productId)
    setOrderItems(orderItems.map((i) => i.productId === productId ? { ...i, quantity: qty } : i))
  }

  const total = orderItems.reduce((s, i) => s + i.price * i.quantity, 0)

  const handleSubmit = async () => {
    if (!customerName.trim() || !customerPhone.trim()) {
      toast({ title: 'Mijoz ma\'lumotlarini kiriting', variant: 'destructive' })
      return
    }
    if (orderItems.length === 0) {
      toast({ title: 'Mahsulot qo\'shing', variant: 'destructive' })
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerPhone,
          items: orderItems,
          totalAmount: total,
          warehouseId: selectedWarehouse || undefined,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        toast({ title: `Buyurtma ${data.order.orderNumber} yaratildi!` })
        onCreated()
      } else {
        toast({ title: 'Xatolik', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Xatolik yuz berdi', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter((p) =>
    p.nameUz.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <Plus className="h-5 w-5 text-emerald-600" /> Yangi buyurtma yaratish
      </h2>

      {/* Customer Info */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3"><CardTitle className="text-base">Mijoz ma&apos;lumotlari</CardTitle></CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Ism</Label>
              <Input placeholder="Ism" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="h-11 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Telefon</Label>
              <Input placeholder="+998 90 123 45 67" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="h-11 rounded-xl" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <Label>Ombor (ixtiyoriy)</Label>
            <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
              <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Ombor tanlang" /></SelectTrigger>
              <SelectContent>
                {warehouses.map((w) => (
                  <SelectItem key={w.id} value={w.id}>{w.name} ({w.district})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Add Products */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center justify-between">
            <span>Mahsulot qo&apos;shish</span>
            <Badge variant="secondary">{orderItems.length} ta</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Mahsulot qidirish..." className="pl-10 h-10 rounded-xl" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <ScrollArea className="max-h-48">
            <div className="space-y-1">
              {filteredProducts.slice(0, 20).map((p) => (
                <button
                  key={p.id}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-emerald-50 transition-colors text-left"
                  onClick={() => addProductToOrder(p)}
                >
                  <div className="flex items-center gap-2">
                    <span>{p.category.icon}</span>
                    <span className="text-sm font-medium">{p.nameUz}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-emerald-700">{formatPrice(p.price)}</span>
                    <span className="text-xs text-gray-400">/{p.unit}</span>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Selected Items */}
      {orderItems.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3"><CardTitle className="text-base">Tanlangan mahsulotlar</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {orderItems.map((item) => (
              <div key={item.productId} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{item.productName}</span>
                  <span className="text-xs text-gray-400">{formatPrice(item.price)}/{item.unit}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="h-7 w-7 p-0 rounded" onClick={() => updateQty(item.productId, item.quantity - 1)}>-</Button>
                  <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                  <Button size="sm" variant="outline" className="h-7 w-7 p-0 rounded" onClick={() => updateQty(item.productId, item.quantity + 1)}>+</Button>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500" onClick={() => removeItem(item.productId)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                  <span className="w-20 text-right text-sm font-bold">{formatPrice(item.price * item.quantity)}</span>
                </div>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between items-center pt-2">
              <span className="font-semibold">Jami:</span>
              <span className="text-xl font-bold text-emerald-700">{formatPrice(total)}</span>
            </div>
            <Button
              className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 rounded-xl font-semibold text-base mt-2"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : `Buyurtma qilish — ${formatPrice(total)}`}
            </Button>
          </CardContent>
        </Card>
      )}
    </motion.div>
  )
}

// ========== MAIN ADMIN PANEL ==========
export function AdminPanel() {
  const { setCurrentView } = useCartStore()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [activeTab, setActiveTab] = useState<AdminTab>('orders')
  const [orders, setOrders] = useState<Order[]>([])
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null)

  // Add warehouse dialog
  const [newWhName, setNewWhName] = useState('')
  const [newWhAddress, setNewWhAddress] = useState('')
  const [newWhDistrict, setNewWhDistrict] = useState('')
  const [addWhOpen, setAddWhOpen] = useState(false)

  const { toast } = useToast()

  // Check login on mount
  useEffect(() => {
    const token = localStorage.getItem('admin-token')
    if (token === 'admin-token-pickup-market-2026') {
      setIsLoggedIn(true)
    }
  }, [])

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
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isLoggedIn) fetchData()
  }, [isLoggedIn, fetchData])

  const handleLogout = () => {
    localStorage.removeItem('admin-token')
    setIsLoggedIn(false)
    setCurrentView('shop')
  }

  const updateOrderStatus = async (orderId: string, status: string, warehouseId?: string) => {
    try {
      const body: Record<string, string> = { orderId, status }
      if (warehouseId) body.warehouseId = warehouseId
      if (status === 'ready') body.pickupTime = new Date(Date.now() + 30 * 60000).toISOString()

      await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      fetchData()
    } catch (err) {
      console.error(err)
    }
  }

  const handleAddWarehouse = async () => {
    if (!newWhName.trim() || !newWhAddress.trim() || !newWhDistrict.trim()) {
      toast({ title: "Barcha maydonlarni to'ldiring", variant: 'destructive' })
      return
    }
    try {
      const res = await fetch('/api/warehouses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newWhName, address: newWhAddress, district: newWhDistrict }),
      })
      if (res.ok) {
        toast({ title: 'Ombor qo\'shildi!' })
        setAddWhOpen(false)
        setNewWhName('')
        setNewWhAddress('')
        setNewWhDistrict('')
        fetchData()
      }
    } catch {
      toast({ title: 'Xatolik', variant: 'destructive' })
    }
  }

  const handleDeleteWarehouse = async (whId: string) => {
    try {
      const res = await fetch(`/api/warehouses?id=${whId}`, { method: 'DELETE' })
      const data = await res.json()
      if (res.ok) {
        toast({ title: 'Ombor o\'chirildi' })
        fetchData()
      } else {
        toast({ title: data.error || 'Xatolik', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Xatolik', variant: 'destructive' })
    }
  }

  const totalRevenue = orders.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + o.totalAmount, 0)

  // ========== LOGIN ==========
  if (!isLoggedIn) {
    return <LoginScreen onLogin={() => { setIsLoggedIn(true); fetchData() }} />
  }

  // ========== WAREHOUSE DETAIL ==========
  if (selectedWarehouse) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <WarehouseDetail warehouse={selectedWarehouse} onBack={() => { setSelectedWarehouse(null); fetchData() }} warehouses={warehouses} />
        </div>
      </div>
    )
  }

  // ========== MAIN PANEL ==========
  const tabs: { key: AdminTab; label: string; icon: React.ReactNode }[] = [
    { key: 'orders', label: 'Buyurtmalar', icon: <Package className="h-4 w-4" /> },
    { key: 'warehouses', label: 'Omborlar', icon: <Warehouse className="h-4 w-4" /> },
    { key: 'create-order', label: 'Buyurtma+', icon: <Plus className="h-4 w-4" /> },
    { key: 'transfer', label: "O'tkazish", icon: <ArrowRightLeft className="h-4 w-4" /> },
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setCurrentView('shop')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold flex items-center gap-2">
                <Settings className="h-5 w-5 text-emerald-600" />
                Admin Panel
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="rounded-xl" onClick={fetchData}>
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Yangilash</span>
            </Button>
            <Button variant="outline" size="sm" className="rounded-xl text-red-600 border-red-200 hover:bg-red-50" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 pb-3 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.key
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[
            { title: 'Jami buyurtmalar', value: orders.length, icon: <ShoppingCart className="h-5 w-5" />, color: 'text-blue-600 bg-blue-50' },
            { title: 'Kutilmoqda', value: orders.filter((o) => o.status === 'pending').length, icon: <Clock className="h-5 w-5" />, color: 'text-amber-600 bg-amber-50' },
            { title: 'Tayyor', value: orders.filter((o) => o.status === 'ready').length, icon: <CheckCircle2 className="h-5 w-5" />, color: 'text-emerald-600 bg-emerald-50' },
            { title: 'Daromad', value: formatPrice(totalRevenue), icon: <TrendingUp className="h-5 w-5" />, color: 'text-purple-600 bg-purple-50' },
          ].map((stat, i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className={`p-2 rounded-xl w-fit mb-2 ${stat.color}`}>{stat.icon}</div>
                <p className="text-xl sm:text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.title}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'orders' && (
            <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Package className="h-5 w-5 text-emerald-600" />
                    Buyurtmalar ({orders.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {orders.length === 0 ? (
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
                            <div key={order.id} className="border rounded-xl overflow-hidden">
                              <button className="w-full text-left p-4 hover:bg-gray-50 transition-colors" onClick={() => setExpandedOrder(isExpanded ? null : order.id)}>
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <div>
                                    <p className="font-bold">{order.orderNumber}</p>
                                    <p className="text-xs text-gray-500">{order.customerName} &bull; {order.customerPhone}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-emerald-700 text-sm">{formatPrice(order.totalAmount)}</span>
                                    <Badge variant="outline" className={status.color}>{status.icon}<span className="ml-1">{status.label}</span></Badge>
                                  </div>
                                </div>
                                <p className="text-xs text-gray-400 mt-1">{formatDate(order.createdAt)}</p>
                              </button>

                              {isExpanded && (
                                <div className="border-t bg-gray-50 p-4 space-y-4">
                                  <div className="space-y-1 text-sm">
                                    {order.items.map((item) => (
                                      <div key={item.id} className="flex justify-between">
                                        <span className="text-gray-600">{item.productName} x{item.quantity} {item.unit}</span>
                                        <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                                      </div>
                                    ))}
                                  </div>
                                  <Separator />
                                  {order.warehouse && (
                                    <div className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-emerald-600" /><span>{order.warehouse.name} — {order.warehouse.address}</span></div>
                                  )}
                                  <div className="flex flex-wrap gap-2">
                                    {order.status === 'pending' && (
                                      <>
                                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 rounded-lg" onClick={() => updateOrderStatus(order.id, 'preparing')}>
                                          <Loader2 className="h-3 w-3 mr-1" /> Tayyorlash
                                        </Button>
                                        {warehouses.map((wh) => (
                                          <Button key={wh.id} size="sm" variant="outline" className="rounded-lg text-xs" onClick={() => updateOrderStatus(order.id, 'preparing', wh.id)}>
                                            <MapPin className="h-3 w-3 mr-1" />{wh.name}
                                          </Button>
                                        ))}
                                      </>
                                    )}
                                    {order.status === 'preparing' && (
                                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 rounded-lg" onClick={() => updateOrderStatus(order.id, 'ready')}>
                                        <CheckCircle2 className="h-3 w-3 mr-1" /> Tayyor
                                      </Button>
                                    )}
                                    {order.status === 'ready' && (
                                      <Button size="sm" className="bg-gray-600 hover:bg-gray-700 rounded-lg" onClick={() => updateOrderStatus(order.id, 'completed')}>
                                        <CheckCircle2 className="h-3 w-3 mr-1" /> Topshirildi
                                      </Button>
                                    )}
                                    {(order.status === 'pending' || order.status === 'preparing') && (
                                      <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 rounded-lg" onClick={() => updateOrderStatus(order.id, 'cancelled')}>
                                        <XCircle className="h-3 w-3 mr-1" /> Bekor
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'warehouses' && (
            <motion.div key="warehouses" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Omborlar ({warehouses.length})</h2>
                <Dialog open={addWhOpen} onOpenChange={setAddWhOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 rounded-xl">
                      <Plus className="h-4 w-4 mr-2" /> Yangi ombor
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Yangi ombor qo&apos;shish</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Nomi</Label>
                        <Input placeholder="Ombor nomi" value={newWhName} onChange={(e) => setNewWhName(e.target.value)} className="h-11 rounded-xl" />
                      </div>
                      <div className="space-y-2">
                        <Label>Manzil</Label>
                        <Input placeholder="To'liq manzil" value={newWhAddress} onChange={(e) => setNewWhAddress(e.target.value)} className="h-11 rounded-xl" />
                      </div>
                      <div className="space-y-2">
                        <Label>Tuman</Label>
                        <Input placeholder="Tuman nomi" value={newWhDistrict} onChange={(e) => setNewWhDistrict(e.target.value)} className="h-11 rounded-xl" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setAddWhOpen(false)}>Bekor</Button>
                      <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleAddWarehouse}>Qo&apos;shish</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {warehouses.map((wh) => (
                  <Card key={wh.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Warehouse className="h-5 w-5 text-emerald-600" />
                            <h3 className="font-bold">{wh.name}</h3>
                          </div>
                          <p className="text-sm text-gray-500">{wh.district}</p>
                          <p className="text-xs text-gray-400 mt-1">{wh.address}</p>
                        </div>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg" onClick={() => setSelectedWarehouse(wh)}>
                            <Eye className="h-4 w-4 text-emerald-600" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-red-500 hover:bg-red-50" onClick={() => handleDeleteWarehouse(wh.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex gap-3 mt-4 pt-3 border-t">
                        <div className="text-center flex-1">
                          <p className="text-lg font-bold text-blue-600">{wh._count?.stock || 0}</p>
                          <p className="text-xs text-gray-400">Mahsulot</p>
                        </div>
                        <div className="text-center flex-1">
                          <p className="text-lg font-bold text-emerald-600">{wh._count?.orders || 0}</p>
                          <p className="text-xs text-gray-400">Buyurtma</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full mt-4 rounded-xl border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                        onClick={() => setSelectedWarehouse(wh)}
                      >
                        Omborni ochish <ChevronRight className="h-4 w-4 ml-auto" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'create-order' && (
            <motion.div key="create-order" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <CreateOrderView onCreated={fetchData} />
            </motion.div>
          )}

          {activeTab === 'transfer' && (
            <motion.div key="transfer" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ArrowRightLeft className="h-5 w-5 text-blue-600" /> Tezkor o&apos;tkazish
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 mb-4">Mahsulotlarni bir ombordan boshqasiga o&apos;tkazish uchun &quot;Omborlar&quot; tabiga o&apos;tib, omborni oching va &quot;O&apos;tkazish&quot; tugmasini bosing.</p>
                  <div className="space-y-2">
                    {warehouses.map((wh) => (
                      <button
                        key={wh.id}
                        className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-emerald-50 transition-colors"
                        onClick={() => setSelectedWarehouse(wh)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-emerald-100 rounded-lg"><Warehouse className="h-5 w-5 text-emerald-600" /></div>
                          <div className="text-left">
                            <p className="font-semibold text-sm">{wh.name}</p>
                            <p className="text-xs text-gray-500">{wh.district} &bull; {wh._count?.stock || 0} mahsulot</p>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
