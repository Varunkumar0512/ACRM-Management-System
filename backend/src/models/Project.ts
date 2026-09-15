import mongoose, { Document, Schema } from 'mongoose';
import { ProjectStatus } from '../config/constants.js';

export interface IProject extends Document {
  code: string;
  title: string;
  domainId?: mongoose.Types.ObjectId;
  department?: string;
  problemStatement?: string;
  objectives: string[];
  technologies: string[];
  status: ProjectStatus;
  progressPercentage: number;
  ownerId: mongoose.Types.ObjectId;
  fromProjectIdeaId?: mongoose.Types.ObjectId;
  startDate?: Date;
  expectedCompletionDate?: Date;
  actualCompletionDate?: Date;
  repositoryUrl?: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    domainId: {
      type: Schema.Types.ObjectId,
      ref: 'ResearchDomain',
      required: false,
      default: null,
      index: true,
    },
    department: {
      type: String,
      required: false,
      default: '',
      index: true,
    },
    problemStatement: {
      type: String,
      required: false,
      default: '',
    },
    objectives: {
      type: [String],
      default: [],
    },
    technologies: {
      type: [String],
      default: [],
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(ProjectStatus),
      default: ProjectStatus.DRAFT,
      index: true,
    },
    progressPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    fromProjectIdeaId: {
      type: Schema.Types.ObjectId,
      ref: 'ProjectIdea',
      default: null,
    },
    startDate: {
      type: Date,
      default: null,
    },
    expectedCompletionDate: {
      type: Date,
      default: null,
    },
    actualCompletionDate: {
      type: Date,
      default: null,
    },
    repositoryUrl: {
      type: String,
      default: '',
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

projectSchema.index({ title: 'text', problemStatement: 'text', technologies: 'text' });

export const Project = mongoose.model<IProject>('Project', projectSchema);
