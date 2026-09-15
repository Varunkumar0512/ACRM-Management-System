import mongoose, { Document, Schema } from 'mongoose';
import { GuideRole, GuideRequestStatus } from '../config/constants.js';

export interface IProjectGuide extends Document {
  projectId: mongoose.Types.ObjectId;
  facultyId: mongoose.Types.ObjectId;
  role: GuideRole;
  status: GuideRequestStatus;
  requestedAt: Date;
  respondedAt?: Date;
  rejectionReason?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const projectGuideSchema = new Schema<IProjectGuide>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    facultyId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: Object.values(GuideRole),
      default: GuideRole.PRIMARY_GUIDE,
    },
    status: {
      type: String,
      enum: Object.values(GuideRequestStatus),
      default: GuideRequestStatus.REQUESTED,
      index: true,
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    respondedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

projectGuideSchema.index({ projectId: 1, facultyId: 1 }, { unique: true });

export const ProjectGuide = mongoose.model<IProjectGuide>('ProjectGuide', projectGuideSchema);
