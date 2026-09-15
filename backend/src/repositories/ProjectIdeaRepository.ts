import { ProjectIdea, IProjectIdea } from '../models/ProjectIdea.js';

export class ProjectIdeaRepository {
  async list(filter: Record<string, unknown> = {}, skip = 0, limit = 20): Promise<{ ideas: IProjectIdea[]; total: number }> {
    const [ideas, total] = await Promise.all([
      ProjectIdea.find(filter)
        .populate('domainId', 'name slug icon')
        .populate('relatedPaperIds', 'title authors venue publicationDate')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      ProjectIdea.countDocuments(filter),
    ]);
    return { ideas, total };
  }

  async findById(id: string): Promise<IProjectIdea | null> {
    return ProjectIdea.findById(id)
      .populate('domainId', 'name slug icon')
      .populate('relatedPaperIds', 'title authors venue publicationDate doi');
  }

  async create(data: Partial<IProjectIdea>): Promise<IProjectIdea> {
    const idea = new ProjectIdea(data);
    return idea.save();
  }

  async incrementSavedCount(id: string, delta: number): Promise<void> {
    await ProjectIdea.findByIdAndUpdate(id, { $inc: { savedCount: delta } });
  }
}

export const projectIdeaRepository = new ProjectIdeaRepository();
