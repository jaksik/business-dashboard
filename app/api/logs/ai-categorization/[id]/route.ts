import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '../../../../../lib/db'
import ArticleCategorizationLog from '../../../../../models/ArticleCategorizationLog'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase()

    const { id } = await params
    
    const log = await ArticleCategorizationLog.findById(id).lean()
    
    if (!log) {
      return NextResponse.json(
        { error: 'Categorization log not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(log)

  } catch (error) {
    console.error('Failed to fetch categorization log:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categorization log' },
      { status: 500 }
    )
  }
}
