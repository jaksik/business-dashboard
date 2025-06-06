import mongoose, { Schema, Document } from 'mongoose'
import { 
  NEWS_CATEGORIES, 
  TECH_CATEGORIES, 
  NewsCategory, 
  TechCategory,
  createEmptyNewsCategoryDistribution,
  createEmptyTechCategoryDistribution
} from '../lib/constants/categories/index'

// Individual article categorization result
export interface IArticleCategorizationResult {
  articleId: string
  title: string
  newsCategory: NewsCategory
  techCategory: TechCategory
  rationale: string
  confidence: number
  processingTimeMs?: number
  status: 'success' | 'failed'
  errorMessage?: string
}

// OpenAI usage tracking
export interface IOpenAIUsage {
  promptTokens: number
  completionTokens: number
  totalTokens: number
  estimatedCostUSD: number
  modelUsed: string
}

// Category distribution tracking (using the constants)
export type INewsCategoryDistribution = Record<NewsCategory, number>
export type ITechCategoryDistribution = Record<TechCategory, number>

// Main categorization run log interface
export interface IArticleCategorizationLog extends Document {
  _id: mongoose.Types.ObjectId
  
  // Run metadata
  startTime: Date
  endTime?: Date
  status: 'in-progress' | 'completed' | 'completed_with_errors' | 'failed'
  processingTimeMs?: number
  triggeredBy: 'manual' | 'scheduled' | 'api'
  
  // Article processing stats
  totalArticlesAttempted: number
  totalArticlesSuccessful: number
  totalArticlesFailed: number
  articleLimit: number
  batchSize: number
  
  // Category distributions
  newsCategoryDistribution: INewsCategoryDistribution
  techCategoryDistribution: ITechCategoryDistribution
  
  // OpenAI usage and costs
  openaiUsage: IOpenAIUsage
  
  // Individual article results
  articleResults: IArticleCategorizationResult[]
  
  // Error tracking
  processingErrors: string[]
  
  // Configuration used
  openaiModel: string
  
  createdAt: Date
  updatedAt: Date
}

// Mongoose schemas
const ArticleCategorizationResultSchema = new Schema<IArticleCategorizationResult>({
  articleId: { type: String, required: true },
  title: { type: String, required: true },
  newsCategory: { 
    type: String, 
    required: true,
    enum: NEWS_CATEGORIES
  },
  techCategory: { 
    type: String, 
    required: true,
    enum: TECH_CATEGORIES
  },
  rationale: { type: String, required: true },
  confidence: { type: Number, required: true, min: 0, max: 100 },
  processingTimeMs: { type: Number },
  status: { type: String, required: true, enum: ['success', 'failed'] },
  errorMessage: { type: String }
}, { _id: false })

const OpenAIUsageSchema = new Schema<IOpenAIUsage>({
  promptTokens: { type: Number, required: true, default: 0 },
  completionTokens: { type: Number, required: true, default: 0 },
  totalTokens: { type: Number, required: true, default: 0 },
  estimatedCostUSD: { type: Number, required: true, default: 0 },
  modelUsed: { type: String, required: true, default: 'gpt-4o-mini' }
}, { _id: false })

// Dynamic schema creation based on categories
const createCategoryDistributionSchema = (categories: readonly string[]) => {
  const schemaDefinition = Object.fromEntries(
    categories.map(cat => [cat, { type: Number, default: 0 }])
  )
  return new Schema(schemaDefinition, { _id: false })
}

const NewsCategoryDistributionSchema = createCategoryDistributionSchema(NEWS_CATEGORIES)
const TechCategoryDistributionSchema = createCategoryDistributionSchema(TECH_CATEGORIES)

const ArticleCategorizationLogSchema = new Schema<IArticleCategorizationLog>({
  // Run metadata
  startTime: { type: Date, required: true, default: Date.now },
  endTime: { type: Date },
  status: { 
    type: String, 
    required: true, 
    enum: ['in-progress', 'completed', 'completed_with_errors', 'failed'],
    default: 'in-progress'
  },
  processingTimeMs: { type: Number },
  triggeredBy: { 
    type: String, 
    required: true, 
    enum: ['manual', 'scheduled', 'api'],
    default: 'manual'
  },
  
  // Article processing stats
  totalArticlesAttempted: { type: Number, required: true, default: 0 },
  totalArticlesSuccessful: { type: Number, required: true, default: 0 },
  totalArticlesFailed: { type: Number, required: true, default: 0 },
  articleLimit: { type: Number, required: true },
  batchSize: { type: Number, required: true },
  
  // Category distributions
  newsCategoryDistribution: { 
    type: NewsCategoryDistributionSchema, 
    required: true,
    default: createEmptyNewsCategoryDistribution
  },
  techCategoryDistribution: { 
    type: TechCategoryDistributionSchema, 
    required: true,
    default: createEmptyTechCategoryDistribution
  },
  
  // OpenAI usage and costs
  openaiUsage: { 
    type: OpenAIUsageSchema, 
    required: true,
    default: () => ({
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      estimatedCostUSD: 0,
      modelUsed: 'gpt-4o-mini'
    })
  },
  
  // Individual article results
  articleResults: [ArticleCategorizationResultSchema],
  
  // Error tracking
  processingErrors: [{ type: String }],
  
  // Configuration used
  openaiModel: { type: String, required: true, default: 'gpt-4o-mini' }
}, {
  timestamps: true,
  collection: 'articlecategorizationlogs'
})

// Indexes for performance
ArticleCategorizationLogSchema.index({ startTime: -1 })
ArticleCategorizationLogSchema.index({ status: 1 })
ArticleCategorizationLogSchema.index({ triggeredBy: 1 })
ArticleCategorizationLogSchema.index({ 'articleResults.articleId': 1 })

// Static methods for common queries
ArticleCategorizationLogSchema.statics.getRecentRuns = function(limit: number = 10) {
  return this.find()
    .sort({ startTime: -1 })
    .limit(limit)
    .select('startTime endTime status totalArticlesAttempted totalArticlesSuccessful totalArticlesFailed processingTimeMs openaiUsage.estimatedCostUSD')
}

ArticleCategorizationLogSchema.statics.getTotalCosts = function(days: number = 30) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  
  return this.aggregate([
    { $match: { startTime: { $gte: startDate } } },
    { $group: { 
      _id: null, 
      totalCost: { $sum: '$openaiUsage.estimatedCostUSD' },
      totalTokens: { $sum: '$openaiUsage.totalTokens' },
      totalArticles: { $sum: '$totalArticlesSuccessful' }
    }}
  ])
}

const ArticleCategorizationLog = mongoose.models.ArticleCategorizationLog || 
  mongoose.model<IArticleCategorizationLog>('ArticleCategorizationLog', ArticleCategorizationLogSchema)

export default ArticleCategorizationLog