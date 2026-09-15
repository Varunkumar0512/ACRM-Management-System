import { facultyProfileRepository } from '../repositories/FacultyProfileRepository.js';
import { projectRepository } from '../repositories/ProjectRepository.js';
import { UserRole } from '../config/constants.js';

export class FacultyService {
  async listFaculty(department?: string, availableOnly = false) {
    const filter: Record<string, unknown> = {};
    if (department) filter.department = department;
    if (availableOnly) filter.isAvailableForGuidance = true;

    return facultyProfileRepository.list(filter, 0, 100);
  }

  async getFacultyDashboard(facultyUserId: string) {
    const [assignedProjects, profile] = await Promise.all([
      projectRepository.findAssignedProjectsForFaculty(facultyUserId),
      facultyProfileRepository.findByUserId(facultyUserId),
    ]);

    // Partition projects by guide status
    const pendingRequests = assignedProjects.filter((ap) => ap.status === 'REQUESTED');
    const activeProjects = assignedProjects.filter((ap) => ap.status === 'ACCEPTED');

    return {
      profile,
      stats: {
        activeGuidedProjects: activeProjects.length,
        pendingRequestsCount: pendingRequests.length,
        capacityLimit: profile?.maxActiveProjectsGuide || 5,
        availableSlots: Math.max(0, (profile?.maxActiveProjectsGuide || 5) - activeProjects.length),
      },
      pendingRequests,
      activeProjects,
    };
  }
}

export const facultyService = new FacultyService();
