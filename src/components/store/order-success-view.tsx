'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, MapPin, Clock, ArrowLeft, Share2, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/store/cart-store'
import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'

export function OrderSuccessView() {
  const { orderSuccessData, setCurrentView } = useCartStore()
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)

  if (!orderSuccessData) {
    setCurrentView('shop')
    return null
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(orderSuccessData.orderNumber)
    setCopied(true)
    toast({ title: 'Nusxalandi!', description: orderSuccessData.orderNumber })
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center p-4"
    >
      <div className="max-w-md w-full text-center space-y-6">
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 15, delay: 0.2 }}
        >
          <CheckCircle2 className="h-24 w-24 text-emerald-500 mx-auto" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Buyurtma qabul qilindi!</h1>
          <p className="text-gray-500">Mahsulotlaringiz tez orada tayyor bo&apos;ladi</p>
        </motion.div>

        {/* Order Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl shadow-lg border p-6 space-y-5 text-left"
        >
          {/* Order Number */}
          <div className="flex items-center justify-between bg-emerald-50 rounded-xl p-4">
            <div>
              <p className="text-xs text-emerald-600 font-medium">Buyurtma raqami</p>
              <p className="text-2xl font-bold text-emerald-700">{orderSuccessData.orderNumber}</p>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-emerald-200 hover:bg-emerald-100"
              onClick={handleCopy}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          {/* Pickup Location */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl">
            <MapPin className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-800">Pickup manzili</p>
              <p className="text-blue-700 text-sm mt-1">{orderSuccessData.warehouseName}</p>
              <p className="text-blue-600 text-xs mt-0.5">{orderSuccessData.warehouseAddress}</p>
            </div>
          </div>

          {/* Pickup Time */}
          <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl">
            <Clock className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-800">Olish vaqti</p>
              <p className="text-amber-700 text-sm mt-1">
                Taxminan {orderSuccessData.pickupTime} gacha tayyor
              </p>
              <p className="text-amber-600 text-xs mt-0.5">Keling, navbat kutmasin!</p>
            </div>
          </div>
        </motion.div>

        {/* Notice */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-xs text-gray-400"
        >
          Savolingiz bo&apos;lsa, telefon raqamingiz orqali bog&apos;laning
        </motion.p>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="flex gap-3"
        >
          <Button
            variant="outline"
            className="flex-1 h-12 rounded-xl"
            onClick={() => {
              useCartStore.getState().setOrderSuccessData(null)
              setCurrentView('shop')
            }}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Asosiy sahifa
          </Button>
        </motion.div>
      </div>
    </motion.div>
  )
}
