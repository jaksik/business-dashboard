import mongoose, { Schema, Document } from 'mongoose'

export interface ICategoryCorrectionLog extends Document {
  title: string
  source: string
  description?: string
  aiCategories: {
    news?: string
    tech?: string
    aiRationale?: string
  }
  humanCategories: {
    news?: string
    tech?: string
    humanRationale?: string
  }
  correctedAt: Date
}

const CategoryCorrectionLogSchema: Schema<ICategoryCorrectionLog> = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    source: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    aiCategories: {
      news: {
        type: String,
        trim: true,
      },
      tech: {
        type: String,
        trim: true,
      },
      aiRationale: {
        type: String,
        trim: true,
      },
    },
    humanCategories: {
      news: {
        type: String,
        trim: true,
      },
      tech: {
        type: String,
        trim: true,
      },
      humanRationale: {
        type: String,
        trim: true,
      },
    },
    correctedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

// Indexes for efficient querying
CategoryCorrectionLogSchema.index({ correctedAt: -1 })
CategoryCorrectionLogSchema.index({ source: 1 })
CategoryCorrectionLogSchema.index({ 'aiCategories.news': 1 })
CategoryCorrectionLogSchema.index({ 'aiCategories.tech': 1 })

const CategoryCorrectionLog: mongoose.Model<ICategoryCorrectionLog> = 
  mongoose.models.CategoryCorrectionLog || 
  mongoose.model<ICategoryCorrectionLog>('CategoryCorrectionLog', CategoryCorrectionLogSchema)

export default CategoryCorrectionLog
