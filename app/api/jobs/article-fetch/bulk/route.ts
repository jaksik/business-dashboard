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
    const maxArticles = body.maxArticles || 10 // Default to 10 if not provided

    console.log(`🔄 Bulk article fetch requested by: ${session.user.email}`)
    console.log(`🔢 Article limit per source: ${maxArticles}`)
    
    // Start the bulk fetch job with article limit
    const result = await fetchAllArticles(maxArticles)
    
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