import { FacultyProfile, IFacultyProfile } from '../models/FacultyProfile.js';
import mongoose from 'mongoose';

export class FacultyProfileRepository {
  async findByUserId(userId: string | mongoose.Types.ObjectId): Promise<IFacultyProfile | null> {
    return FacultyProfile.findOne({ userId }).populate('userId', 'email fullName avatarUrl phone isActive');
  }

  async findByEmployeeId(employeeId: string): Promise<IFacultyProfile | null> {
    return FacultyProfile.findOne({ employeeId }).populate('userId', 'email fullName avatarUrl phone isActive');
  }

  async create(data: Partial<IFacultyProfile>): Promise<IFacultyProfile> {
    const profile = new FacultyProfile(data);
    return profile.save();
  }

  async updateByUserId(userId: string | mongoose.Types.ObjectId, updates: Partial<IFacultyProfile>): Promise<IFacultyProfile | null> {
    return FacultyProfile.findOneAndUpdate({ userId }, updates, { new: true });
  }

  async list(filter: Record<string, unknown> = {}, skip = 0, limit = 50): Promise<{ profiles: IFacultyProfile[]; total: number }> {
    const [profiles, total] = await Promise.all([
      FacultyProfile.find(filter).populate('userId', 'email fullName avatarUrl phone isActive').skip(skip).limit(limit),
      FacultyProfile.countDocuments(filter),
    ]);
    return { profiles, total };
  }

  async listAvailableGuides(department?: string): Promise<IFacultyProfile[]> {
    const filter: Record<string, unknown> = {
      isAvailableForGuidance: true,
      $expr: { $lt: ['$currentActiveProjectsCount', '$maxActiveProjectsGuide'] },
    };
    if (department) {
      filter.department = department;
    }
    return FacultyProfile.find(filter).populate('userId', 'email fullName avatarUrl');
  }

  async incrementProjectCount(userId: string | mongoose.Types.ObjectId, delta: number): Promise<void> {
    await FacultyProfile.updateOne({ userId }, { $inc: { currentActiveProjectsCount: delta } });
  }
}

export const facultyProfileRepository = new FacultyProfileRepository();
