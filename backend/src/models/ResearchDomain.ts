import mongoose, { Document, Schema } from 'mongoose';

export interface IResearchDomain extends Document {
  name: string;
  slug: string;
  description: string;
  icon?: string;
  isActive: boolean;
  orderIndex: number;
  createdAt: Date;
  updatedAt: Date;
}

const researchDomainSchema = new Schema<IResearchDomain>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
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
    description: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      default: 'BookOpen',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    orderIndex: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const ResearchDomain = mongoose.model<IResearchDomain>('ResearchDomain', researchDomainSchema);
