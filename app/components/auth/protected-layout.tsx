'use client'

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"
import { AuthButton } from "./auth-button"
import { DropdownMenu } from "./dropdown-menu" // 👈 Import the new component

// 1. Restructure your navigation configuration to group links by menu
const NAV_MENUS = {
  'Articles': [
    { label: 'View Articles', href: '/dashboard/articles' },
    { label: 'Fetch New Articles', href: '/dashboard/articles/sources' },
    { label: 'Article Fetch Logs', href: '/dashboard/articles/fetch-logs' },
  ],
  'YouTube': [
    { label: 'Stats', href: '/dashboard/youtube' },
    { label: 'Settings', href: '/dashboard/settings' },
  ]
} as const

interface ProtectedLayoutProps {
  children: React.ReactNode
  title?: string
}

export function ProtectedLayout({ children, title = "Personal Dashboard" }: ProtectedLayoutProps) {
  const { status } = useSession()
  const router = useRouter()

  // This logic remains the same
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    }
  }, [status, router])

  // Loading state remains the same
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Unauthenticated state remains the same
  if (status === 'unauthenticated') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Navigation */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-8">
              <Link href="/dashboard" className="flex items-center">
                <span className="text-3xl font-bold text-gray-900">Welcome</span>
              </Link>

              {/* 2. Render dropdowns by mapping over the new NAV_MENUS object */}
              <nav className="hidden md:flex space-x-6">
                {Object.entries(NAV_MENUS).map(([title, links]) => (
                  <DropdownMenu key={title} title={title} links={links} />
                ))}
              </nav>
            </div>
            <AuthButton />
          </div>
        </div>
      </header>

      {/* Page Title */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:_8 py-8">
        {children}
      </main>
    </div>
  )
}