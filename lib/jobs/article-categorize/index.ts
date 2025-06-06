import Article from '../../../models/Article'
import connectToDatabase from '../../db'
import { categorizeArticle } from './openai-client'

export async function categorizeOneArticle() {
  console.log(`🤖 Starting single article categorization test`)
  
  try {
    await connectToDatabase()

    // Get just 1 article from the database
    const article = await Article.findOne().lean()
    
    if (!article) {
      console.log('❌ No articles found in database')
      return
    }

    console.log(`📄 Found article: ${article.title}`)

    // Send to OpenAI for categorization
    const result = await categorizeArticle(
      article.title,
      article.metaDescription || '',
      article.sourceName
    )

    // Print OpenAI response to console
    console.log(`📝 OpenAI Response:`)
    console.log(JSON.stringify(result, null, 2))

  } catch (error) {
    console.error(`❌ Categorization failed:`, error)
    throw error
  }
}