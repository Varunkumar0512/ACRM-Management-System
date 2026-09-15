import mongoose, { Document, Schema } from 'mongoose';
import { ProjectMemberStatus } from '../config/constants.js';

export interface IProjectMember extends Document {
  projectId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  role: 'OWNER' | 'MEMBER';
  status: ProjectMemberStatus;
  joinedAt?: Date;
  invitedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const projectMemberSchema = new Schema<IProjectMember>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['OWNER', 'MEMBER'],
      default: 'MEMBER',
    },
    status: {
      type: String,
      enum: Object.values(ProjectMemberStatus),
      default: ProjectMemberStatus.PENDING,
      index: true,
    },
    joinedAt: {
      type: Date,
      default: null,
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

projectMemberSchema.index({ projectId: 1, studentId: 1 }, { unique: true });

export const ProjectMember = mongoose.model<IProjectMember>('ProjectMember', projectMemberSchema);
