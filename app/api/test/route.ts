import { NextResponse } from 'next/server'
import connectToDatabase from '../../../lib/db'
import Article from '../../../models/Article'

export async function GET() {
  try {
    await connectToDatabase()

    const articles = await Article.find({})
      .sort({ publishedAt: -1 })
      .limit(40)
      .select('title sourceName')
      .lean()

    // Transform to only include title and source
    const result = articles.map(article => ({
      title: article.title,
      source: article.sourceName
    }))

    return NextResponse.json({
      count: result.length,
      articles: result
    })

  } catch (error) {
    console.error('Error fetching articles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    )
  }
}