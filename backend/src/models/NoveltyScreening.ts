import mongoose, { Document, Schema } from 'mongoose';
import { NoveltyAssessment, NoveltyConfidence } from '../config/constants.js';

export interface INoveltySourceItem {
  title: string;
  type: string;
  citationOrDoi?: string;
}

export interface INoveltyChatMessage {
  role: 'assistant' | 'user';
  content: string;
  timestamp: Date;
}

export interface INoveltyScreening extends Document {
  screeningNumber: string;
  projectId: mongoose.Types.ObjectId;
  submittedBy: mongoose.Types.ObjectId;
  innovationTitle: string;
  problem: string;
  proposedSolution: string;
  keyTechnicalFeatures: string[];
  differentiation: string;
  technologiesUsed: string[];
  targetApplication: string;
  relatedResearch?: string;
  assessment: NoveltyAssessment;
  confidence: NoveltyConfidence;
  distinguishingFeatures: string[];
  potentialOverlap: string;
  recommendedNextSteps: string[];
  sourcesConsulted: {
    papersCount: number;
    patentRecordsCount: number;
    institutionalCount: number;
    externalConnected: boolean;
    message: string;
    sampleSources: INoveltySourceItem[];
  };
  chatHistory: INoveltyChatMessage[];
  questions: string[];
  studentAcknowledged: boolean;
  acknowledgedAt?: Date;
  status: 'DRAFT' | 'COMPLETED' | 'FAILED';
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

const noveltyScreeningSchema = new Schema<INoveltyScreening>(
  {
    screeningNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    submittedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    innovationTitle: {
      type: String,
      required: true,
      trim: true,
    },
    problem: {
      type: String,
      required: true,
      trim: true,
    },
    proposedSolution: {
      type: String,
      required: true,
      trim: true,
    },
    keyTechnicalFeatures: {
      type: [String],
      default: [],
    },
    differentiation: {
      type: String,
      required: true,
      trim: true,
    },
    technologiesUsed: {
      type: [String],
      default: [],
    },
    targetApplication: {
      type: String,
      required: true,
      trim: true,
    },
    relatedResearch: {
      type: String,
      default: '',
    },
    assessment: {
      type: String,
      enum: Object.values(NoveltyAssessment),
      default: NoveltyAssessment.INSUFFICIENT_INFORMATION,
      index: true,
    },
    confidence: {
      type: String,
      enum: Object.values(NoveltyConfidence),
      default: NoveltyConfidence.PRELIMINARY,
    },
    distinguishingFeatures: {
      type: [String],
      default: [],
    },
    potentialOverlap: {
      type: String,
      default: '',
    },
    recommendedNextSteps: {
      type: [String],
      default: [],
    },
    sourcesConsulted: {
      papersCount: { type: Number, default: 0 },
      patentRecordsCount: { type: Number, default: 0 },
      institutionalCount: { type: Number, default: 0 },
      externalConnected: { type: Boolean, default: false },
      message: { type: String, default: '' },
      sampleSources: [
        {
          title: String,
          type: { type: String },
          citationOrDoi: String,
        },
      ],
    },
    chatHistory: [
      {
        role: { type: String, enum: ['assistant', 'user'], required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    questions: {
      type: [String],
      default: [],
    },
    studentAcknowledged: {
      type: Boolean,
      default: false,
    },
    acknowledgedAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['DRAFT', 'COMPLETED', 'FAILED'],
      default: 'COMPLETED',
      index: true,
    },
    version: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

noveltyScreeningSchema.index({ projectId: 1, createdAt: -1 });

export const NoveltyScreening = mongoose.model<INoveltyScreening>('NoveltyScreening', noveltyScreeningSchema);
