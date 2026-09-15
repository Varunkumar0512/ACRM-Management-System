import mongoose, { Document as MongooseDoc, Schema } from 'mongoose';
import { DocumentType, DocumentStatus } from '../config/constants.js';

export interface IDocument extends MongooseDoc {
  projectId: mongoose.Types.ObjectId;
  milestoneId?: mongoose.Types.ObjectId;
  filename: string;
  originalName: string;
  type: DocumentType;
  fileSize: number;
  mimeType: string;
  storagePath: string;
  version: number;
  uploadedBy: mongoose.Types.ObjectId;
  status: DocumentStatus;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const documentSchema = new Schema<IDocument>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    milestoneId: {
      type: Schema.Types.ObjectId,
      ref: 'Milestone',
      default: null,
    },
    filename: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(DocumentType),
      required: true,
      index: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    storagePath: {
      type: String,
      required: true,
    },
    version: {
      type: Number,
      default: 1,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(DocumentStatus),
      default: DocumentStatus.SUBMITTED,
    },
    description: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export const DocumentModel = mongoose.model<IDocument>('Document', documentSchema);
