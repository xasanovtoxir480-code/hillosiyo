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
  ArrowRight,
  AlertCircle,
  Search,
  Pencil,
  ImagePlus,
  ImageIcon,
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
  name: string
  price: number
  oldPrice: number | null
  unit: string
  image: string
  stock: number
  isActive: boolean
  isFeatured: boolean
  categoryId: string
  category: { id: string; icon: string; nameUz: string }
}

interface Category {
  id: string
  nameUz: string
  icon: string
}

// ========== CONSTANTS ==========
const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'Kutilmoqda', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: <Clock className="h-3 w-3" /> },
  preparing: { label: 'Tayyorlanmoqda', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: <Loader2 className="h-3 w-3" /> },
  ready: { label: 'Tayyor', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: <CheckCircle2 className="h-3 w-3" /> },
  cancelled: { label: 'Bekor qilindi', color: 'bg-red-100 text-red-700 border-red-200', icon: <XCircle className="h-3 w-3" /> },
  completed: { label: 'Topshirildi', color: 'bg-gray-100 text-gray-700 border-gray-200', icon: <CheckCircle2 className="h-3 w-3" /> },
}

// ========== IMAGE UPLOAD COMPONENT ==========
function ImageUploader({
  value,
  onChange,
  label = 'Rasm',
}: {
  value: string
  onChange: (url: string) => void
  label?: string
}) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(value)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [fileName, setFileName] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const { toast } = useToast()

  // Sync preview with value prop changes
  useEffect(() => {
    setPreview(value)
    if (value) {
      setUploadStatus('success')
    }
  }, [value])

  const processFile = async (file: File) => {
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Fayl hajmi 5MB dan oshmasligi kerak', variant: 'destructive' })
      setUploadStatus('error')
      return
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      toast({ title: 'Faqat JPG, PNG, WebP, GIF ruxsat etiladi', variant: 'destructive' })
      setUploadStatus('error')
      return
    }

    setFileName(file.name)
    setUploading(true)
    setUploadStatus('idle')

    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (res.ok && data.url) {
        onChange(data.url)
        setPreview(data.url)
        setUploadStatus('success')
        toast({ title: 'Rasm muvaffaqiyatli yuklandi!', description: file.name, duration: 2000 })
      } else {
        setUploadStatus('error')
        toast({ title: data.error || 'Xatolik yuz berdi', variant: 'destructive' })
      }
    } catch {
      setUploadStatus('error')
      toast({ title: 'Rasm yuklashda xatolik', variant: 'destructive' })
    } finally {
      setUploading(false)
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
    // Reset input so same file can be selected again
    e.target.value = ''
  }

  const handleRemove = () => {
    setPreview('')
    onChange('')
    setUploadStatus('idle')
    setFileName('')
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>

      <div
        className="relative rounded-xl border-2 overflow-hidden transition-all duration-300"
        style={{
          borderColor: dragOver ? '#10b981' : uploading ? '#9ca3af' : uploadStatus === 'error' ? '#ef4444' : uploadStatus === 'success' && preview ? '#10b981' : '#e5e7eb',
          background: dragOver ? '#ecfdf5' : '#f9fafb',
        }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        {/* Success indicator bar */}
        {uploadStatus === 'success' && preview && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500 z-10" />
        )}
        {uploadStatus === 'error' && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-red-500 z-10" />
        )}

        {preview ? (
          /* ===== IMAGE LOADED STATE ===== */
          <div className="relative">
            <div className="flex items-center gap-4 p-3">
              {/* Large preview */}
              <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-white shadow-md shrink-0">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span className="text-sm font-semibold text-emerald-700 truncate">
                    {fileName || 'Rasm yuklangan'}
                  </span>
                </div>
                <p className="text-xs text-gray-400 truncate">{preview}</p>
                <div className="flex items-center gap-2 mt-2">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      onChange={handleUpload}
                      disabled={uploading}
                    />
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors">
                      <RefreshCw className="h-3 w-3" /> Almashtirish
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={handleRemove}
                    className="inline-flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" /> O&apos;chirish
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ===== EMPTY / UPLOAD STATE ===== */
          <label className="block cursor-pointer">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
            />
            <div className={`flex flex-col items-center justify-center py-6 px-4 transition-colors ${dragOver ? 'bg-emerald-50' : 'hover:bg-gray-50'}`}>
              {uploading ? (
                <>
                  <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                    <Loader2 className="h-7 w-7 text-emerald-600 animate-spin" />
                  </div>
                  <p className="text-sm font-semibold text-gray-700">Yuklanmoqda...</p>
                  <p className="text-xs text-gray-400 mt-1">Iltimos kuting</p>
                </>
              ) : (
                <>
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 transition-colors ${dragOver ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                    {uploadStatus === 'error' ? (
                      <XCircle className="h-7 w-7 text-red-400" />
                    ) : (
                      <ImagePlus className={`h-7 w-7 ${dragOver ? 'text-emerald-600' : 'text-gray-400'}`} />
                    )}
                  </div>
                  <p className="text-sm font-semibold text-gray-700">
                    {dragOver ? 'Rasmni tashlang' : 'Rasm yuklash'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Tanlash yoki shu yerga tashlash</p>
                  {uploadStatus === 'error' && (
                    <p className="text-xs text-red-500 mt-2 font-medium">Qayta urinib ko&apos;ring</p>
                  )}
                </>
              )}
            </div>
          </label>
        )}

        {/* Uploading overlay shimmer */}
        {uploading && preview && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10">
            <div className="flex items-center gap-2 bg-white rounded-lg px-4 py-2 shadow-lg border">
              <Loader2 className="h-4 w-4 text-emerald-600 animate-spin" />
              <span className="text-sm font-medium text-gray-700">Yangi rasm yuklanmoqda...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

type AdminTab = 'orders' | 'warehouses' | 'products' | 'create-order' | 'transfer'

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
      const res = await fetch('/api/products?admin=true')
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
                          {item.product.image ? (
                            <img
                              src={item.product.image}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span>{item.product.category.icon}</span>
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
  const [categories, setCategories] = useState<Category[]>([])
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [selectedWarehouse, setSelectedWarehouse] = useState('')
  const [orderItems, setOrderItems] = useState<{ productId: string; productName: string; productImage: string; price: number; quantity: number; unit: string }[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Product add dialog state (for adding product to order)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [inputKg, setInputKg] = useState('')
  const [inputPricePerKg, setInputPricePerKg] = useState('')

  // New product dialog state
  const [newProductOpen, setNewProductOpen] = useState(false)
  const [newProdNameUz, setNewProdNameUz] = useState('')
  const [newProdName, setNewProdName] = useState('')
  const [newProdCategoryId, setNewProdCategoryId] = useState('')
  const [newProdPrice, setNewProdPrice] = useState('')
  const [newProdUnit, setNewProdUnit] = useState('kg')
  const [newProdImage, setNewProdImage] = useState('')

  // Price edit dialog state
  const [editPriceOpen, setEditPriceOpen] = useState(false)
  const [editPriceProduct, setEditPriceProduct] = useState<Product | null>(null)
  const [editPriceValue, setEditPriceValue] = useState('')
  const [editPriceName, setEditPriceName] = useState('')
  const [editPriceImage, setEditPriceImage] = useState('')

  const refreshProducts = useCallback(() => {
    fetch('/api/products?admin=true').then((r) => r.json()).then((d) => setProducts(d.products || []))
  }, [])

  useEffect(() => {
    refreshProducts()
    fetch('/api/warehouses').then((r) => r.json()).then((d) => setWarehouses(d.warehouses || []))
    fetch('/api/products/categories').then((r) => r.json()).then((d) => setCategories(d.categories || []))
  }, [refreshProducts])

  // Open dialog when clicking a product
  const openAddDialog = (product: Product) => {
    setSelectedProduct(product)
    setInputKg('')
    setInputPricePerKg(String(product.price))
    setAddDialogOpen(true)
  }

  // Confirm add product to order
  const confirmAddProduct = () => {
    if (!selectedProduct) return
    const kg = parseFloat(inputKg)
    const pricePerKg = parseFloat(inputPricePerKg)
    if (!kg || kg <= 0) {
      toast({ title: 'Necha kilogramligini kiriting', variant: 'destructive' })
      return
    }
    if (!pricePerKg || pricePerKg <= 0) {
      toast({ title: '1 kg narxini kiriting', variant: 'destructive' })
      return
    }

    const existing = orderItems.find((i) => i.productId === selectedProduct.id)
    if (existing) {
      setOrderItems(orderItems.map((i) =>
        i.productId === selectedProduct.id
          ? { ...i, quantity: i.quantity + kg, price: pricePerKg }
          : i
      ))
    } else {
      setOrderItems([...orderItems, {
        productId: selectedProduct.id,
        productName: selectedProduct.nameUz,
        productImage: selectedProduct.image,
        price: pricePerKg,
        quantity: kg,
        unit: selectedProduct.unit,
      }])
    }
    toast({ title: `${selectedProduct.nameUz} ${kg} kg qo'shildi`, duration: 1500 })
    setAddDialogOpen(false)
    setSelectedProduct(null)
  }

  // Handle adding a brand new product
  const handleNewProduct = async () => {
    if (!newProdNameUz.trim() || !newProdCategoryId || !newProdPrice) {
      toast({ title: "Barcha maydonlarni to'ldiring", variant: 'destructive' })
      return
    }
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProdName.trim() || newProdNameUz.trim(),
          nameUz: newProdNameUz.trim(),
          categoryId: newProdCategoryId,
          price: parseFloat(newProdPrice),
          unit: newProdUnit,
          image: newProdImage || undefined,
          stock: 100,
        }),
      })
      if (res.ok) {
        toast({ title: 'Yangi mahsulot qo\'shildi!' })
        setNewProductOpen(false)
        setNewProdNameUz('')
        setNewProdName('')
        setNewProdCategoryId('')
        setNewProdPrice('')
        setNewProdUnit('kg')
        setNewProdImage('')
        refreshProducts()
      } else {
        const data = await res.json()
        toast({ title: data.error || 'Xatolik yuz berdi', variant: 'destructive' })
      }
    } catch (err) {
      console.error('New product error:', err)
      toast({ title: 'Xatolik yuz berdi', variant: 'destructive' })
    }
  }

  // Open price edit dialog
  const openPriceEditDialog = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditPriceProduct(product)
    setEditPriceName(product.nameUz)
    setEditPriceValue(String(product.price))
    setEditPriceImage(product.image || '')
    setEditPriceOpen(true)
  }

  // Handle price update
  const handlePriceUpdate = async () => {
    if (!editPriceProduct || !editPriceValue) {
      toast({ title: 'Narxni kiriting', variant: 'destructive' })
      return
    }
    try {
      const res = await fetch('/api/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: editPriceProduct.id,
          nameUz: editPriceName,
          price: parseFloat(editPriceValue),
          image: editPriceImage || undefined,
        }),
      })
      if (res.ok) {
        toast({ title: `${editPriceProduct.nameUz} narxi yangilandi!` })
        setEditPriceOpen(false)
        setEditPriceProduct(null)
        refreshProducts()
      } else {
        toast({ title: 'Xatolik yuz berdi', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Xatolik yuz berdi', variant: 'destructive' })
    }
  }

  const removeItem = (productId: string) => {
    setOrderItems(orderItems.filter((i) => i.productId !== productId))
  }

  const updateQty = (productId: string, qty: number) => {
    if (qty <= 0) return removeItem(productId)
    setOrderItems(orderItems.map((i) => i.productId === productId ? { ...i, quantity: qty } : i))
  }

  const total = orderItems.reduce((s, i) => s + i.price * i.quantity, 0)

  // Dialog preview total
  const dialogTotal = selectedProduct && inputKg && inputPricePerKg
    ? parseFloat(inputKg) * parseFloat(inputPricePerKg)
    : 0

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
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{orderItems.length} ta</Badge>
              <Dialog open={newProductOpen} onOpenChange={setNewProductOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 rounded-lg h-8 text-xs px-3">
                    <Plus className="h-3 w-3 mr-1" /> Yangi mahsulot
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Yangi mahsulot qo&apos;shish</DialogTitle>
                    <DialogDescription>Yangi kelgan mahsulotni qo&apos;shing va narxini belgilang</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <ImageUploader value={newProdImage} onChange={setNewProdImage} label='Mahsulot rasmi' />
                    <div className="space-y-2">
                      <Label>Mahsulot nomi (o&apos;zbekcha)</Label>
                      <Input placeholder="Masalan: Pomidor" value={newProdNameUz} onChange={(e) => setNewProdNameUz(e.target.value)} className="h-11 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label>Mahsulot nomi (ruscha)</Label>
                      <Input placeholder="Masalan: Tomat" value={newProdName} onChange={(e) => setNewProdName(e.target.value)} className="h-11 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label>Kategoriya</Label>
                      <Select value={newProdCategoryId} onValueChange={setNewProdCategoryId}>
                        <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Kategoriya tanlang" /></SelectTrigger>
                        <SelectContent>
                          {categories.map((c) => (
                            <SelectItem key={c.id} value={c.id}>{c.icon} {c.nameUz}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Narxi (so&apos;m)</Label>
                        <div className="relative">
                          <Input type="number" placeholder="15000" value={newProdPrice} onChange={(e) => setNewProdPrice(e.target.value)} className="h-11 rounded-xl pr-10" />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">so&apos;m</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>O&apos;lchov birligi</Label>
                        <Select value={newProdUnit} onValueChange={setNewProdUnit}>
                          <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="kg">kg</SelectItem>
                            <SelectItem value="dona">dona</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setNewProductOpen(false)} className="rounded-xl">Bekor</Button>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 rounded-xl" onClick={handleNewProduct}>
                      <Plus className="h-4 w-4 mr-1" /> Qo&apos;shish
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
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
                <div
                  key={p.id}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-emerald-50 transition-colors text-left cursor-pointer group"
                  onClick={() => openAddDialog(p)}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span>{p.category.icon}</span>
                    <span className="text-sm font-medium truncate">{p.nameUz}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="text-right">
                      <span className="text-sm font-semibold text-emerald-700">{formatPrice(p.price)}</span>
                      <span className="text-xs text-gray-400">/{p.unit}</span>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 rounded opacity-0 group-hover:opacity-100 transition-opacity text-blue-500 hover:bg-blue-50 shrink-0"
                      onClick={(e) => openPriceEditDialog(p, e)}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Product Add Dialog (kg/price for order) */}
      <Dialog open={addDialogOpen} onOpenChange={(open) => { setAddDialogOpen(open); if (!open) setSelectedProduct(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Mahsulot qo&apos;shish</DialogTitle>
            <DialogDescription>
              {selectedProduct?.category.icon} {selectedProduct?.nameUz}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
            {/* Weight input */}
            <div className="space-y-2">
              <Label htmlFor="input-kg" className="text-base font-semibold">
                Necha kilogram?
              </Label>
              <div className="relative">
                <Input
                  id="input-kg"
                  type="number"
                  min="0.1"
                  step="0.1"
                  placeholder="Masalan: 2.5"
                  className="h-12 text-lg rounded-xl pr-12"
                  value={inputKg}
                  onChange={(e) => setInputKg(e.target.value)}
                  autoFocus
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">kg</span>
              </div>
            </div>

            {/* Price per kg input */}
            <div className="space-y-2">
              <Label htmlFor="input-price" className="text-base font-semibold">
                1 kg narxi
              </Label>
              <div className="relative">
                <Input
                  id="input-price"
                  type="number"
                  min="0"
                  step="100"
                  placeholder="Masalan: 15000"
                  className="h-12 text-lg rounded-xl pr-16"
                  value={inputPricePerKg}
                  onChange={(e) => setInputPricePerKg(e.target.value)}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">so&apos;m/kg</span>
              </div>
            </div>

            {/* Calculated total preview */}
            {dialogTotal > 0 && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-emerald-700 font-medium">Jami narx:</span>
                  <span className="text-xl font-bold text-emerald-700">{formatPrice(dialogTotal)}</span>
                </div>
                <p className="text-xs text-emerald-600 mt-1">
                  {inputKg} kg x {formatPrice(parseFloat(inputPricePerKg))}/kg
                </p>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" className="rounded-xl h-11" onClick={() => setAddDialogOpen(false)}>
              Bekor qilish
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700 rounded-xl h-11 px-6" onClick={confirmAddProduct}>
              <Plus className="h-4 w-4 mr-2" /> Qo&apos;shish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Price Edit Dialog */}
      <Dialog open={editPriceOpen} onOpenChange={(open) => { setEditPriceOpen(open); if (!open) setEditPriceProduct(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Narxni tahrirlash</DialogTitle>
            <DialogDescription>
              {editPriceProduct?.category.icon} {editPriceProduct?.nameUz}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <ImageUploader value={editPriceImage} onChange={setEditPriceImage} label='Mahsulot rasmi' />
            <div className="space-y-2">
              <Label>Mahsulot nomi</Label>
              <Input value={editPriceName} onChange={(e) => setEditPriceName(e.target.value)} className="h-11 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>1 {editPriceProduct?.unit || 'kg'} narxi (so&apos;m)</Label>
              <div className="relative">
                <Input
                  type="number"
                  value={editPriceValue}
                  onChange={(e) => setEditPriceValue(e.target.value)}
                  className="h-12 text-lg rounded-xl pr-10"
                  autoFocus
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">so&apos;m</span>
              </div>
              {editPriceProduct && parseFloat(editPriceValue) > 0 && parseFloat(editPriceValue) !== editPriceProduct.price && (
                <div className="flex items-center gap-2 text-sm mt-2">
                  <span className="text-gray-400">Eski narx:</span>
                  <span className="line-through text-gray-400">{formatPrice(editPriceProduct.price)}</span>
                  <ArrowRight className="h-3 w-3 text-gray-400" />
                  <span className="font-bold text-emerald-700">{formatPrice(parseFloat(editPriceValue))}</span>
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" className="rounded-xl h-11" onClick={() => setEditPriceOpen(false)}>Bekor</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700 rounded-xl h-11 px-6" onClick={handlePriceUpdate}>
              <Pencil className="h-4 w-4 mr-2" /> Saqlash
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

// ========== PRODUCTS VIEW ==========
function ProductsView() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const { toast } = useToast()

  // Add product dialog
  const [addOpen, setAddOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newNameUz, setNewNameUz] = useState('')
  const [newCategoryId, setNewCategoryId] = useState('')
  const [newPrice, setNewPrice] = useState('')
  const [newUnit, setNewUnit] = useState('kg')
  const [newImage, setNewImage] = useState('')

  // Edit price dialog
  const [editOpen, setEditOpen] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [editPrice, setEditPrice] = useState('')
  const [editNameUz, setEditNameUz] = useState('')
  const [editImage, setEditImage] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch('/api/products?admin=true'),
        fetch('/api/products/categories'),
      ])
      const productsData = await productsRes.json()
      const categoriesData = await categoriesRes.json()
      setProducts(productsData.products || [])
      setCategories(categoriesData.categories || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleAddProduct = async () => {
    if (!newNameUz.trim() || !newCategoryId || !newPrice) {
      toast({ title: "Barcha maydonlarni to'ldiring", variant: 'destructive' })
      return
    }
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim() || newNameUz.trim(),
          nameUz: newNameUz.trim(),
          categoryId: newCategoryId,
          price: parseFloat(newPrice),
          unit: newUnit,
          image: newImage || undefined,
          stock: 100,
        }),
      })
      if (res.ok) {
        toast({ title: 'Mahsulot qo\'shildi!' })
        setAddOpen(false)
        setNewName('')
        setNewNameUz('')
        setNewCategoryId('')
        setNewPrice('')
        setNewUnit('kg')
        setNewImage('')
        fetchData()
      } else {
        const data = await res.json()
        toast({ title: data.error || 'Xatolik yuz berdi', variant: 'destructive' })
      }
    } catch (err) {
      console.error('Add product error:', err)
      toast({ title: 'Xatolik', variant: 'destructive' })
    }
  }

  const openEditDialog = (product: Product) => {
    setEditProduct(product)
    setEditNameUz(product.nameUz)
    setEditPrice(String(product.price))
    setEditImage(product.image || '')
    setEditOpen(true)
  }

  const handleEditProduct = async () => {
    if (!editProduct || !editPrice) {
      toast({ title: 'Narxni kiriting', variant: 'destructive' })
      return
    }
    try {
      const res = await fetch('/api/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: editProduct.id,
          nameUz: editNameUz,
          price: parseFloat(editPrice),
          image: editImage || undefined,
        }),
      })
      if (res.ok) {
        toast({ title: `${editProduct.nameUz} narxi yangilandi!` })
        setEditOpen(false)
        setEditProduct(null)
        fetchData()
      }
    } catch {
      toast({ title: 'Xatolik', variant: 'destructive' })
    }
  }

  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (!confirm(`${productName} mahsulotini o\'chirishni tasdiqlaysizmi?`)) return
    try {
      const res = await fetch(`/api/products?id=${productId}`, { method: 'DELETE' })
      if (res.ok) {
        toast({ title: `${productName} o'chirildi` })
        fetchData()
      } else {
        const data = await res.json()
        toast({ title: data.error || 'Xatolik', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Xatolik', variant: 'destructive' })
    }
  }

  const filteredProducts = products.filter((p) => {
    const matchSearch = p.nameUz.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchCategory = filterCategory === 'all' || p.categoryId === filterCategory
    return matchSearch && matchCategory
  })

  const groupedProducts = categories.map((cat) => ({
    category: cat,
    items: filteredProducts.filter((p) => p.categoryId === cat.id),
  })).filter((g) => g.items.length > 0)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header with Add button */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Package className="h-5 w-5 text-emerald-600" />
          Mahsulotlar ({products.length})
        </h2>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 rounded-xl">
              <Plus className="h-4 w-4 mr-2" /> Yangi mahsulot
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Yangi mahsulot qo&apos;shish</DialogTitle>
              <DialogDescription>Yangi kelgan mahsulotni qo&apos;shing va narxini belgilang</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <ImageUploader value={newImage} onChange={setNewImage} label='Mahsulot rasmi' />
              <div className="space-y-2">
                <Label>Mahsulot nomi (o&apos;zbekcha)</Label>
                <Input placeholder="Masalan: Pomidor" value={newNameUz} onChange={(e) => setNewNameUz(e.target.value)} className="h-11 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Mahsulot nomi (ruscha/inglizcha)</Label>
                <Input placeholder="Masalan: Tomat" value={newName} onChange={(e) => setNewName(e.target.value)} className="h-11 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Kategoriya</Label>
                <Select value={newCategoryId} onValueChange={setNewCategoryId}>
                  <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Kategoriya tanlang" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.icon} {c.nameUz}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>1 kg narxi (so&apos;m)</Label>
                  <div className="relative">
                    <Input type="number" placeholder="15000" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} className="h-11 rounded-xl pr-10" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">so&apos;m</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>O&apos;lchov birligi</Label>
                  <Select value={newUnit} onValueChange={setNewUnit}>
                    <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="dona">dona</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddOpen(false)} className="rounded-xl">Bekor</Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700 rounded-xl" onClick={handleAddProduct}>
                <Plus className="h-4 w-4 mr-1" /> Qo&apos;shish
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search & Filter */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Mahsulot qidirish..." className="pl-10 h-10 rounded-xl" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="h-10 rounded-xl w-full sm:w-48"><SelectValue placeholder="Kategoriya" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Barchasi</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.icon} {c.nameUz}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products List */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-emerald-600" /></div>
      ) : groupedProducts.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-12 text-center text-gray-400">
            <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Mahsulot topilmadi</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {groupedProducts.map((group) => (
            <Card key={group.category.id} className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="text-lg">{group.category.icon}</span>
                  {group.category.nameUz}
                  <Badge variant="secondary" className="ml-auto">{group.items.length} ta</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {group.items.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-lg overflow-hidden border shrink-0">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span>{group.category.icon}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{product.nameUz}</p>
                          {product.stock > 0 ? (
                            <p className="text-xs text-emerald-600">Omborda: {product.stock} {product.unit}</p>
                          ) : (
                            <p className="text-xs text-amber-500">Omborda yo'q</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right mr-1">
                          <p className="font-bold text-emerald-700">{formatPrice(product.price)}</p>
                          <p className="text-xs text-gray-400">/{product.unit}</p>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-blue-600 hover:bg-blue-50" onClick={() => openEditDialog(product)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-red-500 hover:bg-red-50" onClick={() => handleDeleteProduct(product.id, product.nameUz)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        {/* Mobile: always show buttons */}
                        <div className="flex gap-1 sm:hidden">
                          <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-blue-600 hover:bg-blue-50" onClick={() => openEditDialog(product)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-red-500 hover:bg-red-50" onClick={() => handleDeleteProduct(product.id, product.nameUz)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Product Dialog */}
      <Dialog open={editOpen} onOpenChange={(open) => { setEditOpen(open); if (!open) setEditProduct(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Narxni tahrirlash</DialogTitle>
            <DialogDescription>
              {editProduct?.category.icon} {editProduct?.nameUz}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <ImageUploader value={editImage} onChange={setEditImage} label='Mahsulot rasmi' />
            <div className="space-y-2">
              <Label>Mahsulot nomi</Label>
              <Input value={editNameUz} onChange={(e) => setEditNameUz(e.target.value)} className="h-11 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>1 {editProduct?.unit || 'kg'} narxi (so&apos;m)</Label>
              <div className="relative">
                <Input
                  type="number"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className="h-12 text-lg rounded-xl pr-10"
                  autoFocus
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">so&apos;m</span>
              </div>
              {editProduct && parseFloat(editPrice) > 0 && parseFloat(editPrice) !== editProduct.price && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-400">Eski narx:</span>
                  <span className="line-through text-gray-400">{formatPrice(editProduct.price)}</span>
                  <ArrowRight className="h-3 w-3 text-gray-400" />
                  <span className="font-bold text-emerald-700">{formatPrice(parseFloat(editPrice))}</span>
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" className="rounded-xl h-11" onClick={() => setEditOpen(false)}>Bekor</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700 rounded-xl h-11 px-6" onClick={handleEditProduct}>
              <Pencil className="h-4 w-4 mr-2" /> Saqlash
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
    { key: 'products', label: 'Mahsulotlar', icon: <ShoppingCart className="h-4 w-4" /> },
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

          {activeTab === 'products' && (
            <motion.div key="products" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <ProductsView />
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
