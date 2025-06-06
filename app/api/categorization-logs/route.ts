import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '../../../lib/db'
import ArticleCategorizationLog from '../../../models/ArticleCategorizationLog'

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const triggeredBy = searchParams.get('triggeredBy')
    const days = parseInt(searchParams.get('days') || '30')

    // Build filter query
    // Define a more specific type for the filter object
    interface LogFilterQuery {
      status?: string;
      triggeredBy?: string;
      startTime?: { $gte: Date };
    }
    const filter: LogFilterQuery = {}
    
    if (status) {
      filter.status = status
    }
    
    if (triggeredBy) {
      filter.triggeredBy = triggeredBy
    }

    // Date filter for recent runs
    if (days) {
      const dateThreshold = new Date()
      dateThreshold.setDate(dateThreshold.getDate() - days)
      filter.startTime = { $gte: dateThreshold }
    }

    // Get total count for pagination
    const total = await ArticleCategorizationLog.countDocuments(filter)

    // Get paginated results
    const logs = await ArticleCategorizationLog.find(filter)
      .sort({ startTime: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('startTime endTime status totalArticlesAttempted totalArticlesSuccessful totalArticlesFailed processingTimeMs triggeredBy openaiUsage.estimatedCostUSD openaiUsage.totalTokens')
      .lean()

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })

  } catch (error) {
    console.error('Failed to fetch categorization logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categorization logs' },
      { status: 500 }
    )
  }
}
