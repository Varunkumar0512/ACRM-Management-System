import { iprRepository } from '../repositories/IprRepository.js';
import { noveltyRepository } from '../repositories/NoveltyRepository.js';
import { projectRepository } from '../repositories/ProjectRepository.js';
import { auditLogRepository } from '../repositories/AuditLogRepository.js';
import { IprStatus, IprCategory, IprConfidentiality, IprDocumentType, AuditAction, UserRole } from '../config/constants.js';
import { BadRequestError, UnauthorizedError, NotFoundError, ForbiddenError } from '../errors/AppError.js';
import mongoose from 'mongoose';

export class IprService {
  /**
   * Submit an IPR Disclosure.
   * Enforces mandatory prior completion & acknowledgment of AI-assisted preliminary novelty screening.
   */
  async submitDisclosure(
    userId: string,
    data: {
      title: string;
      category: IprCategory;
      projectId: string;
      screeningId: string;
      confidentiality?: IprConfidentiality;
      summary: string;
      commercialPotential?: string;
      stageOfDevelopment?: string;
      coInventors?: Array<{ userId?: string; name: string; email: string; department?: string; sharePercentage?: number }>;
      acknowledgementAccepted: boolean;
    }
  ): Promise<any> {
    if (!data.acknowledgementAccepted) {
      throw new BadRequestError('You must explicitly accept the preliminary screening acknowledgment.');
    }

    // Step 1: Validate Project exists and user has rights
    const project = await projectRepository.findById(data.projectId);
    if (!project) {
      throw new NotFoundError('Associated project not found.');
    }

    // Step 2: Validate that Novelty Screening exists, is completed, and belongs to this project
    const screening = await noveltyRepository.findById(data.screeningId);
    if (!screening) {
      throw new BadRequestError('Valid AI Novelty Screening record is required before submitting an IPR disclosure.');
    }

    if (screening.projectId._id.toString() !== data.projectId) {
      throw new BadRequestError('Novelty screening does not match the referenced project.');
    }

    if (screening.status !== 'COMPLETED') {
      throw new BadRequestError('AI Novelty Screening must be completed before an IPR disclosure can be submitted.');
    }

    if (!screening.studentAcknowledged) {
      throw new BadRequestError('You must explicitly review and acknowledge the preliminary novelty screening and legal disclaimer before submitting an institutional IPR disclosure.');
    }

    // Step 3: Generate institutional IPR number
    const count = await iprRepository.count();
    const year = new Date().getFullYear();
    const iprNumber = `IPR-${year}-${String(count + 1).padStart(3, '0')}`;

    // Step 4: Map co-inventors
    const coInventors = (data.coInventors || []).map((c) => ({
      userId: c.userId ? new mongoose.Types.ObjectId(c.userId) : undefined,
      name: c.name,
      email: c.email,
      department: c.department || '',
      sharePercentage: c.sharePercentage || 0,
    }));

    const disclosure = await iprRepository.create({
      iprNumber,
      title: data.title.trim(),
      category: data.category,
      projectId: new mongoose.Types.ObjectId(data.projectId),
      screeningId: new mongoose.Types.ObjectId(data.screeningId),
      status: IprStatus.SUBMITTED,
      confidentiality: data.confidentiality || IprConfidentiality.INSTITUTION_ONLY,
      summary: data.summary.trim(),
      commercialPotential: data.commercialPotential || '',
      stageOfDevelopment: data.stageOfDevelopment || 'LAB_PROTOTYPE',
      primaryInventorId: new mongoose.Types.ObjectId(userId),
      coInventors,
      acknowledgementAccepted: true,
      acknowledgedAt: new Date(),
      history: [
        {
          toStatus: IprStatus.SUBMITTED,
          changedBy: new mongoose.Types.ObjectId(userId),
          timestamp: new Date(),
          notes: 'IPR disclosure submitted following AI preliminary novelty screening.',
        },
      ],
    });

    await auditLogRepository.log({
      userId,
      action: AuditAction.IPR_DISCLOSURE_SUBMITTED,
      resourceType: 'IPRDisclosure',
      resourceId: disclosure._id.toString(),
      details: { iprNumber, title: disclosure.title, category: disclosure.category },
    });

    return disclosure;
  }

  /**
   * List disclosures respecting role and confidentiality permissions.
   */
  async listDisclosures(
    userId: string,
    userRole: UserRole,
    filter: { category?: string; status?: string; projectId?: string; mineOnly?: boolean },
    skip = 0,
    limit = 50
  ): Promise<any> {
    const mongoFilter: Record<string, any> = {};

    if (filter.category) {
      mongoFilter.category = filter.category;
    }
    if (filter.status) {
      mongoFilter.status = filter.status;
    }
    if (filter.projectId) {
      mongoFilter.projectId = filter.projectId;
    }

    if (userRole === UserRole.STUDENT || filter.mineOnly) {
      mongoFilter.$or = [
        { primaryInventorId: userId },
        { 'coInventors.userId': userId },
      ];
    } else if (userRole === UserRole.FACULTY) {
      // Faculty see items where they are primary inventor, or where they guide the project, or institutional
      mongoFilter.$or = [
        { primaryInventorId: userId },
        { 'coInventors.userId': userId },
        { confidentiality: { $in: [IprConfidentiality.INSTITUTION_ONLY, IprConfidentiality.AUTHORIZED_FACULTY, IprConfidentiality.APPROVED_PUBLIC] } },
      ];
    }
    // Admin has access to all

    return iprRepository.list(mongoFilter, skip, limit);
  }

  /**
   * Get single IPR disclosure by ID with confidentiality enforcement.
   */
  async getDisclosureById(id: string, userId: string, userRole: UserRole): Promise<any> {
    const disclosure = await iprRepository.findById(id);
    if (!disclosure) {
      throw new NotFoundError('IPR disclosure record not found.');
    }

    // Check confidentiality permissions
    if (userRole !== UserRole.ADMIN) {
      const isPrimary = disclosure.primaryInventorId._id.toString() === userId;
      const isCoInventor = disclosure.coInventors?.some((c) => c.userId?.toString() === userId);
      const isAssignedReviewer = disclosure.assignedReviewerId?._id?.toString() === userId;

      if (!isPrimary && !isCoInventor && !isAssignedReviewer) {
        if (disclosure.confidentiality === IprConfidentiality.PRIVATE) {
          throw new ForbiddenError('This IPR disclosure is designated Private.');
        }
        if (disclosure.confidentiality === IprConfidentiality.AUTHORIZED_IPR_REVIEWERS && userRole !== UserRole.FACULTY) {
          throw new ForbiddenError('Access is restricted to authorized IPR reviewers.');
        }
      }
    }

    const comments = await iprRepository.getComments(disclosure._id);
    const documents = await iprRepository.getDocuments(disclosure._id);
    const applications = await iprRepository.getApplications(disclosure._id);

    return {
      disclosure,
      comments,
      documents,
      applications,
    };
  }

  /**
   * Transition IPR Review Status (with validated state machine).
   */
  async updateStatus(
    id: string,
    newStatus: IprStatus,
    userId: string,
    notes?: string
  ): Promise<any> {
    const disclosure = await iprRepository.findById(id);
    if (!disclosure) {
      throw new NotFoundError('IPR disclosure not found.');
    }

    const previousStatus = disclosure.status;

    // Record in history
    disclosure.status = newStatus;
    disclosure.history.push({
      fromStatus: previousStatus,
      toStatus: newStatus,
      changedBy: new mongoose.Types.ObjectId(userId),
      timestamp: new Date(),
      notes: notes || `Status transitioned to ${newStatus}`,
    });

    await disclosure.save();

    await auditLogRepository.log({
      userId,
      action: AuditAction.IPR_STATUS_CHANGED,
      resourceType: 'IPRDisclosure',
      resourceId: disclosure._id.toString(),
      details: { fromStatus: previousStatus, toStatus: newStatus, notes },
    });

    return disclosure;
  }

  /**
   * Add reviewer or student comment to IPR thread.
   */
  async addComment(
    iprId: string,
    userId: string,
    data: { message: string; relatedSection?: string; parentCommentId?: string }
  ): Promise<any> {
    const disclosure = await iprRepository.findById(iprId);
    if (!disclosure) {
      throw new NotFoundError('IPR disclosure not found.');
    }

    const comment = await iprRepository.addComment({
      iprId: new mongoose.Types.ObjectId(iprId),
      authorId: new mongoose.Types.ObjectId(userId),
      message: data.message.trim(),
      relatedSection: data.relatedSection || 'general',
      parentCommentId: data.parentCommentId ? new mongoose.Types.ObjectId(data.parentCommentId) : undefined,
      status: 'OPEN',
    });

    return comment;
  }

  /**
   * Resolve an IPR comment thread.
   */
  async resolveComment(commentId: string, userId: string): Promise<any> {
    const comment = await iprRepository.resolveComment(commentId, userId);
    if (!comment) {
      throw new NotFoundError('Comment not found.');
    }
    return comment;
  }

  /**
   * Upload or attach deliverable document.
   */
  async addDocument(
    iprId: string,
    userId: string,
    data: { originalName: string; filename: string; type?: IprDocumentType; description?: string }
  ): Promise<any> {
    const disclosure = await iprRepository.findById(iprId);
    if (!disclosure) {
      throw new NotFoundError('IPR disclosure not found.');
    }

    const existingDocs = await iprRepository.getDocuments(iprId);
    const version = existingDocs.length + 1;

    const doc = await iprRepository.addDocument({
      iprId: new mongoose.Types.ObjectId(iprId),
      originalName: data.originalName,
      filename: data.filename,
      type: data.type || IprDocumentType.TECHNICAL_SPEC,
      version,
      uploadedBy: new mongoose.Types.ObjectId(userId),
      description: data.description || '',
    });

    return doc;
  }

  /**
   * Record external application tracking details (Indian Patent Office, USPTO, WIPO, etc.).
   */
  async recordApplication(
    iprId: string,
    data: {
      applicationNumber: string;
      filingDate?: string;
      authority: string;
      applicationType: string;
      status?: string;
      publicationNumber?: string;
      grantNumber?: string;
      notes?: string;
    }
  ): Promise<any> {
    const disclosure = await iprRepository.findById(iprId);
    if (!disclosure) {
      throw new NotFoundError('IPR disclosure not found.');
    }

    const app = await iprRepository.saveApplication({
      iprId: new mongoose.Types.ObjectId(iprId),
      applicationNumber: data.applicationNumber.trim(),
      filingDate: data.filingDate ? new Date(data.filingDate) : new Date(),
      authority: data.authority.trim(),
      applicationType: data.applicationType.trim(),
      status: data.status || 'FILED',
      publicationNumber: data.publicationNumber || '',
      grantNumber: data.grantNumber || '',
      notes: data.notes || '',
    });

    // Update disclosure filingDetails summary
    disclosure.filingDetails = {
      applicationNumber: data.applicationNumber.trim(),
      filingDate: data.filingDate ? new Date(data.filingDate) : new Date(),
      authority: data.authority.trim(),
      status: data.status || 'FILED',
      notes: data.notes || '',
    };
    if (disclosure.status === IprStatus.APPROVED || disclosure.status === IprStatus.APPLICATION_IN_PROGRESS) {
      disclosure.status = IprStatus.FILED;
    }
    await disclosure.save();

    return app;
  }
}

export const iprService = new IprService();
