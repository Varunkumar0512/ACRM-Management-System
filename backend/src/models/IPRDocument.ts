import mongoose, { Document, Schema } from 'mongoose';
import { IprDocumentType } from '../config/constants.js';

export interface IIPRDocument extends Document {
  iprId: mongoose.Types.ObjectId;
  originalName: string;
  filename: string;
  fileSize: number;
  mimeType: string;
  storagePath: string;
  type: IprDocumentType;
  version: number;
  uploadedBy: mongoose.Types.ObjectId;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const iprDocumentSchema = new Schema<IIPRDocument>(
  {
    iprId: {
      type: Schema.Types.ObjectId,
      ref: 'IPRDisclosure',
      required: true,
      index: true,
    },
    originalName: {
      type: String,
      required: true,
      trim: true,
    },
    filename: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    mimeType: {
      type: String,
      default: 'application/pdf',
    },
    storagePath: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      enum: Object.values(IprDocumentType),
      default: IprDocumentType.TECHNICAL_SPEC,
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
    description: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export const IPRDocument = mongoose.model<IIPRDocument>('IPRDocument', iprDocumentSchema);
