import connectToDatabase from '@/lib/db'
import { Article } from '@/models'
import type { ParsedArticle, SaveResult } from '@/lib/jobs/article-fetch/types'

export async function saveArticlesToDatabase(
  articles: ParsedArticle[],
  sourceId: string,
  sourceName: string,
  jobId: string
): Promise<SaveResult> {
  console.log(`💾 [${jobId}] Article Saver: Processing ${articles.length} articles from ${sourceName}`)
  
  const result: SaveResult = {
    totalArticles: articles.length,
    savedArticles: 0,
    skippedDuplicates: 0,
    errors: []
  }

  if (articles.length === 0) {
    console.log(`ℹ️ [${jobId}] Article Saver: No articles to process`)
    return result
  }

  try {
    await connectToDatabase()

    // Process each article
    for (let i = 0; i < articles.length; i++) {
      const article = articles[i]
      
      try {
        // Check for duplicates by URL and GUID for better duplicate detection
        const duplicateQuery: {
          $or: Array<{ link: string } | { guid: string }>
        } = {
          $or: [
            { link: article.link }
          ]
        }

        // If article has GUID, also check for duplicate GUID
        if (article.guid) {
          duplicateQuery.$or.push({ guid: article.guid })
        }

        const existingArticle = await Article.findOne(duplicateQuery)
        
        if (existingArticle) {
          console.log(`🔄 [${jobId}] Article Saver: Skipping duplicate - "${article.title}"`)
          result.skippedDuplicates++
          continue
        }

        // Save the article to database
        const newArticle = new Article({
          title: article.title,
          link: article.link,
          sourceName: sourceName,
          publishedDate: article.publishedDate,
          metaDescription: article.metaDescription || '',
          guid: article.guid,
          fetchedAt: new Date(),
          categorization: {
            status: 'pending'
          }
        })

        await newArticle.save()
        console.log(`💾 [${jobId}] Article Saver: Saved article - "${article.title}"`)
        
        result.savedArticles++

      } catch (articleError) {
        const errorMsg = `Failed to process article "${article.title}": ${articleError instanceof Error ? articleError.message : 'Unknown error'}`
        console.error(`❌ [${jobId}] Article Saver: ${errorMsg}`)
        result.errors.push(errorMsg)
      }
    }

    console.log(`✅ [${jobId}] Article Saver: Completed processing for ${sourceName}`)
    console.log(`   📊 Total: ${result.totalArticles}, Saved: ${result.savedArticles}, Duplicates: ${result.skippedDuplicates}, Errors: ${result.errors.length}`)
    
    return result

  } catch (error) {
    const errorMsg = `Database operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    console.error(`❌ [${jobId}] Article Saver: ${errorMsg}`)
    result.errors.push(errorMsg)
    return result
  }
}

/**
 * Check if an article already exists in the database
 */
export async function checkArticleExists(url: string, guid?: string): Promise<boolean> {
  try {
    await connectToDatabase()
    
    const duplicateQuery: {
      $or: Array<{ link: string } | { guid: string }>
    } = {
      $or: [
        { link: url }
      ]
    }

    // If GUID provided, also check for duplicate GUID
    if (guid) {
      duplicateQuery.$or.push({ guid: guid })
    }
    
    const existing = await Article.findOne(duplicateQuery)
    return !!existing
    
  } catch (error) {
    console.error('Error checking article existence:', error)
    return false
  }
}