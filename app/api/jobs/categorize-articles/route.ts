import { NextRequest, NextResponse } from 'next/server'
import { categorizeOneArticle } from '../../../../lib/jobs/article-categorize'

export async function POST(request: NextRequest) {
  try {
    await categorizeOneArticle()

    return NextResponse.json({
      message: 'Article categorization test completed - check console for OpenAI response'
    })

  } catch (error) {
    console.error('Categorization API error:', error)
    return NextResponse.json(
      { error: 'Categorization failed' },
      { status: 500 }
    )
  }
}