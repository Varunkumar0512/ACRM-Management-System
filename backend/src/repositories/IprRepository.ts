import { IPRDisclosure, IIPRDisclosure } from '../models/IPRDisclosure.js';
import { IPRDocument, IIPRDocument } from '../models/IPRDocument.js';
import { IPRComment, IIPRComment } from '../models/IPRComment.js';
import { IPRApplication, IIPRApplication } from '../models/IPRApplication.js';
import mongoose from 'mongoose';

export class IprRepository {
  async findById(id: string | mongoose.Types.ObjectId): Promise<IIPRDisclosure | null> {
    return IPRDisclosure.findById(id)
      .populate('projectId', 'title code department status')
      .populate('screeningId')
      .populate('primaryInventorId', 'fullName email phone role')
      .populate('assignedReviewerId', 'fullName email role');
  }

  async findByProject(projectId: string | mongoose.Types.ObjectId): Promise<IIPRDisclosure | null> {
    return IPRDisclosure.findOne({ projectId })
      .populate('screeningId')
      .populate('primaryInventorId', 'fullName email')
      .populate('assignedReviewerId', 'fullName email');
  }

  async list(filter: Record<string, unknown> = {}, skip = 0, limit = 50): Promise<{ disclosures: IIPRDisclosure[]; total: number }> {
    const [disclosures, total] = await Promise.all([
      IPRDisclosure.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('projectId', 'title code')
        .populate('screeningId', 'screeningNumber assessment confidence')
        .populate('primaryInventorId', 'fullName email')
        .populate('assignedReviewerId', 'fullName email'),
      IPRDisclosure.countDocuments(filter),
    ]);
    return { disclosures, total };
  }

  async create(data: Partial<IIPRDisclosure>): Promise<IIPRDisclosure> {
    const disclosure = new IPRDisclosure(data);
    return disclosure.save();
  }

  async update(id: string | mongoose.Types.ObjectId, updates: Partial<IIPRDisclosure>): Promise<IIPRDisclosure | null> {
    return IPRDisclosure.findByIdAndUpdate(id, updates, { new: true });
  }

  async count(filter: Record<string, unknown> = {}): Promise<number> {
    return IPRDisclosure.countDocuments(filter);
  }

  // Comments
  async getComments(iprId: string | mongoose.Types.ObjectId): Promise<IIPRComment[]> {
    return IPRComment.find({ iprId })
      .sort({ createdAt: 1 })
      .populate('authorId', 'fullName email role avatarUrl');
  }

  async addComment(data: Partial<IIPRComment>): Promise<IIPRComment> {
    const comment = new IPRComment(data);
    return comment.save();
  }

  async resolveComment(commentId: string | mongoose.Types.ObjectId, userId: string | mongoose.Types.ObjectId): Promise<IIPRComment | null> {
    return IPRComment.findByIdAndUpdate(
      commentId,
      { status: 'RESOLVED', resolvedBy: userId, resolvedAt: new Date() },
      { new: true }
    );
  }

  // Documents
  async getDocuments(iprId: string | mongoose.Types.ObjectId): Promise<IIPRDocument[]> {
    return IPRDocument.find({ iprId })
      .sort({ createdAt: -1 })
      .populate('uploadedBy', 'fullName email');
  }

  async addDocument(data: Partial<IIPRDocument>): Promise<IIPRDocument> {
    const doc = new IPRDocument(data);
    return doc.save();
  }

  // Application Tracking
  async getApplications(iprId: string | mongoose.Types.ObjectId): Promise<IIPRApplication[]> {
    return IPRApplication.find({ iprId }).sort({ filingDate: -1 });
  }

  async saveApplication(data: Partial<IIPRApplication>): Promise<IIPRApplication> {
    const app = new IPRApplication(data);
    return app.save();
  }
}

export const iprRepository = new IprRepository();
