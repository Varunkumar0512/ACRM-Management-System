import mongoose, { Document, Schema } from 'mongoose';
import { MilestoneStatus } from '../config/constants.js';

export interface IMilestone extends Document {
  projectId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  orderIndex: number;
  dueDate: Date;
  completionDate?: Date;
  status: MilestoneStatus;
  assignedMemberIds: mongoose.Types.ObjectId[];
  weight: number;
  createdAt: Date;
  updatedAt: Date;
}

const milestoneSchema = new Schema<IMilestone>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    orderIndex: {
      type: Number,
      default: 0,
      index: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    completionDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: Object.values(MilestoneStatus),
      default: MilestoneStatus.NOT_STARTED,
      index: true,
    },
    assignedMemberIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    weight: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  { timestamps: true }
);

export const Milestone = mongoose.model<IMilestone>('Milestone', milestoneSchema);
