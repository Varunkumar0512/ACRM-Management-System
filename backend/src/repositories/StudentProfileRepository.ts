import { StudentProfile, IStudentProfile } from '../models/StudentProfile.js';
import mongoose from 'mongoose';

export class StudentProfileRepository {
  async findByUserId(userId: string | mongoose.Types.ObjectId): Promise<IStudentProfile | null> {
    return StudentProfile.findOne({ userId }).populate('userId', 'email fullName avatarUrl phone isActive');
  }

  async findByStudentId(studentId: string): Promise<IStudentProfile | null> {
    return StudentProfile.findOne({ studentId }).populate('userId', 'email fullName avatarUrl phone isActive');
  }

  async create(data: Partial<IStudentProfile>): Promise<IStudentProfile> {
    const profile = new StudentProfile(data);
    return profile.save();
  }

  async updateByUserId(userId: string | mongoose.Types.ObjectId, updates: Partial<IStudentProfile>): Promise<IStudentProfile | null> {
    return StudentProfile.findOneAndUpdate({ userId }, updates, { new: true });
  }

  async list(filter: Record<string, unknown> = {}, skip = 0, limit = 50): Promise<{ profiles: IStudentProfile[]; total: number }> {
    const [profiles, total] = await Promise.all([
      StudentProfile.find(filter).populate('userId', 'email fullName avatarUrl phone isActive').skip(skip).limit(limit),
      StudentProfile.countDocuments(filter),
    ]);
    return { profiles, total };
  }
}

export const studentProfileRepository = new StudentProfileRepository();
