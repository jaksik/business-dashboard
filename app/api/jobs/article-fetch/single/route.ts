import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { fetchArticlesFromSource } from '@/lib/jobs/article-fetch'

// POST /api/jobs/article-fetch/single
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

    // Parse request body
    const body = await request.json()
    const { sourceId, maxArticles: userMaxArticles } = body

    if (!sourceId) {
      return NextResponse.json(
        { error: 'sourceId is required' },
        { status: 400 }
      )
    }

    console.log(`🎯 Single source fetch requested by: ${session.user.email} for source: ${sourceId}`)
    console.log(`🔢 User requested article limit: ${userMaxArticles || 'default'}`)
    
    // Start the single source fetch job with user's article limit (system will apply safe limits)
    const result = await fetchArticlesFromSource(sourceId, userMaxArticles)
    
    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('❌ Single source fetch failed:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}
