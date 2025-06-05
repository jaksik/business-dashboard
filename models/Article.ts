import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IArticle extends Document {
  title: string;
  link: string; 
  sourceName: string; 
  publishedDate?: Date; 
  metaDescription?: string; 
  guid?: string; // Optional: from RSS, can also be used for uniqueness if reliable
  fetchedAt: Date; // When your aggregator fetched this article
  categorization: {
    status: 'pending' | 'processing' | 'completed' | 'failed';
    categories: {
      news?: string;
      tech?: string;
    };
    rationale?: string;
    categorizedAt?: Date;
  };
}

const ArticleSchema: Schema<IArticle> = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Article title is required.'],
      trim: true,
    },
    link: {
      type: String,
      required: [true, 'Article link is required.'],
      unique: true, // Enforces uniqueness at the database level for the 'link' field
      trim: true,
      index: true, 
    },
    sourceName: {
      type: String,
      required: [true, 'Source name is required.'],
      trim: true,
      index: true, 
    },
    publishedDate: {
      type: Date,
      index: true, 
    },
    metaDescription: {
      type: String,
      trim: true,
    },
    guid: { // Globally Unique Identifier from RSS feeds
      type: String,
      trim: true,
      index: true, // Index for fast duplicate checking
      sparse: true, // Allows multiple documents to have a null/missing guid, but if a guid exists, it must be unique
    },
    fetchedAt: {
      type: Date,
      default: Date.now, // Automatically set to current time when document is created
      required: true,
    },
    categorization: {
      status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending',
        index: true,
      },
      categories: {
        news: {
          type: String,
          index: true,
        },
        tech: {
          type: String,
          index: true,
        },
      },
      rationale: {
        type: String,
        trim: true,
      },
      categorizedAt: {
        type: Date,
        index: true,
      },
    }
  },
  {
    timestamps: true, // Adds createdAt and updatedAt timestamps automatically
  }
);

// To prevent model overwrite errors during hot-reloading in development with Next.js
// Check if the model already exists before defining it
const Article: Model<IArticle> = mongoose.models.Article || mongoose.model<IArticle>('Article', ArticleSchema);

export default Article;