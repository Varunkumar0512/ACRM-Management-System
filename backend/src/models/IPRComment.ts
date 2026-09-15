import mongoose, { Document, Schema } from 'mongoose';

export interface IIPRComment extends Document {
  iprId: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId;
  message: string;
  relatedSection: string;
  status: 'OPEN' | 'RESOLVED';
  parentCommentId?: mongoose.Types.ObjectId;
  resolvedBy?: mongoose.Types.ObjectId;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const iprCommentSchema = new Schema<IIPRComment>(
  {
    iprId: {
      type: Schema.Types.ObjectId,
      ref: 'IPRDisclosure',
      required: true,
      index: true,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    relatedSection: {
      type: String,
      default: 'general',
    },
    status: {
      type: String,
      enum: ['OPEN', 'RESOLVED'],
      default: 'OPEN',
      index: true,
    },
    parentCommentId: {
      type: Schema.Types.ObjectId,
      ref: 'IPRComment',
      default: null,
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

export const IPRComment = mongoose.model<IIPRComment>('IPRComment', iprCommentSchema);
