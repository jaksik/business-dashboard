import { NextResponse } from 'next/server'
import connectToDatabase from '../../../../lib/db'
import CategoryCorrection, { ICategoryCorrection } from '../../../../models/CategoryCorrection'

export async function GET() {
  try {
    await connectToDatabase()

    // Get all corrections
    const corrections = await CategoryCorrection.find({})
      .sort({ correctedAt: -1 })
      .lean()

    // Analyze patterns
    const patterns: Record<string, { count: number; examples: Array<{ title: string; source: string; aiRationale?: string }> }> = {}
    const sourcePatterns: Record<string, { 
      totalCorrections: number; 
      newsCorrections: number; 
      techCorrections: number; 
      examples: Array<{ 
        title: string; 
        aiNews?: string; 
        humanNews?: string; 
        aiTech?: string; 
        humanTech?: string; 
        aiRationale?: string 
      }> 
    }> = {}

    corrections.forEach((correction: ICategoryCorrection) => {
      // Track news category corrections
      if (correction.aiCategories.news !== correction.humanCategories.news) {
        const key = `News: ${correction.aiCategories.news} → ${correction.humanCategories.news}`
        if (!patterns[key]) {
          patterns[key] = { count: 0, examples: [] }
        }
        patterns[key].count++
        patterns[key].examples.push({
          title: correction.title,
          source: correction.source,
          aiRationale: correction.aiCategories.aiRationale
        })
      }

      // Track tech category corrections
      if (correction.aiCategories.tech !== correction.humanCategories.tech) {
        const key = `Tech: ${correction.aiCategories.tech} → ${correction.humanCategories.tech}`
        if (!patterns[key]) {
          patterns[key] = { count: 0, examples: [] }
        }
        patterns[key].count++
        patterns[key].examples.push({
          title: correction.title,
          source: correction.source,
          aiRationale: correction.aiCategories.aiRationale
        })
      }

      // Track source patterns
      if (!sourcePatterns[correction.source]) {
        sourcePatterns[correction.source] = { 
          totalCorrections: 0, 
          newsCorrections: 0,
          techCorrections: 0,
          examples: [] 
        }
      }
      sourcePatterns[correction.source].totalCorrections++
      
      if (correction.aiCategories.news !== correction.humanCategories.news) {
        sourcePatterns[correction.source].newsCorrections++
      }
      if (correction.aiCategories.tech !== correction.humanCategories.tech) {
        sourcePatterns[correction.source].techCorrections++
      }
      
      sourcePatterns[correction.source].examples.push({
        title: correction.title,
        aiNews: correction.aiCategories.news,
        humanNews: correction.humanCategories.news,
        aiTech: correction.aiCategories.tech,
        humanTech: correction.humanCategories.tech,
        aiRationale: correction.aiCategories.aiRationale
      })
    })

    // Sort patterns by frequency
    const sortedPatterns = Object.entries(patterns)
      .sort(([,a], [,b]) => b.count - a.count)
      .slice(0, 15) // Top 15 patterns

    return NextResponse.json({
      totalCorrections: corrections.length,
      lastCorrectionDate: corrections[0]?.correctedAt || null,
      recentCorrections: corrections.slice(0, 10), // Last 10 corrections
      topPatterns: sortedPatterns,
      sourceBreakdown: sourcePatterns,
      exportData: {
        allCorrections: corrections,
        summary: {
          totalCorrections: corrections.length,
          uniqueSources: Object.keys(sourcePatterns).length,
          mostCorrectedSource: Object.entries(sourcePatterns)
            .sort(([,a], [,b]) => b.totalCorrections - a.totalCorrections)[0]?.[0],
          dateRange: {
            earliest: corrections[corrections.length - 1]?.correctedAt,
            latest: corrections[0]?.correctedAt
          }
        }
      }
    })

  } catch (error) {
    console.error('Error analyzing corrections:', error)
    return NextResponse.json(
      { error: 'Failed to analyze corrections' },
      { status: 500 }
    )
  }
}
