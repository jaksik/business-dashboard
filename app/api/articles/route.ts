import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import connectToDatabase from '../../../lib/db'
import Article from '../../../models/Article'
import Source from '../../../models/Source'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const search = searchParams.get('search') || ''
    const source = searchParams.get('source') || ''
    const category = searchParams.get('category') || ''
    const status = searchParams.get('status') || ''
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const sortBy = searchParams.get('sortBy') || 'fetchedAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 500) // Max 500 for safety
    const page = parseInt(searchParams.get('page') || '1')

    // Build query
    interface QueryFilter {
      $or?: Array<Record<string, unknown>>
      sourceName?: string
      'categorization.status'?: string
      'categorization.categories.news'?: string
      'categorization.categories.tech'?: string
      publishedDate?: {
        $gte?: Date
        $lte?: Date
      }
    }
    
    const query: QueryFilter = {}

    // Search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { metaDescription: { $regex: search, $options: 'i' } },
        { sourceName: { $regex: search, $options: 'i' } }
      ]
    }

    // Source filter
    if (source) {
      query.sourceName = source
    }

    // Status filter
    if (status) {
      query['categorization.status'] = status
    }

    // Category filter
    if (category) {
      query.$or = [
        { 'categorization.categories.news': category },
        { 'categorization.categories.tech': category }
      ]
    }

    // Date filter
    if (dateFrom || dateTo) {
      query.publishedDate = {}
      if (dateFrom) {
        query.publishedDate.$gte = new Date(dateFrom)
      }
      if (dateTo) {
        query.publishedDate.$lte = new Date(dateTo)
      }
    }

    // Build sort object
    const sort: Record<string, 1 | -1> = {}
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1

    // Calculate skip for pagination
    const skip = (page - 1) * limit

    // Execute query with pagination
    const [articles, totalCount, sources] = await Promise.all([
      Article.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Article.countDocuments(query),
      Source.find({ isActive: true }).select('name').lean()
    ])

    // Get unique categories for filter options
    const categoryAggregation = await Article.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          newsCategories: { $addToSet: '$categorization.categories.news' },
          techCategories: { $addToSet: '$categorization.categories.tech' }
        }
      }
    ])

    const categories = new Set<string>()
    if (categoryAggregation.length > 0) {
      const { newsCategories, techCategories } = categoryAggregation[0]
      newsCategories.forEach((cat: string) => cat && categories.add(cat))
      techCategories.forEach((cat: string) => cat && categories.add(cat))
    }

    return NextResponse.json({
      articles,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      },
      filters: {
        sources: sources.map(s => s.name),
        categories: Array.from(categories).sort()
      }
    })

  } catch (error) {
    console.error('Error fetching articles:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
