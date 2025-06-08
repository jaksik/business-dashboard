import Article from '../../../models/Article'
import connectToDatabase from '../../db'
import { categorizeArticlesBatch } from './openai-client'
import {
  createCategorizationRunLog,
  updateRunLogAttempted,
  addArticleResults,
  addProcessingError,
  finalizeRunLog,
  calculateOpenAICost,
} from './utils/log-generator'
import { IArticleCategorizationResult } from '../../../models/ArticleCategorizationLog'

// Global configuration for max articles per categorization run
const DEFAULT_MAX_ARTICLES = 10 // Easily configurable global default
const FAILSAFE_MAX_ARTICLES = 20 // Hard-coded failsafe maximum - DO NOT CHANGE

export async function categorizeArticles(
  articleCount: number = DEFAULT_MAX_ARTICLES,
  triggeredBy: 'manual' | 'scheduled' | 'api' = 'manual'
) {
  // Apply failsafe limit
  const safeArticleCount = Math.min(articleCount, FAILSAFE_MAX_ARTICLES)

  if (articleCount > FAILSAFE_MAX_ARTICLES) {
    console.warn(`⚠️ Requested ${articleCount} articles, but limiting to failsafe maximum of ${FAILSAFE_MAX_ARTICLES}`)
  }

  console.log(`🤖 Starting categorization for ${safeArticleCount} article(s)`)

  // Connect to database first
  await connectToDatabase()

  // Create initial run log and track start time
  const startTime = Date.now()
  const runLog = await createCategorizationRunLog(safeArticleCount, triggeredBy)
  console.log(`📊 Created run log: ${runLog._id}`)

  try {
    // Get uncategorized articles only (status: 'pending')
    const articles = await Article.find({
      'categorization.status': 'pending'
    })
      .sort({ publishedDate: -1 }) // Sort by publishedDate descending (newest first)
      .limit(safeArticleCount)
      .lean()
    if (!articles || articles.length === 0) {
      console.log('❌ No uncategorized articles found in database')
      await addProcessingError(runLog, 'No uncategorized articles found')
      await finalizeRunLog(runLog, startTime)
      return
    }

    console.log(`📄 Found ${articles.length} uncategorized article(s) to categorize`)
    await updateRunLogAttempted(runLog, articles.length)

    // Update article status to 'processing'
    const articleIds = articles.map(a => a._id)
    await Article.updateMany(
      { _id: { $in: articleIds } },
      { 'categorization.status': 'processing' }
    )

    // Process all articles in a single OpenAI call
    const allArticleResults: IArticleCategorizationResult[] = []
    const processingStartTime = Date.now()

    try {
      console.log(`\n📦 Processing ${articles.length} articles in single request`)

      // Prepare data for OpenAI
      const articlesData = articles.map(article => ({
        _id: article._id.toString(),
        title: article.title,
        metaDescription: article.metaDescription,
        sourceName: article.sourceName
      }))

      const { results, usage } = await categorizeArticlesBatch(articlesData)
      const processingTime = Date.now() - processingStartTime

      // Process results and update articles
      for (let i = 0; i < results.length; i++) {
        const result = results[i]
        const article = articles[i]

        try {
          // Update article in database
          await Article.findByIdAndUpdate(article._id, {
            'categorization.status': 'completed',
            'categorization.categories.news': result.newsCategory,
            'categorization.categories.tech': result.techCategory,
            'categorization.rationale': result.rationale,
            'categorization.categorizedAt': new Date()
          })

          // Create article result for logging
          const articleResult: IArticleCategorizationResult = {
            articleId: article._id.toString(),
            title: article.title,
            newsCategory: result.newsCategory,
            techCategory: result.techCategory,
            rationale: result.rationale,
            confidence: result.confidence,
            processingTimeMs: Math.round(processingTime / articles.length),
            status: 'success'
          }

          allArticleResults.push(articleResult)

          console.log(`✅ Categorized "${article.title}":`)
          console.log(`   News: ${result.newsCategory}`)
          console.log(`   Tech: ${result.techCategory}`)
          console.log(`   Confidence: ${result.confidence}%`)

        } catch (updateError) {
          console.error(`❌ Failed to update article ${article._id}:`, updateError)

          // Mark article as failed
          await Article.findByIdAndUpdate(article._id, {
            'categorization.status': 'failed'
          })

          // Add failed result
          const failedResult: IArticleCategorizationResult = {
            articleId: article._id.toString(),
            title: article.title,
            newsCategory: result.newsCategory,
            techCategory: result.techCategory,
            rationale: result.rationale,
            confidence: result.confidence,
            processingTimeMs: Math.round(processingTime / articles.length),
            status: 'failed',
            errorMessage: updateError instanceof Error ? updateError.message : 'Unknown error'
          }

          allArticleResults.push(failedResult)
          await addProcessingError(runLog, `Failed to update article ${article._id}: ${updateError}`)
        }
      }

      // Add all results to run log
      await addArticleResults(runLog, allArticleResults)

      // Finalize the run log with OpenAI usage data
      await finalizeRunLog(runLog, startTime, {
        promptTokens: usage.promptTokens,
        completionTokens: usage.completionTokens,
        totalTokens: usage.totalTokens,
        modelUsed: 'gpt-4o-mini'
      })

      const successCount = allArticleResults.filter(r => r.status === 'success').length
      const failureCount = allArticleResults.filter(r => r.status === 'failed').length
      const estimatedCost = calculateOpenAICost({
        promptTokens: usage.promptTokens,
        completionTokens: usage.completionTokens,
        totalTokens: usage.totalTokens,
        modelUsed: 'gpt-4o-mini'
      })

      console.log(`\n✅ Completed categorization run:`)
      console.log(`   📊 Run ID: ${runLog._id}`)
      console.log(`   ✅ Successful: ${successCount}`)
      console.log(`   ❌ Failed: ${failureCount}`)
      console.log(`   💰 Estimated cost: $${estimatedCost.toFixed(4)}`)
      console.log(`   🔤 Total tokens: ${usage.totalTokens}`)

    } catch (processingError) {
      console.error(`❌ Failed to categorize articles:`, processingError)

      // Mark all articles as failed
      await Article.updateMany(
        { _id: { $in: articleIds } },
        { 'categorization.status': 'failed' }
      )

      // Add failed results for all articles
      articles.forEach(article => {
        const failedResult: IArticleCategorizationResult = {
          articleId: article._id.toString(),
          title: article.title,
          newsCategory: null, // No false categorization - leave empty
          techCategory: null, // No false categorization - leave empty
          rationale: 'Processing failed - OpenAI error',
          confidence: 0,
          status: 'failed',
          errorMessage: processingError instanceof Error ? processingError.message : 'Unknown error'
        }
        allArticleResults.push(failedResult)
      })

      await addProcessingError(runLog, `Processing failed: ${processingError}`)
      await addArticleResults(runLog, allArticleResults)
      await finalizeRunLog(runLog, startTime)
    }

  } catch (error) {
    console.error(`❌ Categorization job failed:`, error)
    await addProcessingError(runLog, `Job failed: ${error}`)
    await finalizeRunLog(runLog, startTime)
    throw error
  }
}