import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IArticleFetchLog extends Document {
  jobId: string;
  jobType: 'single' | 'bulk';
  startTime: Date;
  endTime?: Date;
  status: 'running' | 'completed' | 'failed' | 'partial';
  totalSources: number;
  
  // Per-source results
  sourceResults: {
    sourceId: string;
    sourceName: string;
    status: 'success' | 'failed';
    maxArticles?: number;
    totalArticles: number;
    savedArticles: number;
    skippedDuplicates: number;
    errors: string[];
    executionTime: number; // milliseconds
  }[];
  
  // Overall job stats
  summary: {
    totalArticlesProcessed: number;
    totalArticlesSaved: number;
    totalDuplicatesSkipped: number;
    totalErrors: number;
    executionTime: number; // milliseconds
  };
  
  // Error tracking
  jobErrors: string[];
  
  createdAt: Date;
  updatedAt: Date;
}

// Interface for static methods
interface IArticleFetchLogModel extends Model<IArticleFetchLog> {
  getRecentLogs(limit?: number): Promise<IArticleFetchLog[]>;
  getJobStats(days?: number): Promise<any[]>;
}

const ArticleFetchLogSchema: Schema<IArticleFetchLog> = new Schema(
  {
    jobId: {
      type: String,
      required: [true, 'Job ID is required'],
      unique: true,
      index: true,
    },
    jobType: {
      type: String,
      enum: ['single', 'bulk'],
      required: [true, 'Job type is required'],
    },
    startTime: {
      type: Date,
      required: [true, 'Start time is required'],
      index: true,
    },
    endTime: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['running', 'completed', 'failed', 'partial'],
      required: [true, 'Status is required'],
      default: 'running',
      index: true,
    },
    totalSources: {
      type: Number,
      required: [true, 'Total sources count is required'],
      min: 0,
    },
    sourceResults: [{
      sourceId: {
        type: String,
        required: true,
      },
      sourceName: {
        type: String,
        required: true,
      },
      status: {
        type: String,
        enum: ['success', 'failed'],
        required: true,
      },
      maxArticles: {
        type: Number,
        min: 1,
      },
      totalArticles: {
        type: Number,
        required: true,
        min: 0,
      },
      savedArticles: {
        type: Number,
        required: true,
        min: 0,
      },
      skippedDuplicates: {
        type: Number,
        required: true,
        min: 0,
      },
      errors: [{
        type: String,
      }],
      executionTime: {
        type: Number,
        required: true,
        min: 0,
      },
    }],
    summary: {
      totalArticlesProcessed: {
        type: Number,
        required: true,
        min: 0,
      },
      totalArticlesSaved: {
        type: Number,
        required: true,
        min: 0,
      },
      totalDuplicatesSkipped: {
        type: Number,
        required: true,
        min: 0,
      },
      totalErrors: {
        type: Number,
        required: true,
        min: 0,
      },
      executionTime: {
        type: Number,
        required: true,
        min: 0,
      },
    },
    jobErrors: [{
      type: String,
    }],
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Indexes for better query performance
ArticleFetchLogSchema.index({ createdAt: -1 }); // For sorting by date
ArticleFetchLogSchema.index({ status: 1, startTime: -1 }); // For filtering by status and date
ArticleFetchLogSchema.index({ jobType: 1, startTime: -1 }); // For filtering by job type and date

// Instance methods
ArticleFetchLogSchema.methods.calculateDuration = function(): number {
  if (!this.endTime) return 0;
  return this.endTime.getTime() - this.startTime.getTime();
};

ArticleFetchLogSchema.methods.markAsCompleted = function() {
  this.status = 'completed';
  this.endTime = new Date();
  this.summary.executionTime = this.calculateDuration();
};

ArticleFetchLogSchema.methods.markAsFailed = function(error: string) {
  this.status = 'failed';
  this.endTime = new Date();
  this.summary.executionTime = this.calculateDuration();
  this.jobErrors.push(error);
};

// Static methods
ArticleFetchLogSchema.statics.getRecentLogs = function(limit: number = 10) {
  return this.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .exec();
};

ArticleFetchLogSchema.statics.getJobStats = function(days: number = 7) {
  const dateThreshold = new Date();
  dateThreshold.setDate(dateThreshold.getDate() - days);
  
  return this.aggregate([
    { $match: { createdAt: { $gte: dateThreshold } } },
    {
      $group: {
        _id: null,
        totalJobs: { $sum: 1 },
        successfulJobs: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        failedJobs: {
          $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
        },
        totalArticlesSaved: { $sum: '$summary.totalArticlesSaved' },
        totalDuplicatesSkipped: { $sum: '$summary.totalDuplicatesSkipped' },
        avgExecutionTime: { $avg: '$summary.executionTime' }
      }
    }
  ]);
};

const ArticleFetchLog: IArticleFetchLogModel = 
  (mongoose.models.ArticleFetchLog as IArticleFetchLogModel) || 
  mongoose.model<IArticleFetchLog, IArticleFetchLogModel>('ArticleFetchLog', ArticleFetchLogSchema);

export default ArticleFetchLog;