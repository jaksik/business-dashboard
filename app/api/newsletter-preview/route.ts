import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/db'
import { Article } from '@/models'
import { TECH_CATEGORIES } from '@/lib/constants/categories'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const days = parseInt(searchParams.get('days') || '3')

    await connectToDatabase()

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - days)

    // Fetch articles from the specified date range that have been categorized
    const articles = await Article.find({
      publishedDate: {
        $gte: startDate,
        $lte: endDate
      },
      'categorization.status': 'completed',
      'categorization.categories.news': { $exists: true },
      'categorization.categories.tech': { $exists: true }
    }).select({
      title: 1,
      link: 1,
      sourceName: 1,
      publishedDate: 1,
      metaDescription: 1,
      categorization: 1
    }).sort({ publishedDate: -1 })

    // Group articles by tech category
    const groupedArticles: { [key: string]: unknown[] } = {}
    
    // Initialize all tech categories
    TECH_CATEGORIES.forEach(category => {
      groupedArticles[category] = []
    })

    // Group articles
    articles.forEach(article => {
      const techCategory = article.categorization.categories.tech
      if (techCategory && groupedArticles[techCategory]) {
        groupedArticles[techCategory].push(article)
      }
    })

    return NextResponse.json(groupedArticles)

  } catch (error) {
    console.error('Newsletter preview API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch newsletter data' },
      { status: 500 }
    )
  }
}
