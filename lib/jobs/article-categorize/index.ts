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

export async function categorizeArticles(
  articleCount: number = 5, 
  batchSize: number = 5,
  triggeredBy: 'manual' | 'scheduled' | 'api' = 'manual'
) {
  console.log(`🤖 Starting categorization for ${articleCount} article(s) in batches of ${batchSize}`)
  
  // Connect to database first
  await connectToDatabase()
  
  // Create initial run log and track start time
  const startTime = Date.now()
  const runLog = await createCategorizationRunLog(articleCount, batchSize, triggeredBy)
  console.log(`📊 Created run log: ${runLog._id}`)
  
  try {

    // Get uncategorized articles only (status: 'pending')
    const articles = await Article.find({ 
      'categorization.status': 'pending' 
    }).limit(articleCount).lean()
    
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

    // Process articles in batches
    const totalBatches = Math.ceil(articles.length / batchSize)
    const allArticleResults: IArticleCategorizationResult[] = []
    const totalTokenUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 }
    
    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const startIndex = batchIndex * batchSize
      const endIndex = Math.min(startIndex + batchSize, articles.length)
      const batch = articles.slice(startIndex, endIndex)
      
      console.log(`\n📦 Processing batch ${batchIndex + 1}/${totalBatches} (${batch.length} articles)`)
      
      try {
        const batchStartTime = Date.now()
        
        // Send batch to OpenAI for categorization
        const batchData = batch.map(article => ({
          _id: article._id.toString(),
          title: article.title,
          metaDescription: article.metaDescription,
          sourceName: article.sourceName
        }))
        
        const { results, usage } = await categorizeArticlesBatch(batchData)
        const batchProcessingTime = Date.now() - batchStartTime
        
        // Accumulate token usage
        totalTokenUsage.promptTokens += usage.promptTokens
        totalTokenUsage.completionTokens += usage.completionTokens
        totalTokenUsage.totalTokens += usage.totalTokens
        
        // Process results and update articles
        for (let i = 0; i < results.length; i++) {
          const result = results[i]
          const article = batch[i]
          
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
              processingTimeMs: Math.round(batchProcessingTime / batch.length),
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
              processingTimeMs: Math.round(batchProcessingTime / batch.length),
              status: 'failed',
              errorMessage: updateError instanceof Error ? updateError.message : 'Unknown error'
            }
            
            allArticleResults.push(failedResult)
            await addProcessingError(runLog, `Failed to update article ${article._id}: ${updateError}`)
          }
        }
        
      } catch (batchError) {
        console.error(`❌ Failed to categorize batch ${batchIndex + 1}:`, batchError)
        
        // Mark all articles in batch as failed
        await Article.updateMany(
          { _id: { $in: batch.map(a => a._id) } },
          { 'categorization.status': 'failed' }
        )
        
        // Add failed results for all articles in batch
        batch.forEach(article => {
          const failedResult: IArticleCategorizationResult = {
            articleId: article._id.toString(),
            title: article.title,
            newsCategory: 'Likely Noise or Opinion', // Default fallback
            techCategory: 'Not Relevant', // Default fallback
            rationale: 'Failed to process',
            confidence: 0,
            status: 'failed',
            errorMessage: batchError instanceof Error ? batchError.message : 'Unknown batch error'
          }
          allArticleResults.push(failedResult)
        })
        
        await addProcessingError(runLog, `Batch ${batchIndex + 1} failed: ${batchError}`)
      }
    }

    // Add all results to run log
    await addArticleResults(runLog, allArticleResults)

    // Finalize the run log with OpenAI usage data
    await finalizeRunLog(runLog, startTime, {
      promptTokens: totalTokenUsage.promptTokens,
      completionTokens: totalTokenUsage.completionTokens,
      totalTokens: totalTokenUsage.totalTokens,
      modelUsed: 'gpt-4o-mini'
    })

    const successCount = allArticleResults.filter(r => r.status === 'success').length
    const failureCount = allArticleResults.filter(r => r.status === 'failed').length
    const estimatedCost = calculateOpenAICost({
      promptTokens: totalTokenUsage.promptTokens,
      completionTokens: totalTokenUsage.completionTokens,
      totalTokens: totalTokenUsage.totalTokens,
      modelUsed: 'gpt-4o-mini'
    })
    
    console.log(`\n✅ Completed categorization run:`)
    console.log(`   📊 Run ID: ${runLog._id}`)
    console.log(`   ✅ Successful: ${successCount}`)
    console.log(`   ❌ Failed: ${failureCount}`)
    console.log(`   💰 Estimated cost: $${estimatedCost.toFixed(4)}`)
    console.log(`   🔤 Total tokens: ${totalTokenUsage.totalTokens}`)

  } catch (error) {
    console.error(`❌ Categorization job failed:`, error)
    await addProcessingError(runLog, `Job failed: ${error}`)
    await finalizeRunLog(runLog, startTime)
    throw error
  }
}