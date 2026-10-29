import { projectRepository } from '../repositories/ProjectRepository.js';
import { UserRole } from '../config/constants.js';
import { ForbiddenError, NotFoundError } from '../errors/AppError.js';
import { IProject } from '../models/Project.js';

export interface ProjectAccessResult {
  project: IProject;
  isOwner: boolean;
  isMember: boolean;
  isGuide: boolean;
  isAdmin: boolean;
  members: any[];
  guides: any[];
}

/**
 * Validates whether the authenticated user has rights to access or edit a project and its confidential data.
 */
export async function verifyProjectAccess(
  projectId: string,
  userId: string,
  userRole: UserRole,
  requireEdit: boolean = false
): Promise<ProjectAccessResult> {
  const project = await projectRepository.findById(projectId);
  if (!project) {
    throw new NotFoundError('Project not found.');
  }

  const members = await projectRepository.getMembers(projectId);
  const guides = await projectRepository.getGuides(projectId);

  const isOwner =
    !!project.ownerId &&
    ((project.ownerId as any)._id?.toString() === userId || project.ownerId.toString() === userId);

  const isMember = members.some((m) => {
    const studentId = (m.studentId as any)?._id?.toString() || m.studentId?.toString();
    return studentId === userId && m.status === 'ACCEPTED';
  });

  const isGuide = guides.some((g) => {
    const facultyId = (g.facultyId as any)?._id?.toString() || g.facultyId?.toString();
    return facultyId === userId && (g.status === 'ACCEPTED' || g.status === 'REQUESTED');
  });

  const isAdmin = userRole === UserRole.ADMIN;

  if (requireEdit) {
    if (!isOwner && !isMember && !isGuide && !isAdmin) {
      throw new ForbiddenError('You do not have permission to modify this project or its deliverables.');
    }
  } else {
    if (!project.isPublic && !isOwner && !isMember && !isGuide && !isAdmin) {
      throw new ForbiddenError('You do not have permission to access this private project.');
    }
  }

  return { project, isOwner, isMember, isGuide, isAdmin, members, guides };
}
