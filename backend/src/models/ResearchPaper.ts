import mongoose, { Document, Schema } from 'mongoose';

export interface IResearchPaper extends Document {
  title: string;
  authors: string[];
  abstract: string;
  domainId: mongoose.Types.ObjectId;
  department: string;
  venue: string;
  publicationDate: Date;
  doi?: string;
  externalUrl?: string;
  keywords: string[];
  tags: string[];
  citationsCount: number;
  savedCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const researchPaperSchema = new Schema<IResearchPaper>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    authors: {
      type: [String],
      required: true,
      index: true,
    },
    abstract: {
      type: String,
      required: true,
    },
    domainId: {
      type: Schema.Types.ObjectId,
      ref: 'ResearchDomain',
      required: true,
      index: true,
    },
    department: {
      type: String,
      required: true,
      index: true,
    },
    venue: {
      type: String,
      required: true,
    },
    publicationDate: {
      type: Date,
      required: true,
      index: true,
    },
    doi: {
      type: String,
      default: '',
    },
    externalUrl: {
      type: String,
      default: '',
    },
    keywords: {
      type: [String],
      default: [],
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    citationsCount: {
      type: Number,
      default: 0,
    },
    savedCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

researchPaperSchema.index({ title: 'text', abstract: 'text', keywords: 'text', authors: 'text' });

export const ResearchPaper = mongoose.model<IResearchPaper>('ResearchPaper', researchPaperSchema);
