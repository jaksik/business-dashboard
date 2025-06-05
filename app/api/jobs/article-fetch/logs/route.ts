import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { ArticleFetchLog } from '@/models'
import connectToDatabase from '@/lib/db'

// GET /api/jobs/article-fetch/logs
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status') // optional filter
    const jobType = searchParams.get('jobType') // optional filter

    await connectToDatabase()

    // Build query
    const query: Record<string, string> = {}
    if (status) {
      query.status = status
    }
    if (jobType) {
      query.jobType = jobType
    }

    // Fetch logs
    const logs = await ArticleFetchLog.find(query)
      .sort({ createdAt: -1 })
      .limit(Math.min(limit, 50)) // Cap at 50 logs
      .select('-__v') // Exclude version field
      .lean()

    // Get summary stats
    const stats = await ArticleFetchLog.getJobStats(7) // Last 7 days

    return NextResponse.json({
      success: true,
      data: {
        logs,
        stats: stats[0] || {
          totalJobs: 0,
          successfulJobs: 0,
          failedJobs: 0,
          totalArticlesSaved: 0,
          totalDuplicatesSkipped: 0,
          avgExecutionTime: 0
        }
      }
    })

  } catch (error) {
    console.error('❌ Failed to fetch article fetch logs:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch logs',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// DELETE /api/jobs/article-fetch/logs - Clean up old logs
export async function DELETE(request: NextRequest) {
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
    const body = await request.json().catch(() => ({}))
    const { olderThanDays = 30 } = body

    await connectToDatabase()

    // Delete logs older than specified days
    const dateThreshold = new Date()
    dateThreshold.setDate(dateThreshold.getDate() - olderThanDays)

    const result = await ArticleFetchLog.deleteMany({
      createdAt: { $lt: dateThreshold }
    })

    console.log(`🧹 Cleaned up ${result.deletedCount} old fetch logs (older than ${olderThanDays} days)`)

    return NextResponse.json({
      success: true,
      data: {
        deletedCount: result.deletedCount,
        olderThanDays
      }
    })

  } catch (error) {
    console.error('❌ Failed to clean up fetch logs:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to clean up logs',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
