'use client'

import { AuthProvider } from '@/lib/auth/context'
import { useAuth } from '@/lib/auth/context'
import { useRouter, usePathname } from 'next/navigation'
import { CBREButton } from '@/components/cbre/cbre-button'
import { LogOut, Home, FolderOpen, Tag, Settings, BarChart3, Users } from 'lucide-react'
import Link from 'next/link'

function AdminNavigation() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const handleSignOut = async () => {
    await signOut()
    router.push('/admin/login')
  }

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: Home,
      active: pathname === '/admin'
    },
    {
      name: 'Projects',
      href: '/admin/projects',
      icon: FolderOpen,
      active: pathname.startsWith('/admin/projects')
    },
    {
      name: 'Categories',
      href: '/admin/categories',
      icon: Tag,
      active: pathname.startsWith('/admin/categories')
    },
    {
      name: 'Users',
      href: '/admin/users',
      icon: Users,
      active: pathname.startsWith('/admin/users')
    },
    {
      name: 'Analytics',
      href: '/admin/analytics',
      icon: BarChart3,
      active: pathname.startsWith('/admin/analytics')
    },
    {
      name: 'Settings',
      href: '/admin/settings',
      icon: Settings,
      active: pathname.startsWith('/admin/settings')
    }
  ]

  return (
    <>
      {/* Header */}
      <div className="p-4 border-b border-light-grey">
        <h1 className="text-xl font-financier text-cbre-green">
          Wolf Studio Admin
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                item.active
                  ? 'bg-cbre-green/10 text-cbre-green font-semibold'
                  : 'text-dark-grey hover:bg-lighter-grey'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="font-calibre">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* User Info & Sign Out */}
      <div className="p-4 border-t border-light-grey">
        <div className="mb-3">
          <p className="text-sm text-dark-grey font-calibre">
            Signed in as
          </p>
          <p className="text-sm font-calibre text-cbre-green truncate">
            {user?.email}
          </p>
        </div>
        <CBREButton
          variant="outline"
          onClick={handleSignOut}
          className="w-full flex items-center justify-center space-x-2"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </CBREButton>
      </div>
    </>
  )
}

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-lighter-grey">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-light-grey flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto overscroll-y-contain">
          <AdminNavigation />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto overscroll-contain">
        {children}
      </div>
    </div>
  )
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AuthProvider>
  )
} 