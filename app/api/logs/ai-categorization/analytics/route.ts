import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '../../../../../lib/db'
import ArticleCategorizationLog from '../../../../../models/ArticleCategorizationLog'

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')

    // Date filter
    const dateThreshold = new Date()
    dateThreshold.setDate(dateThreshold.getDate() - days)

    // Get summary statistics
    const totalRuns = await ArticleCategorizationLog.countDocuments({
      startTime: { $gte: dateThreshold }
    })

    const completedRuns = await ArticleCategorizationLog.countDocuments({
      startTime: { $gte: dateThreshold },
      status: 'completed'
    })

    // Get cost and token totals
    const costAnalytics = await ArticleCategorizationLog.aggregate([
      { $match: { startTime: { $gte: dateThreshold } } },
      {
        $group: {
          _id: null,
          totalCost: { $sum: '$openaiUsage.estimatedCostUSD' },
          totalTokens: { $sum: '$openaiUsage.totalTokens' },
          totalArticlesProcessed: { $sum: '$totalArticlesSuccessful' },
          avgProcessingTime: { $avg: '$processingTimeMs' }
        }
      }
    ])

    // Get daily run counts for trend
    const dailyRuns = await ArticleCategorizationLog.aggregate([
      { $match: { startTime: { $gte: dateThreshold } } },
      {
        $group: {
          _id: { 
            $dateToString: { 
              format: '%Y-%m-%d', 
              date: '$startTime' 
            } 
          },
          count: { $sum: 1 },
          successfulArticles: { $sum: '$totalArticlesSuccessful' },
          failedArticles: { $sum: '$totalArticlesFailed' }
        }
      },
      { $sort: { '_id': 1 } }
    ])

    // Get category distributions
    const categoryDistributions = await ArticleCategorizationLog.aggregate([
      { $match: { startTime: { $gte: dateThreshold } } },
      {
        $group: {
          _id: null,
          newsCategories: { $push: '$newsCategoryDistribution' },
          techCategories: { $push: '$techCategoryDistribution' }
        }
      }
    ])

    const analytics = costAnalytics[0] || {
      totalCost: 0,
      totalTokens: 0,
      totalArticlesProcessed: 0,
      avgProcessingTime: 0
    }

    const successRate = totalRuns > 0 ? (completedRuns / totalRuns) * 100 : 0

    return NextResponse.json({
      summary: {
        totalRuns,
        completedRuns,
        successRate: Math.round(successRate * 100) / 100,
        totalCost: analytics.totalCost,
        totalTokens: analytics.totalTokens,
        totalArticlesProcessed: analytics.totalArticlesProcessed,
        avgProcessingTimeMs: Math.round(analytics.avgProcessingTime || 0)
      },
      dailyTrends: dailyRuns,
      categoryDistributions: categoryDistributions[0] || { newsCategories: [], techCategories: [] }
    })

  } catch (error) {
    console.error('Failed to fetch categorization analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categorization analytics' },
      { status: 500 }
    )
  }
}
