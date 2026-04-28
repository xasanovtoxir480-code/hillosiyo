'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { useDataStore } from '@/store/data-store'

interface CategoriesProps {
  selected: string
  onSelect: (id: string) => void
}

export function CategoryBar({ selected, onSelect }: CategoriesProps) {
  const categories = useDataStore((s) => s.categories)

  return (
    <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-2 py-3 overflow-x-auto scrollbar-hide">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect('all')}
            className={cn(
              'flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-200',
              selected === 'all'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            <span>🏪</span>
            <span>Barchasi</span>
          </motion.button>

          {categories.map((cat) => (
            <motion.button
              key={cat.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(cat.id)}
              className={cn(
                'flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-200',
                selected === cat.id
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              <span>{cat.icon}</span>
              <span>{cat.nameUz}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}
