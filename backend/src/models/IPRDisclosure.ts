import mongoose, { Document, Schema } from 'mongoose';
import { IprCategory, IprStatus, IprConfidentiality } from '../config/constants.js';

export interface IIprInventor {
  userId?: mongoose.Types.ObjectId;
  name: string;
  email: string;
  department?: string;
  sharePercentage?: number;
}

export interface IIprStatusHistory {
  fromStatus?: IprStatus;
  toStatus: IprStatus;
  changedBy: mongoose.Types.ObjectId;
  timestamp: Date;
  notes?: string;
}

export interface IIPRDisclosure extends Document {
  iprNumber: string;
  title: string;
  category: IprCategory;
  projectId: mongoose.Types.ObjectId;
  screeningId: mongoose.Types.ObjectId;
  status: IprStatus;
  confidentiality: IprConfidentiality;
  summary: string;
  commercialPotential?: string;
  stageOfDevelopment?: string;
  primaryInventorId: mongoose.Types.ObjectId;
  coInventors: IIprInventor[];
  assignedReviewerId?: mongoose.Types.ObjectId;
  filingDetails?: {
    applicationNumber?: string;
    filingDate?: Date;
    authority?: string;
    status?: string;
    notes?: string;
  };
  acknowledgementAccepted: boolean;
  acknowledgedAt?: Date;
  history: IIprStatusHistory[];
  createdAt: Date;
  updatedAt: Date;
}

const iprDisclosureSchema = new Schema<IIPRDisclosure>(
  {
    iprNumber: {
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
    },
    category: {
      type: String,
      enum: Object.values(IprCategory),
      default: IprCategory.PATENT,
      index: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    screeningId: {
      type: Schema.Types.ObjectId,
      ref: 'NoveltyScreening',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(IprStatus),
      default: IprStatus.SUBMITTED,
      index: true,
    },
    confidentiality: {
      type: String,
      enum: Object.values(IprConfidentiality),
      default: IprConfidentiality.INSTITUTION_ONLY,
      index: true,
    },
    summary: {
      type: String,
      required: true,
      trim: true,
    },
    commercialPotential: {
      type: String,
      default: '',
    },
    stageOfDevelopment: {
      type: String,
      default: 'LAB_PROTOTYPE',
    },
    primaryInventorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    coInventors: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        name: { type: String, required: true },
        email: { type: String, required: true },
        department: { type: String, default: '' },
        sharePercentage: { type: Number, default: 0 },
      },
    ],
    assignedReviewerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    filingDetails: {
      applicationNumber: String,
      filingDate: Date,
      authority: String,
      status: String,
      notes: String,
    },
    acknowledgementAccepted: {
      type: Boolean,
      required: true,
      default: false,
    },
    acknowledgedAt: {
      type: Date,
    },
    history: [
      {
        fromStatus: { type: String, enum: Object.values(IprStatus) },
        toStatus: { type: String, enum: Object.values(IprStatus), required: true },
        changedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        timestamp: { type: Date, default: Date.now },
        notes: String,
      },
    ],
  },
  { timestamps: true }
);

iprDisclosureSchema.index({ primaryInventorId: 1, createdAt: -1 });
iprDisclosureSchema.index({ category: 1, status: 1 });

export const IPRDisclosure = mongoose.model<IIPRDisclosure>('IPRDisclosure', iprDisclosureSchema);
