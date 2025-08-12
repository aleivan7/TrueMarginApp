'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  Briefcase, 
  Package, 
  PiggyBank, 
  Settings,
  Calculator
} from 'lucide-react'

const navigation = [
  { name: 'Jobs', href: '/jobs', icon: Briefcase },
  { name: 'Inventory', href: '/inventory', icon: Package },
  { name: 'Buckets', href: '/buckets', icon: PiggyBank },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Calculator', href: '/calculator', icon: Calculator },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="flex space-x-8">
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
            <span>{item.name}</span>
          </Link>
        )
      })}
    </nav>
  )
} 