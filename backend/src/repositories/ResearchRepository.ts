import { ResearchDomain, IResearchDomain } from '../models/ResearchDomain.js';
import { ResearchTopic, IResearchTopic } from '../models/ResearchTopic.js';
import { ResearchPaper, IResearchPaper } from '../models/ResearchPaper.js';
import { SavedResearch, ISavedResearch, SavedItemType } from '../models/SavedResearch.js';
import mongoose from 'mongoose';

export class ResearchRepository {
  // Domains
  async listDomains(): Promise<IResearchDomain[]> {
    return ResearchDomain.find({ isActive: true }).sort({ orderIndex: 1, name: 1 });
  }

  async findDomainById(id: string): Promise<IResearchDomain | null> {
    return ResearchDomain.findById(id);
  }

  async findDomainBySlug(slug: string): Promise<IResearchDomain | null> {
    return ResearchDomain.findOne({ slug });
  }

  async createDomain(data: Partial<IResearchDomain>): Promise<IResearchDomain> {
    const domain = new ResearchDomain(data);
    return domain.save();
  }

  // Topics
  async listTopics(filter: Record<string, unknown> = {}, skip = 0, limit = 50): Promise<{ topics: IResearchTopic[]; total: number }> {
    const [topics, total] = await Promise.all([
      ResearchTopic.find(filter).populate('domainId', 'name slug icon').skip(skip).limit(limit).sort({ trendingScore: -1 }),
      ResearchTopic.countDocuments(filter),
    ]);
    return { topics, total };
  }

  async findTopicById(id: string): Promise<IResearchTopic | null> {
    return ResearchTopic.findById(id).populate('domainId', 'name slug icon');
  }

  async createTopic(data: Partial<IResearchTopic>): Promise<IResearchTopic> {
    const topic = new ResearchTopic(data);
    return topic.save();
  }

  // Papers
  async listPapers(filter: Record<string, unknown> = {}, skip = 0, limit = 20, sort: Record<string, 1 | -1> = { publicationDate: -1 }): Promise<{ papers: IResearchPaper[]; total: number }> {
    const [papers, total] = await Promise.all([
      ResearchPaper.find(filter).populate('domainId', 'name slug icon').sort(sort).skip(skip).limit(limit),
      ResearchPaper.countDocuments(filter),
    ]);
    return { papers, total };
  }

  async findPaperById(id: string): Promise<IResearchPaper | null> {
    return ResearchPaper.findById(id).populate('domainId', 'name slug icon');
  }

  async createPaper(data: Partial<IResearchPaper>): Promise<IResearchPaper> {
    const paper = new ResearchPaper(data);
    return paper.save();
  }

  async incrementPaperSavedCount(paperId: string, delta: number): Promise<void> {
    await ResearchPaper.findByIdAndUpdate(paperId, { $inc: { savedCount: delta } });
  }

  // Saved Research
  async getSavedItems(userId: string | mongoose.Types.ObjectId, type?: SavedItemType): Promise<ISavedResearch[]> {
    const query: Record<string, unknown> = { userId };
    if (type) query.itemType = type;
    return SavedResearch.find(query)
      .populate('paperId')
      .populate('topicId')
      .populate('ideaId')
      .sort({ createdAt: -1 });
  }

  async saveItem(userId: string | mongoose.Types.ObjectId, itemType: SavedItemType, itemId: string, notes?: string): Promise<ISavedResearch> {
    const field = itemType === 'PAPER' ? 'paperId' : itemType === 'TOPIC' ? 'topicId' : 'ideaId';
    const existing = await SavedResearch.findOne({ userId, itemType, [field]: itemId });
    if (existing) {
      if (notes !== undefined) {
        existing.notes = notes;
        await existing.save();
      }
      return existing;
    }

    const saved = new SavedResearch({
      userId,
      itemType,
      [field]: itemId,
      notes,
    });
    return saved.save();
  }

  async removeSavedItem(userId: string | mongoose.Types.ObjectId, itemType: SavedItemType, itemId: string): Promise<boolean> {
    const field = itemType === 'PAPER' ? 'paperId' : itemType === 'TOPIC' ? 'topicId' : 'ideaId';
    const result = await SavedResearch.deleteOne({ userId, itemType, [field]: itemId });
    return result.deletedCount > 0;
  }
}

export const researchRepository = new ResearchRepository();
