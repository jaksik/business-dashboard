import { NextRequest, NextResponse } from 'next/server'
import { categorizeArticles } from '../../../../lib/jobs/article-categorize'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const articleCount = body.articleCount || 1

    await categorizeArticles(articleCount, 'api')

    return NextResponse.json({
      message: `Article categorization completed for ${articleCount} articles - check console for detailed results and run log`
    })

  } catch (error) {
    console.error('Categorization API error:', error)
    return NextResponse.json(
      { error: 'Categorization failed' },
      { status: 500 }
    )
  }
}