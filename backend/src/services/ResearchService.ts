import { researchRepository } from '../repositories/ResearchRepository.js';
import { projectIdeaRepository } from '../repositories/ProjectIdeaRepository.js';
import { studentProfileRepository } from '../repositories/StudentProfileRepository.js';
import { projectRepository } from '../repositories/ProjectRepository.js';
import { ResearchPaper, IResearchPaper } from '../models/ResearchPaper.js';
import { ProjectIdea, IProjectIdea } from '../models/ProjectIdea.js';
import { SavedItemType } from '../models/SavedResearch.js';
import mongoose from 'mongoose';

export class ResearchService {
  async listDomains() {
    const domains = await researchRepository.listDomains();
    // Fetch counts per domain
    const domainsWithCounts = await Promise.all(
      domains.map(async (domain) => {
        const [topicCount, paperCount, ideaCount] = await Promise.all([
          researchRepository.listTopics({ domainId: domain._id }),
          researchRepository.listPapers({ domainId: domain._id }),
          projectIdeaRepository.list({ domainId: domain._id }),
        ]);
        return {
          ...domain.toObject(),
          topicCount: topicCount.total,
          paperCount: paperCount.total,
          ideaCount: ideaCount.total,
        };
      })
    );
    return domainsWithCounts;
  }

  async listTopics(query: { domainId?: string; search?: string; skip?: number; limit?: number }) {
    const filter: Record<string, unknown> = { isActive: true };
    if (query.domainId) filter.domainId = query.domainId;
    if (query.search) {
      filter.$text = { $search: query.search };
    }
    return researchRepository.listTopics(filter, query.skip || 0, query.limit || 50);
  }

  async listPapers(query: {
    domainId?: string;
    department?: string;
    search?: string;
    sortBy?: 'date' | 'citations' | 'saved';
    skip?: number;
    limit?: number;
  }) {
    const filter: Record<string, unknown> = { isActive: true };
    if (query.domainId) filter.domainId = query.domainId;
    if (query.department) filter.department = query.department;
    if (query.search) {
      filter.$text = { $search: query.search };
    }

    const sortMap: Record<string, Record<string, 1 | -1>> = {
      date: { publicationDate: -1 },
      citations: { citationsCount: -1 },
      saved: { savedCount: -1 },
    };

    const sort = sortMap[query.sortBy || 'date'] || { publicationDate: -1 };
    return researchRepository.listPapers(filter, query.skip || 0, query.limit || 20, sort);
  }

  async getPaperDetails(paperId: string) {
    const paper = await researchRepository.findPaperById(paperId);
    if (!paper) return null;

    // Find related project ideas
    const relatedIdeas = await ProjectIdea.find({
      $or: [{ domainId: paper.domainId }, { relatedPaperIds: paper._id }],
    })
      .limit(3)
      .populate('domainId', 'name slug');

    return { paper, relatedIdeas };
  }

  async listProjectIdeas(query: { domainId?: string; difficulty?: string; search?: string; skip?: number; limit?: number }) {
    const filter: Record<string, unknown> = { isActive: true };
    if (query.domainId) filter.domainId = query.domainId;
    if (query.difficulty) filter.difficulty = query.difficulty;
    if (query.search) {
      filter.$text = { $search: query.search };
    }
    return projectIdeaRepository.list(filter, query.skip || 0, query.limit || 20);
  }

  async toggleSavedResearch(userId: string, itemType: SavedItemType, itemId: string, notes?: string) {
    const savedItems = await researchRepository.getSavedItems(userId, itemType);
    const existing = savedItems.find((s) => {
      if (itemType === 'PAPER') return s.paperId && (s.paperId as any)._id?.toString() === itemId;
      if (itemType === 'TOPIC') return s.topicId && (s.topicId as any)._id?.toString() === itemId;
      return s.ideaId && (s.ideaId as any)._id?.toString() === itemId;
    });

    if (existing) {
      await researchRepository.removeSavedItem(userId, itemType, itemId);
      if (itemType === 'PAPER') await researchRepository.incrementPaperSavedCount(itemId, -1);
      if (itemType === 'IDEA') await projectIdeaRepository.incrementSavedCount(itemId, -1);
      return { isSaved: false };
    } else {
      await researchRepository.saveItem(userId, itemType, itemId, notes);
      if (itemType === 'PAPER') await researchRepository.incrementPaperSavedCount(itemId, 1);
      if (itemType === 'IDEA') await projectIdeaRepository.incrementSavedCount(itemId, 1);
      return { isSaved: true };
    }
  }

  async getSavedResearch(userId: string) {
    return researchRepository.getSavedItems(userId);
  }

  /**
   * Rule-Based Recommendation Engine:
   * Accurately blends:
   * 1. Student's department match (+30 points)
   * 2. Overlap with student's declared research interests (+25 points per keyword match)
   * 3. Similarity with student's active project research domains (+20 points)
   * 4. Citation and trending impact weight (+10 points)
   */
  async getRecommendations(userId: string) {
    const studentProfile = await studentProfileRepository.findByUserId(userId);
    const studentProjects = await projectRepository.findProjectsForStudent(userId);

    const targetDepartment = studentProfile?.department || '';
    const userInterests = (studentProfile?.researchInterests || []).map((i) => i.toLowerCase().trim());
    const activeDomainIds = studentProjects
      .map((p) => (p.projectId as any)?.domainId?._id?.toString() || (p.projectId as any)?.domainId?.toString())
      .filter(Boolean);

    // Fetch candidate papers
    const candidatePapers = await ResearchPaper.find({ isActive: true })
      .populate('domainId', 'name slug icon')
      .limit(60);

    const scoredPapers = candidatePapers.map((paper) => {
      let score = 0;
      const reasons: string[] = [];

      // 1. Department match
      if (targetDepartment && paper.department.toLowerCase() === targetDepartment.toLowerCase()) {
        score += 30;
        reasons.push(`Matches your department (${paper.department})`);
      }

      // 2. Domain overlap with active projects
      if (activeDomainIds.includes(paper.domainId?._id?.toString())) {
        score += 25;
        reasons.push('Aligns with your active project domain');
      }

      // 3. Keyword interest match
      const paperKeywords = (paper.keywords || []).map((k) => k.toLowerCase());
      const matchedKeywords = userInterests.filter((interest) =>
        paperKeywords.some((pk) => pk.includes(interest) || interest.includes(pk))
      );
      if (matchedKeywords.length > 0) {
        score += matchedKeywords.length * 20;
        reasons.push(`Matches interests: ${matchedKeywords.join(', ')}`);
      }

      // 4. Citation benchmark score
      if (paper.citationsCount > 50) {
        score += 10;
        reasons.push('High-impact reference paper');
      }

      return {
        paper,
        relevanceScore: Math.min(score, 100),
        recommendationReasons: reasons.length > 0 ? reasons : ['Institutional research discovery highlight'],
      };
    });

    // Sort by relevance score descending
    scoredPapers.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Recommended project ideas
    const candidateIdeas = await ProjectIdea.find({ isActive: true })
      .populate('domainId', 'name slug icon')
      .limit(20);

    const scoredIdeas = candidateIdeas.map((idea) => {
      let score = 20; // baseline
      const reasons: string[] = [];

      if (activeDomainIds.includes(idea.domainId?._id?.toString())) {
        score += 35;
        reasons.push('Corresponds to your active research domain');
      }

      const ideaTech = (idea.technologies || []).map((t) => t.toLowerCase());
      const matchedTech = userInterests.filter((interest) =>
        ideaTech.some((t) => t.includes(interest) || interest.includes(t))
      );
      if (matchedTech.length > 0) {
        score += matchedTech.length * 20;
        reasons.push(`Leverages technology stack in your interests`);
      }

      return {
        idea,
        relevanceScore: Math.min(score, 100),
        recommendationReasons: reasons.length > 0 ? reasons : ['Recommended student project topic'],
      };
    });

    scoredIdeas.sort((a, b) => b.relevanceScore - a.relevanceScore);

    return {
      recommendedPapers: scoredPapers.slice(0, 10),
      recommendedIdeas: scoredIdeas.slice(0, 6),
      algorithmMetadata: {
        engine: 'Deterministic Academic Rule-Based Matcher v1.0',
        factorsEvaluated: ['Department Alignment', 'Declared Research Interests', 'Active Project Domain', 'Citation Impact'],
      },
    };
  }
}

export const researchService = new ResearchService();
