'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, MapPin, Phone, User, Clock, Package, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useCartStore } from '@/store/cart-store'
import { formatPrice } from '@/lib/format'
import { useToast } from '@/hooks/use-toast'

export function CheckoutView() {
  const { items, getTotal, clearCart, setCurrentView } = useCartStore()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
  })

  const total = getTotal()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.customerName.trim()) {
      toast({ title: 'Iltimos, ismingizni kiriting', variant: 'destructive' })
      return
    }
    if (!form.customerPhone.trim() || form.customerPhone.length < 9) {
      toast({ title: 'Iltimos, to\'g\'ri telefon raqam kiriting', variant: 'destructive' })
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: form.customerName,
          customerPhone: form.customerPhone,
          items: items.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            productImage: item.productImage,
            price: item.price,
            quantity: item.quantity,
            unit: item.unit,
          })),
          totalAmount: total,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        const order = data.order
        const pickupTime = new Date(Date.now() + 30 * 60000)
        useCartStore.getState().setOrderSuccessData({
          orderNumber: order.orderNumber,
          warehouseName: 'Markaziy ombor',
          warehouseAddress: 'Chilonzor ko\'chasi, 15-uy',
          pickupTime: pickupTime.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
        })
        clearCart()
        setCurrentView('order-success')
      } else {
        toast({ title: 'Xatolik yuz berdi', description: 'Qaytadan urinib ko\'ring', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Internet bilan muammo', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    setCurrentView('shop')
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gray-50"
    >
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setCurrentView('shop')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Buyurtma berish</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Steps */}
        <div className="flex items-center justify-center gap-2 text-sm">
          {[
            { step: 1, label: 'Ma\'lumot', icon: <User className="h-4 w-4" />, active: true },
            { step: 2, label: 'Tasdiqlash', icon: <CreditCard className="h-4 w-4" />, active: false },
            { step: 3, label: 'Pickup', icon: <MapPin className="h-4 w-4" />, active: false },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${s.active ? 'bg-emerald-100 text-emerald-700 font-semibold' : 'bg-gray-100 text-gray-400'}`}>
                {s.icon}
                <span>{s.label}</span>
              </div>
              {i < 2 && <div className="w-8 h-0.5 bg-gray-200" />}
            </div>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-emerald-600" />
              Mijoz ma&apos;lumotlari
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Ismingiz</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    placeholder="Masalan: Jasur"
                    className="pl-10 h-12 rounded-xl"
                    value={form.customerName}
                    onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon raqam</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+998 90 123 45 67"
                    className="pl-10 h-12 rounded-xl"
                    value={form.customerPhone}
                    onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Order Items Summary */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Package className="h-5 w-5 text-emerald-600" />
              Buyurtma ({items.length} ta mahsulot)
            </h2>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-lg overflow-hidden">
                      {item.productImage && item.productImage.startsWith('/products/') ? (
                        <img src={item.productImage} alt="" className="w-full h-full object-cover" />
                      ) : (
                        item.categoryIcon
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{item.productName}</p>
                      <p className="text-xs text-gray-500">{item.quantity} {item.unit} × {formatPrice(item.price)}</p>
                    </div>
                  </div>
                  <span className="font-bold text-sm">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Umumiy</span>
              <span className="text-2xl font-bold text-emerald-700">{formatPrice(total)}</span>
            </div>
          </div>

          {/* Pickup Info Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <MapPin className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-800 text-sm">Pickup haqida</p>
              <p className="text-amber-700 text-xs mt-1">
                Buyurtma tasdiqlangandan so&apos;ng, sizga aniq lokatsiya va olish vaqti yuboriladi. Mahsulotlar 30 daqiqada tayyor bo&apos;ladi.
              </p>
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            size="lg"
            disabled={loading}
            className="w-full h-14 text-lg font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/25 disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Yuborilmoqda...
              </div>
            ) : (
              `Buyurtma qilish — ${formatPrice(total)}`
            )}
          </Button>
        </form>
      </div>
    </motion.div>
  )
}
