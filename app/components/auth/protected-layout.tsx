'use client'

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"
import { AuthButton } from "./auth-button"

interface ProtectedLayoutProps {
  children: React.ReactNode
  title?: string
}

export function ProtectedLayout({ children, title = "Personal Dashboard" }: ProtectedLayoutProps) {
  const { status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    }
  }, [status, router])

  // Show loading state
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

  // Don't render anything while redirecting
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
                <span className="ml-3 text-xl font-bold text-gray-900">Business Dashboard</span>
              </Link>

              {/* Navigation Links */}
              <nav className="hidden md:flex space-x-6">

                <Link href="/dashboard/news/sources" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Sources
                </Link>
                <Link href="/dashboard/news/articles" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Articles
                </Link>
                <Link href="/dashboard/news/fetch-logs" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Logs
                </Link>
              </nav>
            </div>
            <AuthButton />
          </div>
        </div>
      </header>

      {/* Page Title */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
