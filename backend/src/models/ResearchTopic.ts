import mongoose, { Document, Schema } from 'mongoose';

export interface IResearchTopic extends Document {
  title: string;
  slug: string;
  domainId: mongoose.Types.ObjectId;
  description: string;
  subtopics: string[];
  trendingScore: number;
  keywords: string[];
  addedBy?: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const researchTopicSchema = new Schema<IResearchTopic>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    domainId: {
      type: Schema.Types.ObjectId,
      ref: 'ResearchDomain',
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    subtopics: {
      type: [String],
      default: [],
    },
    trendingScore: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },
    keywords: {
      type: [String],
      default: [],
      index: true,
    },
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

researchTopicSchema.index({ title: 'text', description: 'text', keywords: 'text' });

export const ResearchTopic = mongoose.model<IResearchTopic>('ResearchTopic', researchTopicSchema);
