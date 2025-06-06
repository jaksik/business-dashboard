import type { FetchResult, FetchJobResult } from '@/lib/jobs/article-fetch/types'

export function generateJobResult(
  jobId: string,
  startTime: Date,
  results: FetchResult[]
): FetchJobResult {
  const endTime = new Date()
  const duration = endTime.getTime() - startTime.getTime()
  
  const successful = results.filter(r => r.success)
  const failed = results.filter(r => !r.success)
  
  return {
    jobId,
    startTime,
    endTime,
    totalSources: results.length,
    successfulSources: successful.length,
    failedSources: failed.length,
    totalArticlesFound: results.reduce((sum, r) => sum + r.articlesFound, 0),
    totalArticlesSaved: results.reduce((sum, r) => sum + r.articlesSaved, 0),
    duration,
    results
  }
}

export function generateJobSummary(result: FetchJobResult): string {
  const { 
    jobId, 
    duration, 
    totalSources, 
    successfulSources, 
    failedSources,
    totalArticlesFound,
    totalArticlesSaved
  } = result

  const durationSec = (duration / 1000).toFixed(2)
  const successRate = totalSources > 0 ? ((successfulSources / totalSources) * 100).toFixed(1) : '0'
  
  return [
    `📋 Job Summary [${jobId}]`,
    `⏱️  Duration: ${durationSec}s`,
    `📊 Sources: ${successfulSources}/${totalSources} successful (${successRate}%)`,
    `📰 Articles: ${totalArticlesSaved} saved from ${totalArticlesFound} found`,
    ...(failedSources > 0 ? [`❌ Failed sources: ${failedSources}`] : [])
  ].join('\n')
}

export function generateDetailedResults(result: FetchJobResult): string {
  const lines = [
    `\n📋 Detailed Results for Job [${result.jobId}]`,
    `${'='.repeat(50)}`
  ]

  result.results.forEach((sourceResult, index) => {
    const status = sourceResult.success ? '✅' : '❌'
    const duration = (sourceResult.duration / 1000).toFixed(2)
    
    lines.push(`${index + 1}. ${status} ${sourceResult.sourceName}`)
    lines.push(`   Duration: ${duration}s`)
    
    if (sourceResult.success) {
      lines.push(`   Articles: ${sourceResult.articlesSaved} saved / ${sourceResult.articlesFound} found`)
    } else {
      lines.push(`   Error: ${sourceResult.error}`)
    }
    lines.push('')
  })

  return lines.join('\n')
}

/**
 * Log job completion with formatted output
 */
export function logJobCompletion(result: FetchJobResult, jobType: 'bulk' | 'single' = 'bulk'): void {
  const summary = generateJobSummary(result)
  const detailed = generateDetailedResults(result)
  
  console.log(`\n✅ ${jobType === 'bulk' ? 'Bulk' : 'Single'} fetch job completed:`)
  console.log(summary)
  
  if (result.totalSources > 1) {
    console.log(detailed)
  }
}
