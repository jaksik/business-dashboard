import ArticleCategorizationLog, { 
  IArticleCategorizationLog,
  IArticleCategorizationResult,
  INewsCategoryDistribution,
  ITechCategoryDistribution
} from '../../../../models/ArticleCategorizationLog'
import { 
  createEmptyNewsCategoryDistribution,
  createEmptyTechCategoryDistribution
} from '../../../constants/categories/index'

/**
 * Creates an initial categorization run log
 */
export async function createCategorizationRunLog(
  articleLimit: number,
  batchSize: number,
  triggeredBy: 'manual' | 'scheduled' | 'api' = 'manual'
): Promise<IArticleCategorizationLog> {
  const runLog = new ArticleCategorizationLog({
    articleLimit,
    batchSize,
    triggeredBy,
    totalArticlesAttempted: 0,
    totalArticlesSuccessful: 0,
    totalArticlesFailed: 0,
    newsCategoryDistribution: createEmptyNewsCategoryDistribution(),
    techCategoryDistribution: createEmptyTechCategoryDistribution(),
    articleResults: [],
    processingErrors: []
  })

  return await runLog.save()
}

/**
 * Updates the run log with the number of articles attempted
 */
export async function updateRunLogAttempted(
  runLog: IArticleCategorizationLog,
  attemptedCount: number
): Promise<void> {
  runLog.totalArticlesAttempted = attemptedCount
  await runLog.save()
}

/**
 * Adds article results to the run log
 */
export async function addArticleResults(
  runLog: IArticleCategorizationLog,
  results: IArticleCategorizationResult[]
): Promise<void> {
  runLog.articleResults.push(...results)
  
  // Update success/failure counts
  const successful = results.filter(r => r.status === 'success').length
  const failed = results.filter(r => r.status === 'failed').length
  
  runLog.totalArticlesSuccessful += successful
  runLog.totalArticlesFailed += failed
  
  await runLog.save()
}

/**
 * Adds processing errors to the run log
 */
export async function addProcessingError(
  runLog: IArticleCategorizationLog,
  error: string
): Promise<void> {
  runLog.processingErrors.push(error)
  await runLog.save()
}

/**
 * Calculates OpenAI cost based on token usage
 * GPT-4o-mini pricing: $0.15 per 1M input tokens, $0.60 per 1M output tokens
 */
export function calculateOpenAICost(usage: {
  promptTokens: number
  completionTokens: number
  totalTokens: number
  modelUsed: string
}): number {
  const inputCostPer1M = 0.15
  const outputCostPer1M = 0.60

  const inputCost = (usage.promptTokens / 1_000_000) * inputCostPer1M
  const outputCost = (usage.completionTokens / 1_000_000) * outputCostPer1M

  return inputCost + outputCost
}

/**
 * Calculates category distributions from article results
 */
export function calculateCategoryDistributions(
  articleResults: IArticleCategorizationResult[]
): {
  newsCategoryDistribution: INewsCategoryDistribution
  techCategoryDistribution: ITechCategoryDistribution
} {
  const newsCategoryDistribution = createEmptyNewsCategoryDistribution()
  const techCategoryDistribution = createEmptyTechCategoryDistribution()

  articleResults.forEach(result => {
    if (result.status === 'success') {
      if (result.newsCategory) {
        newsCategoryDistribution[result.newsCategory]++
      }
      if (result.techCategory) {
        techCategoryDistribution[result.techCategory]++
      }
    }
  })

  return { newsCategoryDistribution, techCategoryDistribution }
}

/**
 * Updates the run log with OpenAI usage data
 */
export async function updateRunLogOpenAIUsage(
  runLog: IArticleCategorizationLog,
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
    modelUsed: string
  }
): Promise<void> {
  const estimatedCostUSD = calculateOpenAICost(usage)
  
  runLog.openaiUsage = {
    promptTokens: usage.promptTokens,
    completionTokens: usage.completionTokens,
    totalTokens: usage.totalTokens,
    estimatedCostUSD,
    modelUsed: usage.modelUsed
  }
  
  await runLog.save()
}

/**
 * Finalizes the run log with completion data
 */
export async function finalizeRunLog(
  runLog: IArticleCategorizationLog,
  startTime: number,
  openaiUsage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
    modelUsed: string
  }
): Promise<void> {
  const endTime = new Date()
  const processingTimeMs = Date.now() - startTime

  // Calculate category distributions
  const { newsCategoryDistribution, techCategoryDistribution } = 
    calculateCategoryDistributions(runLog.articleResults)

  // Determine final status
  let status: 'completed' | 'completed_with_errors' | 'failed'
  if (runLog.totalArticlesFailed === 0 && runLog.totalArticlesSuccessful > 0) {
    status = 'completed'
  } else if (runLog.totalArticlesSuccessful > 0) {
    status = 'completed_with_errors'
  } else {
    status = 'failed'
  }

  // Update run log
  runLog.endTime = endTime
  runLog.status = status
  runLog.processingTimeMs = processingTimeMs
  runLog.newsCategoryDistribution = newsCategoryDistribution
  runLog.techCategoryDistribution = techCategoryDistribution

  // Update OpenAI usage if provided
  if (openaiUsage) {
    await updateRunLogOpenAIUsage(runLog, openaiUsage)
  }

  await runLog.save()
}

/**
 * Marks a run log as failed
 */
export async function markRunLogAsFailed(
  runLog: IArticleCategorizationLog,
  error: unknown,
  startTime: number
): Promise<void> {
  const endTime = new Date()
  const processingTimeMs = Date.now() - startTime

  runLog.endTime = endTime
  runLog.status = 'failed'
  runLog.processingTimeMs = processingTimeMs
  runLog.processingErrors.push(error instanceof Error ? error.message : 'Unknown error occurred')

  await runLog.save()
}