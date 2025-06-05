'use client'

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Image from "next/image"
import { AuthButton } from "./components/auth/auth-button"

export default function Home() {
  const { status } = useSession()
  const router = useRouter()

  useEffect(() => {
    // Redirect to dashboard if user is authenticated
    if (status === 'authenticated') {
      router.push('/dashboard')
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

  // Show sign-in page if not authenticated
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <div className="mx-auto h-12 w-auto flex justify-center">
            <Image
              src="/next.svg"
              alt="Business Dashboard"
              width={120}
              height={25}
              className="dark:invert"
              priority
            />
          </div>
          <h1 className="mt-6 text-3xl font-extrabold text-gray-900">
            Business Dashboard
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access your business dashboard
          </p>
        </div>
        
        <div className="mt-8">
          <AuthButton />
        </div>
        
        <div className="mt-8 p-6 bg-white rounded-lg shadow-sm border">
          <h2 className="text-lg font-medium text-gray-900 mb-2">
            What you&apos;ll get access to:
          </h2>
          <ul className="text-sm text-gray-600 space-y-1 text-left">
            <li>• Real-time business metrics</li>
            <li>• Revenue and customer analytics</li>
            <li>• Performance tracking</li>
            <li>• Personalized insights</li>
          </ul>
        </div>
      </div>
    </div>
  )
}