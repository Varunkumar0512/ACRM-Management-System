import { Request, Response, NextFunction } from 'express';
import { ResearchPaper } from '../models/ResearchPaper.js';
import { ResearchTopic } from '../models/ResearchTopic.js';
import { ProjectIdea } from '../models/ProjectIdea.js';
import { Project } from '../models/Project.js';
import { ProjectMember } from '../models/ProjectMember.js';
import { ProjectGuide } from '../models/ProjectGuide.js';
import { FacultyProfile } from '../models/FacultyProfile.js';
import { UserRole } from '../config/constants.js';

export class SearchController {
  globalSearch = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const q = (req.query.q as string)?.trim();
      if (!q || q.length < 2) {
        res.status(200).json({
          success: true,
          data: { papers: [], topics: [], ideas: [], projects: [], faculty: [] },
        });
        return;
      }

      const regex = new RegExp(q, 'i');
      const user = req.user!;

      // Search permitted projects (never leak private projects to unauthorized users)
      const projectFilter: Record<string, unknown> = {
        $or: [{ title: regex }, { problemStatement: regex }, { technologies: regex }],
      };
      if (user.role !== UserRole.ADMIN) {
        const [memberships, guides] = await Promise.all([
          ProjectMember.find({ studentId: user.userId, status: 'ACCEPTED' }),
          ProjectGuide.find({ facultyId: user.userId, status: 'ACCEPTED' }),
        ]);
        const userProjectIds = [
          ...memberships.map((m) => m.projectId),
          ...guides.map((g) => g.projectId),
        ];

        projectFilter.$and = [
          {
            $or: [
              { isPublic: true },
              { ownerId: user.userId },
              { _id: { $in: userProjectIds } },
            ],
          },
        ];
      }

      const [papers, topics, ideas, projects, faculty] = await Promise.all([
        ResearchPaper.find({
          $or: [{ title: regex }, { abstract: regex }, { keywords: regex }, { authors: regex }],
          isActive: true,
        })
          .populate('domainId', 'name slug')
          .limit(6),

        ResearchTopic.find({
          $or: [{ title: regex }, { description: regex }, { keywords: regex }],
          isActive: true,
        })
          .populate('domainId', 'name slug')
          .limit(6),

        ProjectIdea.find({
          $or: [{ title: regex }, { problemStatement: regex }, { technologies: regex }],
          isActive: true,
        })
          .populate('domainId', 'name slug')
          .limit(6),

        Project.find(projectFilter)
          .populate('domainId', 'name slug')
          .populate('ownerId', 'fullName email')
          .limit(6),

        FacultyProfile.find({
          $or: [{ department: regex }, { areasOfExpertise: regex }, { designation: regex }],
        })
          .populate('userId', 'fullName email avatarUrl')
          .limit(6),
      ]);

      res.status(200).json({
        success: true,
        data: {
          papers,
          topics,
          ideas,
          projects,
          faculty,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}

export const searchController = new SearchController();
