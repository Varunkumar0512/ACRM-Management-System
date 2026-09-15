import mongoose, { Document, Schema } from 'mongoose';
import { CommentStatus } from '../config/constants.js';

export interface IComment extends Document {
  projectId: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId;
  content: string;
  referencedMilestoneId?: mongoose.Types.ObjectId;
  referencedDocumentId?: mongoose.Types.ObjectId;
  parentCommentId?: mongoose.Types.ObjectId;
  status: CommentStatus;
  resolvedBy?: mongoose.Types.ObjectId;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    referencedMilestoneId: {
      type: Schema.Types.ObjectId,
      ref: 'Milestone',
      default: null,
    },
    referencedDocumentId: {
      type: Schema.Types.ObjectId,
      ref: 'Document',
      default: null,
    },
    parentCommentId: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(CommentStatus),
      default: CommentStatus.OPEN,
      index: true,
    },
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export const Comment = mongoose.model<IComment>('Comment', commentSchema);
