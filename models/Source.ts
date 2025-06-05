import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISource extends Document {
  name: string;
  url: string;
  type: 'rss' | 'html';
  isActive: boolean;
  fetchStatus: {
    lastFetchedAt?: Date;
    lastFetchStatus?: 'success' | 'error';
    lastFetchMessage?: string;
    lastFetchError?: string;
    lastFetchSavedArticles?: number; // How many articles were found in last successful fetch
  };
}

const SourceSchema: Schema<ISource> = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Source name is required.'],
      trim: true,
      unique: true,
      index: true,
    },
    url: {
      type: String,
      required: [true, 'Source URL is required.'],
      unique: true,
      trim: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['rss', 'html'],
      required: [true, 'Source type is required.'],
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    fetchStatus: {
      lastFetchedAt: {
        type: Date,
        index: true,
      },
      lastFetchStatus: {
        type: String,
        enum: ['success', 'error'],
        index: true,
      },
      lastFetchMessage: {
        type: String,
        trim: true,
      },
      lastFetchError: {
        type: String,
        trim: true,
      },
      lastFetchSavedArticles: {
        type: Number,
        min: 0,
      },
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt timestamps automatically
  }
);

// To prevent model overwrite errors during hot-reloading in development with Next.js
// Check if the model already exists before defining it
const Source: Model<ISource> = mongoose.models.Source || mongoose.model<ISource>('Source', SourceSchema);

export default Source;