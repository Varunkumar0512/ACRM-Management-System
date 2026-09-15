import { User, IUser } from '../models/User.js';
import { UserRole } from '../config/constants.js';

export class UserRepository {
  async findById(id: string): Promise<IUser | null> {
    return User.findById(id);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email: email.toLowerCase().trim() });
  }

  async findByPasswordResetToken(token: string): Promise<IUser | null> {
    return User.findOne({
      passwordResetToken: token,
      passwordResetExpiresAt: { $gt: new Date() },
    });
  }

  async findByVerificationToken(token: string): Promise<IUser | null> {
    return User.findOne({
      verificationToken: token,
      verificationTokenExpiresAt: { $gt: new Date() },
    });
  }

  async create(data: Partial<IUser>): Promise<IUser> {
    const user = new User(data);
    return user.save();
  }

  async update(id: string, updates: Partial<IUser>): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, updates, { new: true });
  }

  async list(filter: Record<string, unknown> = {}, skip = 0, limit = 50): Promise<{ users: IUser[]; total: number }> {
    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);
    return { users, total };
  }

  async countByRole(role: UserRole): Promise<number> {
    return User.countDocuments({ role, isActive: true });
  }
}

export const userRepository = new UserRepository();
