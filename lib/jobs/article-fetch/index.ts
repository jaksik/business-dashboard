import connectToDatabase from '@/lib/db'
import { Source, ArticleFetchLog } from '@/models'
import type { ISource, IArticleFetchLog } from '@/models'
import { fetchRSSFeed } from './processors/rss-processor'
import { saveArticlesToDatabase } from './utils/article-saver'
import { generateJobResult, logJobCompletion } from './utils/log-generator'
import type { FetchResult, FetchJobResult, RSSFetchResult } from '@/lib/types/jobs/article-fetch'

/**
 * GLOBAL ARTICLE FETCH CONFIGURATION SYSTEM
 * ==========================================
 * 
 * This system implements a three-tier article limit configuration:
 * 
 * 1. DEFAULT_MAX_ARTICLES (10): The global default used when no user input is provided
 *    - Easily configurable by changing the constant below
 *    - Used for bulk operations and when users don't specify a limit
 * 
 * 2. User Input Variable: The number of articles requested by the user
 *    - Passed from frontend components (BulkFetchModule, SourcesList, etc.)
 *    - Can be any positive number, but is subject to failsafe protection
 * 
 * 3. FAILSAFE_MAX_ARTICLES (50): Hard-coded maximum limit for safety
 *    - Prevents system overload and API rate limiting
 *    - NEVER allow more than this number regardless of user input
 *    - DO NOT CHANGE without careful consideration of system resources
 * 
 * The calculateMaxArticles() function implements the logic:
 * - If no user input or invalid input: use DEFAULT_MAX_ARTICLES
 * - If user input is valid: use Math.min(userInput, FAILSAFE_MAX_ARTICLES)
 * 
 * This ensures the system is safe, predictable, and user-friendly.
 */

// Global configuration for max articles per source
const DEFAULT_MAX_ARTICLES = 10 // Easily configurable global default
const FAILSAFE_MAX_ARTICLES = 50 // Hard-coded failsafe maximum - DO NOT CHANGE

/**
 * Calculate the effective max articles limit with failsafe protection
 * @param userInput - User provided limit (optional)
 * @returns Safe article limit that doesn't exceed failsafe
 */
function calculateMaxArticles(userInput?: number): number {
  // If no user input, use default
  if (!userInput || userInput <= 0) {
    return DEFAULT_MAX_ARTICLES
  }
  
  // Apply failsafe limit - never allow more than the maximum
  return Math.min(userInput, FAILSAFE_MAX_ARTICLES)
}

type LeanSource = ISource & { _id: string }

class ArticleFetchOrchestrator {
  private jobId: string
  private startTime: Date
  private results: FetchResult[] = []
  private fetchLog: IArticleFetchLog | null = null

  constructor() {
    this.jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    this.startTime = new Date()
  }

  /**
   * Initialize fetch log in database
   */
  private async initializeFetchLog(jobType: 'single' | 'bulk', totalSources: number): Promise<void> {
    try {
      await connectToDatabase()
      
      this.fetchLog = new ArticleFetchLog({
        jobId: this.jobId,
        jobType,
        startTime: this.startTime,
        status: 'running',
        totalSources,
        sourceResults: [],
        summary: {
          totalArticlesProcessed: 0,
          totalArticlesSaved: 0,
          totalDuplicatesSkipped: 0,
          totalErrors: 0,
          executionTime: 0
        },
        jobErrors: []
      })

      await this.fetchLog.save()
      console.log(`📝 [${this.jobId}] Fetch log initialized for ${jobType} job`)
    } catch (error) {
      console.error(`⚠️ [${this.jobId}] Failed to initialize fetch log:`, error)
    }
  }

  /**
   * Update fetch log with source result
   */
  private async updateFetchLog(result: FetchResult, maxArticles?: number): Promise<void> {
    if (!this.fetchLog) return

    try {
      const sourceResult = {
        sourceId: result.sourceId,
        sourceName: result.sourceName,
        status: result.success ? 'success' as const : 'failed' as const,
        maxArticles,
        totalArticles: result.articlesFound,
        savedArticles: result.articlesSaved,
        skippedDuplicates: result.skippedDuplicates || 0,
        errors: result.error ? [result.error] : [],
        executionTime: result.duration
      }

      this.fetchLog.sourceResults.push(sourceResult)
      
      // Update summary
      this.fetchLog.summary.totalArticlesProcessed += (result.articlesProcessed || result.articlesFound)
      this.fetchLog.summary.totalArticlesSaved += result.articlesSaved
      this.fetchLog.summary.totalDuplicatesSkipped += (result.skippedDuplicates || 0)
      if (result.error) {
        this.fetchLog.summary.totalErrors++
        this.fetchLog.jobErrors.push(`${result.sourceName}: ${result.error}`)
      }

      await this.fetchLog.save()
    } catch (error) {
      console.error(`⚠️ [${this.jobId}] Failed to update fetch log:`, error)
    }
  }

  /**
   * Finalize fetch log
   */
  private async finalizeFetchLog(): Promise<void> {
    if (!this.fetchLog) return

    try {
      this.fetchLog.endTime = new Date()
      this.fetchLog.summary.executionTime = this.fetchLog.endTime.getTime() - this.startTime.getTime()
      
      // Determine final status
      const hasErrors = this.fetchLog.summary.totalErrors > 0
      const hasSuccessful = this.fetchLog.sourceResults.some(r => r.status === 'success')
      
      if (hasErrors && hasSuccessful) {
        this.fetchLog.status = 'partial'
      } else if (hasErrors) {
        this.fetchLog.status = 'failed'
      } else {
        this.fetchLog.status = 'completed'
      }

      await this.fetchLog.save()
      console.log(`📊 [${this.jobId}] Fetch log finalized with status: ${this.fetchLog.status}`)
    } catch (error) {
      console.error(`⚠️ [${this.jobId}] Failed to finalize fetch log:`, error)
    }
  }

  /**
   * Fetch articles from all active sources
   */
  async fetchAllSources(userMaxArticles?: number): Promise<FetchJobResult> {
    const maxArticles = calculateMaxArticles(userMaxArticles)
    console.log(`🚀 [${this.jobId}] Starting bulk article fetch at ${this.startTime.toISOString()}`)
    console.log(`🔢 [${this.jobId}] Article limit per source: ${maxArticles} (user requested: ${userMaxArticles || 'default'}, global default: ${DEFAULT_MAX_ARTICLES}, failsafe: ${FAILSAFE_MAX_ARTICLES})`)
    
    try {
      await connectToDatabase()
      
      // Get all active sources
      const sources = await Source.find({ isActive: true }).lean() as unknown as LeanSource[]
      console.log(`📋 [${this.jobId}] Found ${sources.length} active sources`)

      // Initialize fetch log
      await this.initializeFetchLog('bulk', sources.length)

      if (sources.length === 0) {
        console.log(`⚠️ [${this.jobId}] No active sources found`)
        await this.finalizeFetchLog()
        return generateJobResult(this.jobId, this.startTime, this.results)
      }

      // Process each source
      for (const source of sources) {
        await this.processSingleSource(source, maxArticles)
      }

      await this.finalizeFetchLog()
      const jobResult = generateJobResult(this.jobId, this.startTime, this.results)
      logJobCompletion(jobResult, 'bulk')

      return jobResult

    } catch (error) {
      console.error(`❌ [${this.jobId}] Bulk fetch failed:`, error)
      
      // Update fetch log with error
      if (this.fetchLog) {
        this.fetchLog.status = 'failed'
        this.fetchLog.endTime = new Date()
        this.fetchLog.jobErrors.push(error instanceof Error ? error.message : 'Unknown error')
        await this.fetchLog.save()
      }
      
      throw error
    }
  }

  /**
   * Fetch articles from a single source by ID
   */
  async fetchSingleSource(sourceId: string, userMaxArticles?: number): Promise<FetchJobResult> {
    const maxArticles = calculateMaxArticles(userMaxArticles)
    console.log(`🎯 [${this.jobId}] Starting single source fetch for: ${sourceId}`)
    console.log(`🔢 [${this.jobId}] Article limit: ${maxArticles} (user requested: ${userMaxArticles || 'default'}, global default: ${DEFAULT_MAX_ARTICLES}, failsafe: ${FAILSAFE_MAX_ARTICLES})`)
    
    try {
      await connectToDatabase()
      
      const source = await Source.findById(sourceId).lean() as unknown as LeanSource
      if (!source) {
        throw new Error(`Source not found: ${sourceId}`)
      }

      // Initialize fetch log
      await this.initializeFetchLog('single', 1)

      if (!source.isActive) {
        console.log(`⚠️ [${this.jobId}] Source is inactive: ${source.name}`)
      }

      await this.processSingleSource(source, maxArticles)
      
      await this.finalizeFetchLog()
      const jobResult = generateJobResult(this.jobId, this.startTime, this.results)
      logJobCompletion(jobResult, 'single')

      return jobResult

    } catch (error) {
      console.error(`❌ [${this.jobId}] Single source fetch failed:`, error)
      
      // Update fetch log with error
      if (this.fetchLog) {
        this.fetchLog.status = 'failed'
        this.fetchLog.endTime = new Date()
        this.fetchLog.jobErrors.push(error instanceof Error ? error.message : 'Unknown error')
        await this.fetchLog.save()
      }
      
      throw error
    }
  }

  /**
   * Process a single source (RSS or HTML)
   */
  private async processSingleSource(source: LeanSource, maxArticles: number): Promise<void> {
    const startTime = Date.now()
    console.log(`📡 [${this.jobId}] Processing source: ${source.name} (${source.type})`)
    console.log(`🔢 [${this.jobId}] Article limit: ${maxArticles}`)

    try {
      let result: FetchResult

      // Route to appropriate processor based on source type
      switch (source.type) {
        case 'rss':
          result = await this.processRSSSource(source, maxArticles)
          break
        case 'html':
          // result = await this.processHTMLSource(source) // TODO: Implement later
          throw new Error('HTML processing not yet implemented')
        default:
          throw new Error(`Unknown source type: ${source.type}`)
      }

      // Update source fetch status
      await this.updateSourceStatus(source._id, true, result)
      
      // Update fetch log
      await this.updateFetchLog(result, maxArticles)
      
      this.results.push(result)
      console.log(`✅ [${this.jobId}] ${source.name}: ${result.articlesSaved} articles processed`)

    } catch (error) {
      const duration = Date.now() - startTime
      const errorResult: FetchResult = {
        sourceId: source._id.toString(),
        sourceName: source.name,
        success: false,
        articlesFound: 0,
        articlesProcessed: 0,
        articlesSaved: 0,
        skippedDuplicates: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration
      }

      // Update source fetch status with error
      await this.updateSourceStatus(source._id, false, errorResult)
      
      // Update fetch log
      await this.updateFetchLog(errorResult, maxArticles)
      
      this.results.push(errorResult)
      console.error(`❌ [${this.jobId}] ${source.name} failed:`, error)
    }
  }

  /**
   * Process RSS source using RSS processor and article saver
   */
  private async processRSSSource(source: LeanSource, maxArticles: number): Promise<FetchResult> {
    const startTime = Date.now()
    
    try {
      console.log(`🔍 [${this.jobId}] RSS Processing: ${source.name} with limit ${maxArticles}`)
      
      // Step 1: Fetch and parse RSS feed - pass minimal source object
      const rssResult: RSSFetchResult = await fetchRSSFeed(
        { name: source.name, url: source.url }, // Only pass what the processor needs
        this.jobId, 
        maxArticles
      )
      
      if (!rssResult.success) {
        throw new Error(rssResult.error || 'RSS fetch failed')
      }

      // Step 2: Save articles to database (currently logging only)
      const saveResult = await saveArticlesToDatabase(
        rssResult.articles, 
        source._id.toString(), 
        source.name, 
        this.jobId
      )

      const duration = Date.now() - startTime
      
      return {
        sourceId: source._id.toString(),
        sourceName: source.name,
        success: true,
        articlesFound: rssResult.totalItems,
        articlesProcessed: rssResult.articles.length,
        articlesSaved: saveResult.savedArticles,
        skippedDuplicates: saveResult.skippedDuplicates,
        duration
      }

    } catch (error) {
      // Re-throw to be handled by processSingleSource
      throw error
    }
  }

  /**
   * Update source's fetchStatus in database
   */
  private async updateSourceStatus(sourceId: string, success: boolean, result: FetchResult): Promise<void> {
    try {
      const updateData = {
        'fetchStatus.lastFetchedAt': new Date(),
        'fetchStatus.lastFetchStatus': success ? 'success' : 'error',
        'fetchStatus.lastFetchMessage': success 
          ? `Found ${result.articlesFound} articles, saved ${result.articlesSaved}`
          : result.error,
        'fetchStatus.lastFetchError': success ? null : result.error,
        'fetchStatus.lastFetchSavedArticles': result.articlesSaved
      }

      await Source.findByIdAndUpdate(sourceId, updateData)
    } catch (error) {
      console.error(`⚠️ [${this.jobId}] Failed to update source status:`, error)
    }
  }
}

// Export convenience functions
export async function fetchAllArticles(userMaxArticles?: number): Promise<FetchJobResult> {
  const orchestrator = new ArticleFetchOrchestrator()
  return orchestrator.fetchAllSources(userMaxArticles)
}

export async function fetchArticlesFromSource(sourceId: string, userMaxArticles?: number): Promise<FetchJobResult> {
  const orchestrator = new ArticleFetchOrchestrator()
  return orchestrator.fetchSingleSource(sourceId, userMaxArticles)
}

// Export the class for advanced usage
export { ArticleFetchOrchestrator }