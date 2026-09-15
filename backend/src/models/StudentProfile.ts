import mongoose, { Document, Schema } from 'mongoose';

export interface IStudentProfile extends Document {
  userId: mongoose.Types.ObjectId;
  studentId: string;
  department: string;
  program: string;
  yearOfStudy: number;
  cgpa?: number;
  researchInterests: string[];
  bio?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const studentProfileSchema = new Schema<IStudentProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    studentId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    department: {
      type: String,
      required: true,
      index: true,
    },
    program: {
      type: String,
      required: true,
      default: 'Bachelor of Technology',
    },
    yearOfStudy: {
      type: Number,
      required: true,
      min: 1,
      max: 6,
    },
    cgpa: {
      type: Number,
      min: 0,
      max: 10,
    },
    researchInterests: {
      type: [String],
      default: [],
      index: true,
    },
    bio: {
      type: String,
      default: '',
    },
    githubUrl: {
      type: String,
      default: '',
    },
    linkedinUrl: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export const StudentProfile = mongoose.model<IStudentProfile>('StudentProfile', studentProfileSchema);
