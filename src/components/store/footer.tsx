'use client'

import { MapPin, Phone, Mail, Instagram, Send } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                P
              </div>
              <span className="text-white font-bold text-xl">PickUp Market</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Toshkent bo&apos;ylab yashirin omborlar tarmog&apos;i. Bozor narxidan arzon, sifatli va saralangan mahsulotlar.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Kategoriyalar</h3>
            <ul className="space-y-2 text-sm">
              <li className="hover:text-emerald-400 cursor-pointer transition-colors">🥕 Sabzavotlar</li>
              <li className="hover:text-emerald-400 cursor-pointer transition-colors">🍎 Mevalar</li>
              <li className="hover:text-emerald-400 cursor-pointer transition-colors">🥜 Quritilgan mevalar</li>
              <li className="hover:text-emerald-400 cursor-pointer transition-colors">🥬 Ko&apos;katlar</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Aloqa</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-emerald-400" />
                <span>+998 90 123 45 67</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-emerald-400" />
                <span>info@pickupmarket.uz</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Toshkent, O&apos;zbekiston</span>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-white font-semibold mb-4">Ijtimoiy tarmoqlar</h3>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-emerald-600 rounded-xl flex items-center justify-center transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-emerald-600 rounded-xl flex items-center justify-center transition-colors">
                <Send className="h-5 w-5" />
              </a>
            </div>
            <div className="mt-4 p-3 bg-gray-800 rounded-xl text-xs">
              <p className="text-emerald-400 font-medium">Telegram bot</p>
              <p className="text-gray-400 mt-1">@pickupmarket_bot</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500">&copy; 2026 PickUp Market. Barcha huquqlar himoyalangan.</p>
          <p className="text-xs text-gray-600">Toshkent, O&apos;zbekiston</p>
        </div>
      </div>
    </footer>
  )
}
