import mongoose, { Document, Schema } from 'mongoose';

export type ProjectDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export interface IProjectIdea extends Document {
  title: string;
  slug: string;
  domainId: mongoose.Types.ObjectId;
  difficulty: ProjectDifficulty;
  problemStatement: string;
  objectives: string[];
  technologies: string[];
  expectedOutcome: string;
  prerequisites: string[];
  relatedPaperIds: mongoose.Types.ObjectId[];
  tags: string[];
  isCurated: boolean;
  addedBy?: mongoose.Types.ObjectId;
  savedCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const projectIdeaSchema = new Schema<IProjectIdea>(
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
    difficulty: {
      type: String,
      enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'],
      required: true,
      index: true,
    },
    problemStatement: {
      type: String,
      required: true,
    },
    objectives: {
      type: [String],
      required: true,
    },
    technologies: {
      type: [String],
      required: true,
      index: true,
    },
    expectedOutcome: {
      type: String,
      required: true,
    },
    prerequisites: {
      type: [String],
      default: [],
    },
    relatedPaperIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'ResearchPaper',
      },
    ],
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    isCurated: {
      type: Boolean,
      default: true,
    },
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
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

projectIdeaSchema.index({ title: 'text', problemStatement: 'text', technologies: 'text' });

export const ProjectIdea = mongoose.model<IProjectIdea>('ProjectIdea', projectIdeaSchema);
