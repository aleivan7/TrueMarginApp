'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  Briefcase, 
  Package, 
  PiggyBank, 
  Settings,
  Calculator,
  Sun,
  Moon
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

const navigation = [
  { name: 'Jobs', href: '/jobs', icon: Briefcase },
  { name: 'Inventory', href: '/inventory', icon: Package },
  { name: 'Buckets', href: '/buckets', icon: PiggyBank },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Calculator', href: '/calculator', icon: Calculator },
]

export function Navigation() {
  const pathname = usePathname()
  const { theme, setTheme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const isDark = (theme === 'system' ? systemTheme : theme) === 'dark'

  return (
    <nav className="flex items-center space-x-2">
      <div className="flex space-x-2 md:space-x-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                isActive
                  ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800'
              )}
            >
              <item.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{item.name}</span>
            </Link>
          )
        })}
      </div>
      <button
        aria-label="Toggle theme"
        className="ml-2 inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
      >
        {mounted && isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>
    </nav>
  )
} 