import { connectDB, disconnectDB } from '../config/db.js';
import { hashPassword } from '../utils/password.js';
import { User } from '../models/User.js';
import { FacultyProfile } from '../models/FacultyProfile.js';
import { UserRole, FacultyDesignation } from '../config/constants.js';

interface FacultySeedItem {
  email: string;
  fullName: string;
  employeeId: string;
  designation: FacultyDesignation;
  department: string;
  experienceYears: number;
  areasOfExpertise: string[];
  currentResearchSummary: string;
  cabinLocation: string;
  maxActiveProjectsGuide?: number;
}

const FACULTY_SEEDS: FacultySeedItem[] = [
  {
    email: 'faculty@university.edu',
    fullName: 'Dr. Eleanor Vance',
    employeeId: 'FAC-CS-001',
    designation: FacultyDesignation.ASSOCIATE_PROFESSOR,
    department: 'Computer Science & Engineering',
    experienceYears: 12,
    areasOfExpertise: ['Artificial Intelligence', 'Autonomous Systems', 'Natural Language Processing'],
    currentResearchSummary: 'Investigating neuro-symbolic reasoning frameworks and reliable reinforcement learning in resource-constrained environments.',
    cabinLocation: 'Academic Block 3, Room 412',
    maxActiveProjectsGuide: 6,
  },
  {
    email: 'dr.marcus.vance@university.edu',
    fullName: 'Dr. Marcus Holloway',
    employeeId: 'FAC-CS-002',
    designation: FacultyDesignation.PROFESSOR,
    department: 'Computer Science & Engineering',
    experienceYears: 18,
    areasOfExpertise: ['Cybersecurity', 'Cryptographic Protocols', 'Zero Trust Networks'],
    currentResearchSummary: 'Developing post-quantum resilient identity management and automated threat containment for critical campus cyberinfrastructure.',
    cabinLocation: 'CS Department Building, Room 204',
    maxActiveProjectsGuide: 5,
  },
  {
    email: 'dr.maya.patel@university.edu',
    fullName: 'Dr. Maya Patel',
    employeeId: 'FAC-DS-001',
    designation: FacultyDesignation.ASSISTANT_PROFESSOR,
    department: 'Data Science & Artificial Intelligence',
    experienceYears: 7,
    areasOfExpertise: ['Computer Vision', 'Deep Learning', 'Healthcare Informatics'],
    currentResearchSummary: 'Multi-modal diagnostic imaging representations and domain adaptation in low-sample medical regimes.',
    cabinLocation: 'Research Complex B, Room 108',
    maxActiveProjectsGuide: 5,
  },
  {
    email: 'dr.samuel.wright@university.edu',
    fullName: 'Dr. Samuel Wright',
    employeeId: 'FAC-ECE-001',
    designation: FacultyDesignation.ASSOCIATE_PROFESSOR,
    department: 'Electronics & Communication Engineering',
    experienceYears: 14,
    areasOfExpertise: ['Internet of Things', 'Embedded Systems', 'Edge Computing'],
    currentResearchSummary: 'Low-power distributed sensor networks and edge intelligence for smart grid sustainability.',
    cabinLocation: 'Engineering Wing A, Room 315',
    maxActiveProjectsGuide: 5,
  },
  {
    email: 'dr.aisha.khan@university.edu',
    fullName: 'Dr. Aisha Khan',
    employeeId: 'FAC-SEC-001',
    designation: FacultyDesignation.ASSOCIATE_PROFESSOR,
    department: 'Cybersecurity & Information Security',
    experienceYears: 11,
    areasOfExpertise: ['Cloud Security', 'Applied Cryptography', 'Privacy-Preserving Computation'],
    currentResearchSummary: 'Differential privacy mechanisms for decentralized federated learning across multi-tenant academic clusters.',
    cabinLocation: 'Cyber Security Labs, Wing C, Room 102',
    maxActiveProjectsGuide: 5,
  },
  {
    email: 'dr.david.miller@university.edu',
    fullName: 'Dr. David Miller',
    employeeId: 'FAC-MECH-001',
    designation: FacultyDesignation.PROFESSOR,
    department: 'Mechanical Engineering',
    experienceYears: 16,
    areasOfExpertise: ['Robotics & Mechatronics', 'Computational Fluid Dynamics', 'Renewable Energy Systems'],
    currentResearchSummary: 'Bio-inspired autonomous locomotion and energy harvesting optimization in unmanned aerial vehicles.',
    cabinLocation: 'Mechanical Workshop Block, Room 210',
    maxActiveProjectsGuide: 5,
  },
  {
    email: 'dr.sarah.jenkins@university.edu',
    fullName: 'Dr. Sarah Jenkins',
    employeeId: 'FAC-BIO-001',
    designation: FacultyDesignation.ASSISTANT_PROFESSOR,
    department: 'Biotechnology & Bioinformatics',
    experienceYears: 8,
    areasOfExpertise: ['Computational Genomics', 'Structural Bioinformatics', 'Protein Folding Models'],
    currentResearchSummary: 'Deep generative architectures for de novo antimicrobial peptide design and target binding verification.',
    cabinLocation: 'Life Sciences Tower, Room 502',
    maxActiveProjectsGuide: 5,
  },
];

export async function seedFaculty(): Promise<void> {
  console.log('[SeedFaculty] Connecting to database...');
  await connectDB();

  try {
    const defaultPasswordHash = await hashPassword('Password123!');
    let createdCount = 0;
    let updatedCount = 0;

    for (const f of FACULTY_SEEDS) {
      let user = await User.findOne({ email: f.email });
      if (!user) {
        user = await User.create({
          email: f.email,
          passwordHash: defaultPasswordHash,
          fullName: f.fullName,
          role: UserRole.FACULTY,
          isActive: true,
          isEmailVerified: true,
          phone: '+1 (555) 012-3456',
        });
        createdCount++;
        console.log(`[SeedFaculty] Created user account: ${f.fullName} (${f.email})`);
      } else {
        let changed = false;
        if (user.role !== UserRole.FACULTY) {
          user.role = UserRole.FACULTY;
          changed = true;
        }
        if (!user.isActive) {
          user.isActive = true;
          changed = true;
        }
        if (changed) {
          await user.save();
          updatedCount++;
          console.log(`[SeedFaculty] Updated user role/status: ${f.fullName}`);
        }
      }

      // Check or create faculty profile
      let profile = await FacultyProfile.findOne({ userId: user._id });
      if (!profile) {
        profile = await FacultyProfile.findOne({ employeeId: f.employeeId });
      }

      if (!profile) {
        await FacultyProfile.create({
          userId: user._id,
          employeeId: f.employeeId,
          designation: f.designation,
          department: f.department,
          experienceYears: f.experienceYears,
          areasOfExpertise: f.areasOfExpertise,
          currentResearchSummary: f.currentResearchSummary,
          cabinLocation: f.cabinLocation,
          maxActiveProjectsGuide: f.maxActiveProjectsGuide || 5,
          currentActiveProjectsCount: 0,
          isAvailableForGuidance: true,
        });
        console.log(`[SeedFaculty] Created profile for: ${f.fullName} [${f.department}]`);
      } else {
        // Ensure profile is available and linked to the correct user
        let profileChanged = false;
        if (!profile.userId || profile.userId.toString() !== user._id.toString()) {
          profile.userId = user._id;
          profileChanged = true;
        }
        if (!profile.isAvailableForGuidance) {
          profile.isAvailableForGuidance = true;
          profileChanged = true;
        }
        if (profile.department !== f.department) {
          profile.department = f.department;
          profileChanged = true;
        }
        if (profileChanged) {
          await profile.save();
          console.log(`[SeedFaculty] Updated profile availability: ${f.fullName}`);
        }
      }
    }

    // Print summary of registered faculty in database
    const allProfiles = await FacultyProfile.find().populate('userId', 'email fullName isActive role');
    console.log(`\n================ FACULTY DIRECTORY SUMMARY ================`);
    console.log(`Total Faculty in Database: ${allProfiles.length}`);
    for (const p of allProfiles) {
      const u = p.userId as any;
      console.log(` • ${u?.fullName || 'N/A'} (${u?.email}) | Dept: ${p.department} | Role: ${u?.role} | Active: ${u?.isActive} | Available: ${p.isAvailableForGuidance}`);
    }
    console.log(`===========================================================\n`);
  } catch (err) {
    console.error('[SeedFaculty] Error during seeding:', err);
    throw err;
  } finally {
    await disconnectDB();
  }
}

// Auto-run when executed directly
if (process.argv[1]?.includes('seedFaculty')) {
  seedFaculty()
    .then(() => {
      console.log('[SeedFaculty] Seeding completed successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[SeedFaculty] Execution failed:', err);
      process.exit(1);
    });
}
