'use client'

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { AuthButton } from "./auth-button"

// Navigation configuration
const NAV_LINKS = [
  {
    label: 'Sources',
    href: '/dashboard/news/sources',
    section: 'main'
  },
  {
    label: 'Articles',
    href: '/dashboard/news/articles',
    section: 'main'
  },
  {
    label: 'Newsletter Preview',
    href: '/dashboard/news/newsletter-preview',
    section: 'main'
  },
  {
    label: 'Fetch Logs',
    href: '/dashboard/news/fetch-logs',
    section: 'logs'
  },
  {
    label: 'Categorization Logs',
    href: '/dashboard/news/categorization-logs',
    section: 'logs'
  },
  {
    label: 'Training',
    href: '/dashboard/news/categorization-training',
    section: 'training'
  }
] as const

interface ProtectedLayoutProps {
  children: React.ReactNode
  title?: string
}

export function ProtectedLayout({ children, title = "Personal Dashboard" }: ProtectedLayoutProps) {
  const { status } = useSession()
  const router = useRouter()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    }
  }, [status, router])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

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
                {/* News Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center text-gray-600 hover:text-gray-900 transition-colors focus:outline-none"
                  >
                    News
                    <svg 
                      className={`ml-1 h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-10">
                      {NAV_LINKS.map((link, index) => {
                        const isFirstInSection = index === 0 || NAV_LINKS[index - 1].section !== link.section
                        const needsSeparator = isFirstInSection && index > 0
                        
                        return (
                          <div key={link.href}>
                            {needsSeparator && <div className="border-t border-gray-100 my-1"></div>}
                            <Link 
                              href={link.href}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                              onClick={() => setIsDropdownOpen(false)}
                            >
                              {link.label}
                            </Link>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
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
