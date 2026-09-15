import mongoose, { Document, Schema } from 'mongoose';

export interface IIPRApplication extends Document {
  iprId: mongoose.Types.ObjectId;
  applicationNumber: string;
  filingDate: Date;
  authority: string;
  applicationType: string;
  status: string;
  publicationNumber?: string;
  publicationDate?: Date;
  grantNumber?: string;
  grantDate?: Date;
  attorneyOrAgent?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const iprApplicationSchema = new Schema<IIPRApplication>(
  {
    iprId: {
      type: Schema.Types.ObjectId,
      ref: 'IPRDisclosure',
      required: true,
      index: true,
    },
    applicationNumber: {
      type: String,
      required: true,
      trim: true,
    },
    filingDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    authority: {
      type: String,
      required: true,
      default: 'Indian Patent Office (IPO)',
    },
    applicationType: {
      type: String,
      required: true,
      default: 'PROVISIONAL',
    },
    status: {
      type: String,
      default: 'FILED',
    },
    publicationNumber: {
      type: String,
      default: '',
    },
    publicationDate: {
      type: Date,
      default: null,
    },
    grantNumber: {
      type: String,
      default: '',
    },
    grantDate: {
      type: Date,
      default: null,
    },
    attorneyOrAgent: {
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

export const IPRApplication = mongoose.model<IIPRApplication>('IPRApplication', iprApplicationSchema);
