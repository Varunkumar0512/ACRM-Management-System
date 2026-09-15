import { NoveltyScreening, INoveltyScreening } from '../models/NoveltyScreening.js';
import mongoose from 'mongoose';

export class NoveltyRepository {
  async findById(id: string | mongoose.Types.ObjectId): Promise<INoveltyScreening | null> {
    return NoveltyScreening.findById(id)
      .populate('projectId', 'title code department status')
      .populate('submittedBy', 'fullName email role');
  }

  async findByProject(projectId: string | mongoose.Types.ObjectId): Promise<INoveltyScreening[]> {
    return NoveltyScreening.find({ projectId })
      .sort({ createdAt: -1 })
      .populate('submittedBy', 'fullName email role');
  }

  async findLatestByProject(projectId: string | mongoose.Types.ObjectId): Promise<INoveltyScreening | null> {
    return NoveltyScreening.findOne({ projectId })
      .sort({ createdAt: -1 })
      .populate('submittedBy', 'fullName email role');
  }

  async create(data: Partial<INoveltyScreening>): Promise<INoveltyScreening> {
    const screening = new NoveltyScreening(data);
    return screening.save();
  }

  async update(id: string | mongoose.Types.ObjectId, updates: Partial<INoveltyScreening>): Promise<INoveltyScreening | null> {
    return NoveltyScreening.findByIdAndUpdate(id, updates, { new: true });
  }

  async count(filter: Record<string, unknown> = {}): Promise<number> {
    return NoveltyScreening.countDocuments(filter);
  }
}

export const noveltyRepository = new NoveltyRepository();
