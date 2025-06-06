import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { fetchAllArticles } from '@/lib/jobs/article-fetch'

// POST /api/jobs/article-fetch/bulk
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Parse request body for optional maxArticles parameter
    const body = await request.json().catch(() => ({}))
    const userMaxArticles = body.maxArticles // Pass raw user input, let system handle validation

    console.log(`🔄 Bulk article fetch requested by: ${session.user.email}`)
    console.log(`🔢 User requested articles per source: ${userMaxArticles || 'default'}`)
    
    // Start the bulk fetch job with user's article limit (system will apply safe limits)
    const result = await fetchAllArticles(userMaxArticles)
    
    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('❌ Bulk article fetch failed:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}