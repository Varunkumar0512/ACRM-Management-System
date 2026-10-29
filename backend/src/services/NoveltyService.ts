import { noveltyRepository } from '../repositories/NoveltyRepository.js';
import { projectRepository } from '../repositories/ProjectRepository.js';
import { ResearchPaper } from '../models/ResearchPaper.js';
import { Project } from '../models/Project.js';
import { NoveltyAssessment, NoveltyConfidence, AuditAction, UserRole } from '../config/constants.js';
import { auditLogRepository } from '../repositories/AuditLogRepository.js';
import { BadRequestError, NotFoundError, ForbiddenError } from '../errors/AppError.js';
import { verifyProjectAccess } from '../utils/projectAuth.js';
import mongoose from 'mongoose';

export interface NoveltyAnalysisOutput {
  assessment: NoveltyAssessment;
  confidence: NoveltyConfidence;
  distinguishingFeatures: string[];
  similarAreas: Array<{ title: string; source: string; description: string }>;
  potentialOverlap: string;
  recommendedNextSteps: string[];
  sourcesConsulted: {
    papersCount: number;
    patentRecordsCount: number;
    institutionalCount: number;
    externalConnected: boolean;
    message: string;
    sampleSources: Array<{ title: string; type: string; citationOrDoi?: string }>;
  };
  questions: string[];
  disclaimer: string;
}

export class NoveltyService {
  private readonly LEGAL_DISCLAIMER =
    'This screening provides an AI-assisted preliminary assessment based on the information and available research sources. It is not a legal opinion and does not determine patentability or guarantee novelty.';

  /**
   * Run preliminary novelty screening against available internal campus research and active projects.
   */
  async runPreliminaryScreening(
    userId: string,
    data: {
      projectId: string;
      innovationTitle: string;
      problem: string;
      proposedSolution: string;
      keyTechnicalFeatures: string[];
      differentiation: string;
      technologiesUsed: string[];
      targetApplication: string;
      relatedResearch?: string;
    },
    userRole: UserRole = UserRole.STUDENT
  ): Promise<any> {
    const { project } = await verifyProjectAccess(data.projectId, userId, userRole, true);

    // Step 1: Query actual local institutional repository (Research papers & Projects)
    // Extract search keywords from title, technologies, and features
    const keywords = [
      ...data.technologiesUsed,
      ...data.keyTechnicalFeatures.map((f) => f.split(' ')).flat(),
      ...data.innovationTitle.split(' '),
    ]
      .map((k) => k.trim().toLowerCase())
      .filter((k) => k.length > 3);

    const uniqueKeywords = Array.from(new Set(keywords)).slice(0, 8);

    // Search real papers in MongoDB
    const regexQueries = uniqueKeywords.map((k) => new RegExp(k, 'i'));
    const matchedPapers = await ResearchPaper.find({
      $or: [{ title: { $in: regexQueries } }, { keywords: { $in: regexQueries } }, { tags: { $in: regexQueries } }],
    })
      .limit(6)
      .select('title venue publicationDate doi keywords department');

    const totalCampusPapersCount = await ResearchPaper.countDocuments();

    // Search existing campus projects (excluding the current project)
    const matchedProjects = await Project.find({
      _id: { $ne: project._id },
      $or: [{ title: { $in: regexQueries } }, { technologies: { $in: regexQueries } }],
    })
      .limit(4)
      .select('title code department technologies');

    const totalCampusProjectsCount = await Project.countDocuments();

    // Step 2: Formulate rigorous, challenging analysis
    const similarAreas: Array<{ title: string; source: string; description: string }> = [];

    matchedPapers.forEach((paper) => {
      similarAreas.push({
        title: paper.title,
        source: `ACRM Literature (${paper.venue || paper.department})`,
        description: `Investigates related techniques in ${paper.keywords?.slice(0, 3).join(', ') || 'the discipline'}.`,
      });
    });

    matchedProjects.forEach((proj) => {
      similarAreas.push({
        title: proj.title,
        source: `Campus Project Repository (${proj.code})`,
        description: `Employs similar architectural components (${proj.technologies?.slice(0, 3).join(', ')}).`,
      });
    });

    // Determine preliminary assessment classification
    let assessment: NoveltyAssessment = NoveltyAssessment.POTENTIALLY_DISTINCT;
    let confidence: NoveltyConfidence = NoveltyConfidence.MODERATE;
    let potentialOverlap = '';

    if (data.problem.length < 20 || data.differentiation.length < 20) {
      assessment = NoveltyAssessment.INSUFFICIENT_INFORMATION;
      confidence = NoveltyConfidence.LOW;
      potentialOverlap = 'The provided problem statement or differentiation lacked sufficient technical depth to evaluate novelty.';
    } else if (similarAreas.length >= 4) {
      assessment = NoveltyAssessment.SOME_SIMILARITIES_FOUND;
      confidence = NoveltyConfidence.MODERATE;
      potentialOverlap = `Found ${similarAreas.length} campus research items exploring overlapping technical mechanisms. Key distinctions must be mathematically or architecturally substantiated.`;
    } else if (similarAreas.length > 0) {
      assessment = NoveltyAssessment.POTENTIALLY_DISTINCT;
      confidence = NoveltyConfidence.MODERATE;
      potentialOverlap = `Some existing systems provide foundational techniques. Further technical differentiation in the execution mechanism should be explicitly documented.`;
    } else {
      assessment = NoveltyAssessment.POTENTIALLY_DISTINCT;
      confidence = NoveltyConfidence.PRELIMINARY;
      potentialOverlap = 'No direct duplicate found within the local ACRM repository. External search recommended.';
    }

    const distinguishingFeatures = data.keyTechnicalFeatures.filter((f) => f.length > 5);

    const recommendedNextSteps = [
      'Clarify the unique technical mechanism and algorithms employed',
      'Document step-by-step implementation and empirical benchmark results',
      'Review cited prior art papers with your designated faculty guide',
      'Discuss findings with the institutional IPR reviewer prior to filing',
    ];

    const sampleSources = matchedPapers.map((p) => ({
      title: p.title,
      type: 'Campus Research Publication',
      citationOrDoi: p.doi || undefined,
    }));

    // Sources transparency breakdown
    const sourcesConsulted = {
      papersCount: totalCampusPapersCount,
      patentRecordsCount: 0, // Explicitly 0 - no false numbers
      institutionalCount: totalCampusProjectsCount,
      externalConnected: false,
      message: 'External prior-art search is not currently connected. This screening is based only on the available ACRM research data.',
      sampleSources,
    };

    // Challenging questions generated for the student
    const questions = [
      'What specific algorithmic or hardware mechanism makes your solution distinctive?',
      'Does the improvement rely purely on a user interface reconfiguration or a fundamental architectural distinction?',
      'What existing baseline or literature benchmark did you measure your improvements against?',
      'Which sub-components are established prior art versus original technical contributions?',
    ];

    // Count existing screenings for project to compute version
    const existingScreenings = await noveltyRepository.findByProject(project._id);
    const version = existingScreenings.length + 1;
    const screeningNumber = `NS-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;

    // Save record to database
    const screening = await noveltyRepository.create({
      screeningNumber,
      projectId: project._id,
      submittedBy: new mongoose.Types.ObjectId(userId),
      innovationTitle: data.innovationTitle.trim(),
      problem: data.problem.trim(),
      proposedSolution: data.proposedSolution.trim(),
      keyTechnicalFeatures: data.keyTechnicalFeatures,
      differentiation: data.differentiation.trim(),
      technologiesUsed: data.technologiesUsed,
      targetApplication: data.targetApplication.trim(),
      relatedResearch: data.relatedResearch || '',
      assessment,
      confidence,
      distinguishingFeatures,
      potentialOverlap,
      recommendedNextSteps,
      sourcesConsulted,
      questions,
      studentAcknowledged: false,
      status: 'COMPLETED',
      version,
      chatHistory: [
        {
          role: 'assistant',
          content: `ACRM IPR Research Assistant initialized preliminary screening #${version} for "${data.innovationTitle}".`,
          timestamp: new Date(),
        },
      ],
    });

    await auditLogRepository.log({
      userId,
      action: AuditAction.NOVELTY_SCREENING_COMPLETED,
      resourceType: 'NoveltyScreening',
      resourceId: screening._id.toString(),
      details: { screeningNumber, assessment, confidence },
    });

    return {
      ...screening.toObject(),
      screening,
      analysis: {
        assessment,
        confidence,
        distinguishingFeatures,
        similarAreas,
        potentialOverlap,
        recommendedNextSteps,
        sourcesConsulted,
        questions,
        disclaimer: this.LEGAL_DISCLAIMER,
      },
    };
  }

  /**
   * Interactive chatbot dialog: "ACRM IPR Research Assistant".
   * Challenges student submissions with probing technical questions.
   */
  async processAssistantMessage(
    userId: string,
    data: {
      projectId: string;
      screeningId?: string;
      message: string;
      innovationContext?: any;
    },
    userRole: UserRole = UserRole.STUDENT
  ): Promise<{ response: string; timestamp: Date }> {
    await verifyProjectAccess(data.projectId, userId, userRole, false);
    const userMsg = data.message.trim().toLowerCase();

    // Contextual challenging responses that push the user to detail technical distinctions
    let assistantReply = '';

    if (userMsg.includes('ui') || userMsg.includes('interface') || userMsg.includes('dashboard') || userMsg.includes('frontend')) {
      assistantReply =
        'A difference in user interface, layout, or cosmetic appearance is generally considered non-patentable subject matter. What underlying data pipeline, algorithm, or technical execution mechanism makes your system novel compared to existing implementations?';
    } else if (userMsg.includes('faster') || userMsg.includes('better') || userMsg.includes('efficient')) {
      assistantReply =
        'Claiming increased speed or efficiency requires concrete empirical evidence. By what specific computational mechanism or algorithmic reduction do you achieve this improvement? Have you conducted comparative benchmark trials?';
    } else if (userMsg.includes('combine') || userMsg.includes('integration') || userMsg.includes('integrated')) {
      assistantReply =
        'Combining known tools (e.g., standard React + FastAPI + ChromaDB) often faces obviousness objections unless the synergy produces unexpected technical results. What unexpected synergy occurs between these components in your design?';
    } else if (userMsg.length < 25) {
      assistantReply =
        'Please elaborate further on the technical mechanism. What specific component represents the primary inventive step that another researcher in this field could not easily deduce from existing literature?';
    } else {
      assistantReply =
        'Understood. How does this mechanism address prior-art limitations found in related academic publications? Ensure this distinction is documented in your technical disclosure before institutional submission.';
    }

    // Save in screening chatHistory if screening exists
    if (data.screeningId) {
      const screening = await noveltyRepository.findById(data.screeningId);
      if (screening) {
        const pId = screening.projectId?._id
          ? screening.projectId._id.toString()
          : screening.projectId?.toString();
        if (pId) {
          await verifyProjectAccess(pId, userId, userRole || UserRole.STUDENT, false);
        }

        screening.chatHistory.push({
          role: 'user',
          content: data.message,
          timestamp: new Date(),
        });
        screening.chatHistory.push({
          role: 'assistant',
          content: assistantReply,
          timestamp: new Date(),
        });
        await screening.save();
      }
    }

    return {
      response: assistantReply,
      timestamp: new Date(),
    };
  }

  /**
   * Student acknowledges preliminary novelty disclaimer before proceeding to IPR disclosure.
   */
  async acknowledgeScreening(
    screeningId: string,
    userId: string,
    userRole: UserRole = UserRole.STUDENT
  ): Promise<any> {
    const screening = await noveltyRepository.findById(screeningId);
    if (!screening) {
      throw new NotFoundError('Novelty screening record not found.');
    }

    const pId = screening.projectId?._id
      ? screening.projectId._id.toString()
      : screening.projectId?.toString();
    if (pId) {
      const access = await verifyProjectAccess(pId, userId, userRole, false);
      if (!access.isOwner && !access.isMember && !access.isAdmin) {
        throw new ForbiddenError(
          'Only project owners, team members, or administrators can acknowledge novelty screenings.'
        );
      }
    }

    screening.studentAcknowledged = true;
    screening.acknowledgedAt = new Date();
    await screening.save();

    return screening;
  }

  /**
   * Get screening history for project.
   */
  async getProjectScreenings(
    projectId: string,
    userId: string,
    userRole: UserRole = UserRole.STUDENT
  ): Promise<any[]> {
    await verifyProjectAccess(projectId, userId, userRole, false);
    return noveltyRepository.findByProject(projectId);
  }

  /**
   * Get specific screening details.
   */
  async getScreeningById(
    id: string,
    userId: string,
    userRole: UserRole = UserRole.STUDENT
  ): Promise<any> {
    const screening = await noveltyRepository.findById(id);
    if (!screening) {
      throw new NotFoundError('Novelty screening report not found.');
    }
    const pId = screening.projectId?._id
      ? screening.projectId._id.toString()
      : screening.projectId?.toString();
    if (pId) {
      await verifyProjectAccess(pId, userId, userRole, false);
    }
    return screening;
  }
}

export const noveltyService = new NoveltyService();
