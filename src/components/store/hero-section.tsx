'use client'

import { motion } from 'framer-motion'
import { ShoppingBag, Truck, Clock, Shield, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/store/cart-store'

export function HeroSection() {
  const { setCurrentView } = useCartStore()

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-green-900 text-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.2) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              Toshkent bo&apos;ylab yetkaziladi
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Bozor narxidan
              <br />
              <span className="text-emerald-300">arzonroq</span>, sifatli
              <br />
              mahsulotlar
            </h1>

            <p className="text-lg sm:text-xl text-emerald-100 mb-8 max-w-lg">
              Online buyurtma bering — biz yig&apos;ib qo&apos;yamiz. Siz faqat kelib olib
              ketasiz. Navbat yo&apos;q, sira yo&apos;q!
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-white text-emerald-900 hover:bg-emerald-50 font-bold text-lg px-8 py-6 rounded-xl shadow-lg shadow-black/20 transition-all duration-300 hover:shadow-xl hover:scale-105"
                onClick={() => {
                  document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                Buyurtma berish
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 font-semibold text-lg px-8 py-6 rounded-xl backdrop-blur-sm"
                onClick={() => setCurrentView('admin')}
              >
                Admin panel
              </Button>
            </div>
          </motion.div>

          {/* Right - Features */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 gap-4"
          >
            {[
              {
                icon: <ShoppingBag className="h-8 w-8" />,
                title: "Pickup Model",
                desc: "O'zingiz kelib olib ketasiz",
              },
              {
                icon: <Clock className="h-8 w-8" />,
                title: "Tez Tayyor",
                desc: "30 daqiqada tayyor bo'ladi",
              },
              {
                icon: <Shield className="h-8 w-8" />,
                title: "Sifat Kafolati",
                desc: "Saralangan toza mahsulotlar",
              },
              {
                icon: <Truck className="h-8 w-8" />,
                title: "Arzon Narxlar",
                desc: "Bozor narxidan 10-30% arzon",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105 cursor-default"
              >
                <div className="text-emerald-300 mb-3">{feature.icon}</div>
                <h3 className="font-bold text-lg mb-1">{feature.title}</h3>
                <p className="text-emerald-200 text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8"
        >
          {[
            { value: '500+', label: "Mijozlar" },
            { value: '32+', label: "Mahsulot turlari" },
            { value: '4', label: "Omborlar" },
            { value: '30min', label: "O'rtacha tayyor" },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-emerald-300">{stat.value}</div>
              <div className="text-emerald-200 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
