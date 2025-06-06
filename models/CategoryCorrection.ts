import mongoose, { Schema, Document } from 'mongoose'

export interface ICategoryCorrection extends Document {
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

const CategoryCorrectionSchema: Schema<ICategoryCorrection> = new Schema(
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
CategoryCorrectionSchema.index({ correctedAt: -1 })
CategoryCorrectionSchema.index({ source: 1 })
CategoryCorrectionSchema.index({ 'aiCategories.news': 1 })
CategoryCorrectionSchema.index({ 'aiCategories.tech': 1 })

const CategoryCorrection: mongoose.Model<ICategoryCorrection> = 
  mongoose.models.CategoryCorrection || 
  mongoose.model<ICategoryCorrection>('CategoryCorrection', CategoryCorrectionSchema)

export default CategoryCorrection
