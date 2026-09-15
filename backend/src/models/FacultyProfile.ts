import mongoose, { Document, Schema } from 'mongoose';
import { FacultyDesignation } from '../config/constants.js';

export interface IFacultyProfile extends Document {
  userId: mongoose.Types.ObjectId;
  employeeId: string;
  designation: FacultyDesignation;
  department: string;
  areasOfExpertise: string[];
  experienceYears: number;
  currentResearchSummary?: string;
  maxActiveProjectsGuide: number;
  currentActiveProjectsCount: number;
  isAvailableForGuidance: boolean;
  cabinLocation?: string;
  googleScholarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const facultyProfileSchema = new Schema<IFacultyProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    designation: {
      type: String,
      enum: Object.values(FacultyDesignation),
      required: true,
      index: true,
    },
    department: {
      type: String,
      required: true,
      index: true,
    },
    areasOfExpertise: {
      type: [String],
      default: [],
      index: true,
    },
    experienceYears: {
      type: Number,
      required: true,
      min: 0,
    },
    currentResearchSummary: {
      type: String,
      default: '',
    },
    maxActiveProjectsGuide: {
      type: Number,
      default: 5,
    },
    currentActiveProjectsCount: {
      type: Number,
      default: 0,
    },
    isAvailableForGuidance: {
      type: Boolean,
      default: true,
      index: true,
    },
    cabinLocation: {
      type: String,
      default: '',
    },
    googleScholarUrl: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export const FacultyProfile = mongoose.model<IFacultyProfile>('FacultyProfile', facultyProfileSchema);
