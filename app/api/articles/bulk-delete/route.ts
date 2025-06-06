import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectToDatabase from '@/lib/db'
import { Article } from '@/models'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const { articleIds } = await request.json()
    
    if (!Array.isArray(articleIds) || articleIds.length === 0) {
      return NextResponse.json({ error: 'Invalid article IDs provided' }, { status: 400 })
    }

    // Validate that all IDs are strings
    if (!articleIds.every(id => typeof id === 'string')) {
      return NextResponse.json({ error: 'All article IDs must be strings' }, { status: 400 })
    }

    // Connect to database
    await connectToDatabase()
    
    // Perform bulk delete
    const result = await Article.deleteMany({
      _id: { $in: articleIds }
    })

    return NextResponse.json({ 
      success: true,
      message: `Successfully deleted ${result.deletedCount} article${result.deletedCount > 1 ? 's' : ''}`,
      deletedCount: result.deletedCount 
    })

  } catch (error) {
    console.error('Bulk delete error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      message: 'Failed to delete articles'
    }, { status: 500 })
  }
}
