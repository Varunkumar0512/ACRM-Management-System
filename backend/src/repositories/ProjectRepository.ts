import { Project, IProject } from '../models/Project.js';
import { ProjectMember, IProjectMember } from '../models/ProjectMember.js';
import { ProjectGuide, IProjectGuide } from '../models/ProjectGuide.js';
import { Milestone, IMilestone } from '../models/Milestone.js';
import { DocumentModel, IDocument } from '../models/Document.js';
import { Comment, IComment } from '../models/Comment.js';
import { Review, IReview } from '../models/Review.js';
import { ProjectDiscussion, IProjectDiscussion } from '../models/ProjectDiscussion.js';
import { ProjectStatus, MilestoneStatus } from '../config/constants.js';
import mongoose from 'mongoose';

export class ProjectRepository {
  // Project Core
  async create(data: Partial<IProject>): Promise<IProject> {
    const project = new Project(data);
    return project.save();
  }

  async findById(id: string): Promise<IProject | null> {
    return Project.findById(id)
      .populate('domainId', 'name slug icon')
      .populate('ownerId', 'email fullName avatarUrl');
  }

  async update(id: string, updates: Partial<IProject>): Promise<IProject | null> {
    return Project.findByIdAndUpdate(id, updates, { new: true })
      .populate('domainId', 'name slug icon')
      .populate('ownerId', 'email fullName avatarUrl');
  }

  async list(filter: Record<string, unknown> = {}, skip = 0, limit = 20): Promise<{ projects: IProject[]; total: number }> {
    const [projects, total] = await Promise.all([
      Project.find(filter)
        .populate('domainId', 'name slug icon')
        .populate('ownerId', 'email fullName avatarUrl')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit),
      Project.countDocuments(filter),
    ]);
    return { projects, total };
  }

  async countByStatus(): Promise<Record<string, number>> {
    const counts = await Project.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const result: Record<string, number> = {};
    counts.forEach((c) => {
      result[c._id] = c.count;
    });
    return result;
  }

  // Members
  async addMember(projectId: string | mongoose.Types.ObjectId, studentId: string | mongoose.Types.ObjectId, role: 'OWNER' | 'MEMBER', invitedBy: string | mongoose.Types.ObjectId): Promise<IProjectMember> {
    return ProjectMember.create({
      projectId,
      studentId,
      role,
      status: role === 'OWNER' ? 'ACCEPTED' : 'PENDING',
      joinedAt: role === 'OWNER' ? new Date() : null,
      invitedBy,
    });
  }

  async getMembers(projectId: string): Promise<IProjectMember[]> {
    return ProjectMember.find({ projectId })
      .populate('studentId', 'email fullName avatarUrl')
      .sort({ role: 1, createdAt: 1 });
  }

  async findMembership(projectId: string, studentId: string): Promise<IProjectMember | null> {
    return ProjectMember.findOne({ projectId, studentId });
  }

  async findProjectsForStudent(studentId: string): Promise<IProjectMember[]> {
    return ProjectMember.find({ studentId, status: 'ACCEPTED' })
      .populate({
        path: 'projectId',
        populate: [
          { path: 'domainId', select: 'name slug icon' },
          { path: 'ownerId', select: 'email fullName avatarUrl' },
        ],
      });
  }

  // Guides
  async addGuideRequest(projectId: string | mongoose.Types.ObjectId, facultyId: string | mongoose.Types.ObjectId, role: 'PRIMARY_GUIDE' | 'CO_GUIDE'): Promise<IProjectGuide> {
    return ProjectGuide.create({
      projectId,
      facultyId,
      role,
      status: 'REQUESTED',
    });
  }

  async getGuides(projectId: string): Promise<IProjectGuide[]> {
    return ProjectGuide.find({ projectId })
      .populate({
        path: 'facultyId',
        select: 'email fullName avatarUrl',
      })
      .sort({ role: 1 });
  }

  async findGuide(projectId: string, facultyId: string): Promise<IProjectGuide | null> {
    return ProjectGuide.findOne({ projectId, facultyId });
  }

  async findAssignedProjectsForFaculty(facultyId: string, status?: string): Promise<IProjectGuide[]> {
    const query: Record<string, unknown> = { facultyId };
    if (status) query.status = status;
    return ProjectGuide.find(query)
      .populate({
        path: 'projectId',
        populate: [
          { path: 'domainId', select: 'name slug icon' },
          { path: 'ownerId', select: 'email fullName avatarUrl' },
        ],
      })
      .sort({ requestedAt: -1 });
  }

  // Milestones
  async getMilestones(projectId: string): Promise<IMilestone[]> {
    return Milestone.find({ projectId })
      .populate('assignedMemberIds', 'email fullName avatarUrl')
      .sort({ orderIndex: 1, createdAt: 1 });
  }

  async createMilestone(data: Partial<IMilestone>): Promise<IMilestone> {
    return Milestone.create(data);
  }

  async updateMilestone(milestoneId: string, updates: Partial<IMilestone>): Promise<IMilestone | null> {
    return Milestone.findByIdAndUpdate(milestoneId, updates, { new: true });
  }

  async findMilestoneById(milestoneId: string): Promise<IMilestone | null> {
    return Milestone.findById(milestoneId);
  }

  async deleteMilestone(milestoneId: string): Promise<boolean> {
    const res = await Milestone.findByIdAndDelete(milestoneId);
    return !!res;
  }

  async calculateProjectProgress(projectId: string): Promise<number> {
    const milestones = await Milestone.find({ projectId });
    if (milestones.length === 0) return 0;

    let totalWeight = 0;
    let completedWeight = 0;

    for (const m of milestones) {
      const weight = m.weight || 1;
      totalWeight += weight;
      if (m.status === MilestoneStatus.COMPLETED || m.status === MilestoneStatus.APPROVED) {
        completedWeight += weight;
      } else if (m.status === MilestoneStatus.SUBMITTED) {
        completedWeight += weight * 0.75;
      } else if (m.status === MilestoneStatus.IN_PROGRESS) {
        completedWeight += weight * 0.35;
      }
    }

    const calculatedProgress = Math.round((completedWeight / totalWeight) * 100);
    await Project.findByIdAndUpdate(projectId, { progressPercentage: calculatedProgress });
    return calculatedProgress;
  }

  // Documents
  async getDocuments(projectId: string): Promise<IDocument[]> {
    return DocumentModel.find({ projectId })
      .populate('uploadedBy', 'email fullName avatarUrl role')
      .populate('milestoneId', 'title orderIndex')
      .sort({ createdAt: -1 });
  }

  async createDocument(data: Partial<IDocument>): Promise<IDocument> {
    return DocumentModel.create(data);
  }

  async findDocumentById(id: string): Promise<IDocument | null> {
    return DocumentModel.findById(id);
  }

  // Comments
  async getComments(projectId: string): Promise<IComment[]> {
    return Comment.find({ projectId })
      .populate('authorId', 'email fullName avatarUrl role')
      .populate('resolvedBy', 'email fullName')
      .populate('referencedMilestoneId', 'title')
      .populate('referencedDocumentId', 'originalName type')
      .sort({ createdAt: 1 });
  }

  async createComment(data: Partial<IComment>): Promise<IComment> {
    const comment = await Comment.create(data);
    return comment.populate('authorId', 'email fullName avatarUrl role');
  }

  async findCommentById(commentId: string): Promise<IComment | null> {
    return Comment.findById(commentId);
  }

  async updateComment(commentId: string, updates: Partial<IComment>): Promise<IComment | null> {
    return Comment.findByIdAndUpdate(commentId, updates, { new: true })
      .populate('authorId', 'email fullName avatarUrl role')
      .populate('resolvedBy', 'email fullName');
  }

  // Reviews
  async getReviews(projectId: string): Promise<IReview[]> {
    return Review.find({ projectId })
      .populate('reviewerId', 'email fullName avatarUrl role')
      .populate('milestoneId', 'title')
      .sort({ createdAt: -1 });
  }

  async createReview(data: Partial<IReview>): Promise<IReview> {
    const review = await Review.create(data);
    return review.populate('reviewerId', 'email fullName avatarUrl role');
  }

  // Discussions
  async getDiscussions(projectId: string, limit = 50): Promise<IProjectDiscussion[]> {
    return ProjectDiscussion.find({ projectId })
      .populate('senderId', 'email fullName avatarUrl role')
      .sort({ createdAt: 1 })
      .limit(limit);
  }

  async createDiscussionMessage(data: Partial<IProjectDiscussion>): Promise<IProjectDiscussion> {
    const msg = await ProjectDiscussion.create(data);
    return msg.populate('senderId', 'email fullName avatarUrl role');
  }
}

export const projectRepository = new ProjectRepository();
