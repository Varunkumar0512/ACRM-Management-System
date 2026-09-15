import mongoose, { Document, Schema } from 'mongoose';
import { ReviewDecision } from '../config/constants.js';

export interface IRubricScore {
  criterion: string;
  score: number;
  maxScore: number;
  comments?: string;
}

export interface IReview extends Document {
  projectId: mongoose.Types.ObjectId;
  reviewerId: mongoose.Types.ObjectId;
  milestoneId?: mongoose.Types.ObjectId;
  rubricScores: IRubricScore[];
  totalScore: number;
  maxPossibleScore: number;
  percentage: number;
  comments: string;
  recommendations: string;
  decision: ReviewDecision;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    reviewerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    milestoneId: {
      type: Schema.Types.ObjectId,
      ref: 'Milestone',
      default: null,
    },
    rubricScores: [
      {
        criterion: { type: String, required: true },
        score: { type: Number, required: true },
        maxScore: { type: Number, required: true },
        comments: { type: String, default: '' },
      },
    ],
    totalScore: {
      type: Number,
      required: true,
    },
    maxPossibleScore: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
    },
    comments: {
      type: String,
      required: true,
    },
    recommendations: {
      type: String,
      default: '',
    },
    decision: {
      type: String,
      enum: Object.values(ReviewDecision),
      required: true,
      index: true,
    },
    version: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

export const Review = mongoose.model<IReview>('Review', reviewSchema);
