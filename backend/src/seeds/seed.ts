import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';
import { hashPassword } from '../utils/password.js';
import {
  User,
  StudentProfile,
  FacultyProfile,
  ResearchDomain,
  ResearchTopic,
  ResearchPaper,
  ProjectIdea,
  Project,
  ProjectMember,
  ProjectGuide,
  Milestone,
  DocumentModel,
  Comment,
  Review,
  Notification,
  SupportTicket,
  AuditLog,
} from '../models/index.js';
import {
  UserRole,
  FacultyDesignation,
  ProjectStatus,
  MilestoneStatus,
  ReviewDecision,
  GuideRole,
  GuideRequestStatus,
  DocumentType,
  DocumentStatus,
  NotificationType,
  SupportCategory,
  SupportPriority,
  SupportStatus,
  AuditAction,
} from '../config/constants.js';

async function seed() {
  console.log('[Seed] Connecting to database...');
  await connectDB();

  console.log('[Seed] Clearing existing collections...');
  await Promise.all([
    User.deleteMany({}),
    StudentProfile.deleteMany({}),
    FacultyProfile.deleteMany({}),
    ResearchDomain.deleteMany({}),
    ResearchTopic.deleteMany({}),
    ResearchPaper.deleteMany({}),
    ProjectIdea.deleteMany({}),
    Project.deleteMany({}),
    ProjectMember.deleteMany({}),
    ProjectGuide.deleteMany({}),
    Milestone.deleteMany({}),
    DocumentModel.deleteMany({}),
    Comment.deleteMany({}),
    Review.deleteMany({}),
    Notification.deleteMany({}),
    SupportTicket.deleteMany({}),
    AuditLog.deleteMany({}),
  ]);

  console.log('[Seed] Creating Administrator...');
  const adminPasswordHash = await hashPassword('AdminSecret123!');
  const adminUser = await User.create({
    email: 'admin@university.edu',
    passwordHash: adminPasswordHash,
    fullName: 'Dr. Arthur Sterling',
    role: UserRole.ADMIN,
    isActive: true,
    isEmailVerified: true,
    phone: '+1 (555) 019-2831',
  });

  console.log('[Seed] Creating Faculty Members...');
  const facultyPasswordHash = await hashPassword('Password123!');

  const facultyData = [
    {
      email: 'faculty@university.edu',
      fullName: 'Dr. Eleanor Vance',
      designation: FacultyDesignation.ASSOCIATE_PROFESSOR,
      department: 'Computer Science & Engineering',
      experienceYears: 12,
      areasOfExpertise: ['Artificial Intelligence', 'Autonomous Systems', 'Natural Language Processing'],
      currentResearchSummary: 'Investigating neuro-symbolic reasoning frameworks and reliable reinforcement learning in resource-constrained environments.',
      maxActiveProjectsGuide: 6,
      currentActiveProjectsCount: 2,
      isAvailableForGuidance: true,
      cabinLocation: 'Academic Block 3, Room 412',
      googleScholarUrl: 'https://scholar.google.com/citations?user=demo1',
    },
    {
      email: 'dr.marcus.vance@university.edu',
      fullName: 'Dr. Marcus Holloway',
      designation: FacultyDesignation.PROFESSOR,
      department: 'Computer Science & Engineering',
      experienceYears: 18,
      areasOfExpertise: ['Cybersecurity', 'Cryptographic Protocols', 'Zero Trust Networks'],
      currentResearchSummary: 'Developing post-quantum resilient identity management and automated threat containment for critical campus cyberinfrastructure.',
      maxActiveProjectsGuide: 5,
      currentActiveProjectsCount: 1,
      isAvailableForGuidance: true,
      cabinLocation: 'CS Department Building, Room 204',
      googleScholarUrl: 'https://scholar.google.com/citations?user=demo2',
    },
    {
      email: 'dr.maya.patel@university.edu',
      fullName: 'Dr. Maya Patel',
      designation: FacultyDesignation.ASSISTANT_PROFESSOR,
      department: 'Data Science & Artificial Intelligence',
      experienceYears: 7,
      areasOfExpertise: ['Computer Vision', 'Deep Learning', 'Healthcare Informatics'],
      currentResearchSummary: 'Multi-modal diagnostic imaging representations and domain adaptation in low-sample medical regimes.',
      maxActiveProjectsGuide: 4,
      currentActiveProjectsCount: 1,
      isAvailableForGuidance: true,
      cabinLocation: 'Research Complex B, Room 108',
      googleScholarUrl: 'https://scholar.google.com/citations?user=demo3',
    },
    {
      email: 'dr.samuel.wright@university.edu',
      fullName: 'Dr. Samuel Wright',
      designation: FacultyDesignation.ASSOCIATE_PROFESSOR,
      department: 'Electronics & Communication Engineering',
      experienceYears: 14,
      areasOfExpertise: ['Internet of Things', 'Embedded Systems', 'Edge Computing'],
      currentResearchSummary: 'Low-power distributed sensor networks and edge intelligence for smart grid sustainability.',
      maxActiveProjectsGuide: 5,
      currentActiveProjectsCount: 1,
      isAvailableForGuidance: true,
      cabinLocation: 'Engineering Wing A, Room 315',
      googleScholarUrl: 'https://scholar.google.com/citations?user=demo4',
    },
  ];

  const facultyUsers = [];
  for (let i = 0; i < facultyData.length; i++) {
    const f = facultyData[i];
    const user = await User.create({
      email: f.email,
      passwordHash: facultyPasswordHash,
      fullName: f.fullName,
      role: UserRole.FACULTY,
      isActive: true,
      isEmailVerified: true,
    });

    await FacultyProfile.create({
      userId: user._id,
      employeeId: `FAC-202${i + 1}-0${i + 7}`,
      designation: f.designation,
      department: f.department,
      experienceYears: f.experienceYears,
      areasOfExpertise: f.areasOfExpertise,
      currentResearchSummary: f.currentResearchSummary,
      maxActiveProjectsGuide: f.maxActiveProjectsGuide,
      currentActiveProjectsCount: f.currentActiveProjectsCount,
      isAvailableForGuidance: f.isAvailableForGuidance,
      cabinLocation: f.cabinLocation,
      googleScholarUrl: f.googleScholarUrl,
    });

    facultyUsers.push(user);
  }

  console.log('[Seed] Creating Students...');
  const studentPasswordHash = await hashPassword('Password123!');
  const studentsData = [
    {
      email: 'student@university.edu',
      fullName: 'Alex Rivera',
      studentId: 'ACR-2024-CS-042',
      department: 'Computer Science & Engineering',
      program: 'Bachelor of Technology in CS',
      yearOfStudy: 4,
      cgpa: 8.92,
      researchInterests: ['Artificial Intelligence', 'Natural Language Processing', 'Campus Assistants'],
      bio: 'Final year undergraduate exploring transformer architectures, semantic indexing, and automated campus workflow integrations.',
    },
    {
      email: 'priya.sharma@university.edu',
      fullName: 'Priya Sharma',
      studentId: 'ACR-2024-CS-088',
      department: 'Computer Science & Engineering',
      program: 'Bachelor of Technology in CS',
      yearOfStudy: 4,
      cgpa: 9.15,
      researchInterests: ['Distributed Systems', 'Cloud Computing', 'Database Internals'],
      bio: 'Passionate about high-throughput distributed database engines and fault-tolerant consensus mechanisms.',
    },
    {
      email: 'marcus.chen@university.edu',
      fullName: 'Marcus Chen',
      studentId: 'ACR-2024-DS-015',
      department: 'Data Science & Artificial Intelligence',
      program: 'Bachelor of Science in Data Science',
      yearOfStudy: 3,
      cgpa: 8.65,
      researchInterests: ['Machine Learning', 'Predictive Analytics', 'Educational Technology'],
      bio: 'Working on student performance analytics models and early intervention mechanisms.',
    },
    {
      email: 'sofia.rodriguez@university.edu',
      fullName: 'Sofia Rodriguez',
      studentId: 'ACR-2024-EC-029',
      department: 'Electronics & Communication Engineering',
      program: 'Bachelor of Technology in ECE',
      yearOfStudy: 4,
      cgpa: 8.78,
      researchInterests: ['Internet of Things', 'Smart Campus', 'Sensor Networks'],
      bio: 'Specializing in edge telemetry, smart power meters, and wireless sensor networking.',
    },
    {
      email: 'liam.oconnor@university.edu',
      fullName: 'Liam O\'Connor',
      studentId: 'ACR-2024-CY-011',
      department: 'Cybersecurity & Information Security',
      program: 'Bachelor of Technology in Cybersecurity',
      yearOfStudy: 3,
      cgpa: 8.45,
      researchInterests: ['Cybersecurity', 'Intrusion Detection', 'Phishing Detection'],
      bio: 'Enthusiastic about zero-trust security architectures and automated packet analysis.',
    },
  ];

  const studentUsers = [];
  for (const s of studentsData) {
    const user = await User.create({
      email: s.email,
      passwordHash: studentPasswordHash,
      fullName: s.fullName,
      role: UserRole.STUDENT,
      isActive: true,
      isEmailVerified: true,
    });

    await StudentProfile.create({
      userId: user._id,
      studentId: s.studentId,
      department: s.department,
      program: s.program,
      yearOfStudy: s.yearOfStudy,
      cgpa: s.cgpa,
      researchInterests: s.researchInterests,
      bio: s.bio,
    });

    studentUsers.push(user);
  }

  console.log('[Seed] Creating 18 Research Domains...');
  const domainSpecs = [
    { name: 'Artificial Intelligence & Machine Learning', slug: 'ai-ml', icon: 'Brain', description: 'Foundational and applied machine learning, deep neural representations, and probabilistic inference algorithms.' },
    { name: 'Data Science & Analytics', slug: 'data-science', icon: 'BarChart2', description: 'Large-scale data processing, statistical modeling, predictive algorithms, and empirical business intelligence.' },
    { name: 'Web & Mobile Development', slug: 'web-mobile', icon: 'Globe', description: 'Modern distributed web platforms, reactive frontend systems, micro-frontends, and mobile computing.' },
    { name: 'Internet of Things', slug: 'iot', icon: 'Cpu', description: 'Connected sensor networks, embedded device telemetry, low-power protocols, and environmental sensing.' },
    { name: 'Cybersecurity', slug: 'cybersecurity', icon: 'Shield', description: 'Network defense, threat vulnerability analysis, identity protocols, malware detection, and zero-trust engineering.' },
    { name: 'Cloud Computing', slug: 'cloud-computing', icon: 'Cloud', description: 'Serverless architectures, container orchestration, distributed storage, and multi-tenant virtualization.' },
    { name: 'Blockchain', slug: 'blockchain', icon: 'Layers', description: 'Decentralized ledgers, smart contract formal verification, consensus algorithms, and tokenomics.' },
    { name: 'Robotics & Automation', slug: 'robotics', icon: 'Activity', description: 'Kinematic control systems, autonomous navigation, robotic perception, and industrial cyber-physical systems.' },
    { name: 'Computer Vision', slug: 'computer-vision', icon: 'Eye', description: 'Visual pattern recognition, object detection, video comprehension, and 3D scene reconstruction.' },
    { name: 'Natural Language Processing', slug: 'nlp', icon: 'MessageSquare', description: 'Computational linguistics, large language model alignment, semantic search, and document summarization.' },
    { name: 'Embedded Systems', slug: 'embedded-systems', icon: 'HardDrive', description: 'Microcontroller firmware, real-time operating systems (RTOS), and hardware-software co-design.' },
    { name: 'VLSI & Semiconductor Technology', slug: 'vlsi', icon: 'Zap', description: 'Integrated circuit design, FPGA synthesis, low-power CMOS logic, and physical layout optimization.' },
    { name: 'Renewable Energy & Sustainability', slug: 'renewable-energy', icon: 'Sun', description: 'Smart microgrids, solar inverter efficiency, energy storage optimization, and campus carbon accounting.' },
    { name: 'Healthcare Technology', slug: 'healthcare-tech', icon: 'Heart', description: 'Clinical decision support systems, biomedical telemetry, health informatics, and physiological modeling.' },
    { name: 'Agricultural Technology', slug: 'agritech', icon: 'Feather', description: 'Precision agriculture, automated irrigation sensing, drone crop monitoring, and yield prediction.' },
    { name: 'Smart Campus & Smart Cities', slug: 'smart-campus', icon: 'MapPin', description: 'Intelligent campus facilities, automated transit, occupancy tracking, and resource efficiency platforms.' },
    { name: 'Educational Technology', slug: 'edtech', icon: 'BookOpen', description: 'Adaptive learning platforms, student engagement metrics, automated evaluation, and peer review systems.' },
    { name: 'Communication & Networking', slug: 'networking', icon: 'Share2', description: '5G/6G wireless networks, software-defined networking (SDN), optical switching, and packet queuing.' },
  ];

  const domainDocs: Record<string, any> = {};
  for (let i = 0; i < domainSpecs.length; i++) {
    const spec = domainSpecs[i];
    const doc = await ResearchDomain.create({
      name: spec.name,
      slug: spec.slug,
      icon: spec.icon,
      description: spec.description,
      orderIndex: i + 1,
      isActive: true,
    });
    domainDocs[spec.slug] = doc;
  }

  console.log('[Seed] Creating Research Topics...');
  const topicSpecs = [
    { title: 'Generative Retrieval & Dense Semantic Search', domainSlug: 'nlp', keywords: ['Vector Embeddings', 'RAG', 'Semantic Search', 'Transformers'], trendingScore: 94, description: 'Techniques for end-to-end differentiable index-free neural document retrieval using dense bi-encoders and generative indexing.' },
    { title: 'Zero-Trust Architecture for Distributed Academic Networks', domainSlug: 'cybersecurity', keywords: ['Zero Trust', 'Micro-segmentation', 'Identity Federation', 'mTLS'], trendingScore: 88, description: 'Design paradigms and authentication handshakes preventing unauthorized lateral movement within heterogeneous campus networks.' },
    { title: 'Self-Supervised Representation in Clinical Imaging', domainSlug: 'healthcare-tech', keywords: ['Self-Supervised Learning', 'Chest X-Ray', 'Contrastive Learning', 'Medical Imaging'], trendingScore: 91, description: 'Leveraging unlabeled clinical scans with contrastive multi-view loss to bootstrap downstream pathology classification models.' },
    { title: 'Edge-Assisted IoT Power Metering and Predictive Peak Load', domainSlug: 'smart-campus', keywords: ['Edge Computing', 'Smart Meter', 'Peak Load Shaving', 'Time-Series Analysis'], trendingScore: 82, description: 'Deploying low-cost microcontrollers with embedded lightweight recurrent models to anticipate electrical surges across institutional laboratories.' },
    { title: 'Federated Learning under Non-IID Student Data Distributions', domainSlug: 'ai-ml', keywords: ['Federated Learning', 'Differential Privacy', 'Non-IID', 'Decentralized AI'], trendingScore: 95, description: 'Collaborative model training mechanisms that preserve learner privacy while adapting to extreme variance in student institutional interaction patterns.' },
    { title: 'Automated Code Vulnerability Discovery via LLM Attention Probing', domainSlug: 'cybersecurity', keywords: ['Static Analysis', 'LLM', 'Code Security', 'Vulnerability Detection'], trendingScore: 89, description: 'Examining internal attention weights within transformer code models to isolate SQL injection, buffer overflows, and privilege escalations.' },
  ];

  for (const t of topicSpecs) {
    const domain = domainDocs[t.domainSlug];
    if (domain) {
      await ResearchTopic.create({
        title: t.title,
        slug: t.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        domainId: domain._id,
        description: t.description,
        keywords: t.keywords,
        trendingScore: t.trendingScore,
        subtopics: [t.keywords[0], t.keywords[1]],
      });
    }
  }

  console.log('[Seed] Creating 20+ Research Papers...');
  const papersData = [
    {
      title: 'Dense Passage Retrieval for Open-Domain Academic Knowledge Discovery',
      authors: ['Dr. Eleanor Vance', 'Alex Rivera', 'Dr. Aris Thorne'],
      domainSlug: 'nlp',
      department: 'Computer Science & Engineering',
      venue: 'IEEE Transactions on Knowledge & Data Engineering, Vol 36',
      publicationDate: new Date('2024-03-15'),
      doi: '10.1109/TKDE.2024.1049281',
      citationsCount: 142,
      savedCount: 38,
      keywords: ['Dense Retrieval', 'Dual Encoders', 'Academic Search', 'Information Extraction'],
      tags: ['NLP', 'Information Retrieval', 'Vector Search'],
      abstract: 'Open-domain question answering relies on efficient passage retrieval to identify candidate spans from millions of university documents. We introduce a dual-encoder dense retrieval framework evaluated against university research databases, demonstrating a 19.4% improvement in top-20 recall over classical BM25.',
    },
    {
      title: 'CampusAssist: An Autonomous Multi-Agent Framework for University Workflow Automation',
      authors: ['Alex Rivera', 'Dr. Eleanor Vance', 'Priya Sharma'],
      domainSlug: 'ai-ml',
      department: 'Computer Science & Engineering',
      venue: 'ACM Conference on Computer Supported Cooperative Work (CSCW 2024)',
      publicationDate: new Date('2024-06-20'),
      doi: '10.1145/3613904.3642190',
      citationsCount: 67,
      savedCount: 52,
      keywords: ['Multi-Agent Systems', 'Workflow Automation', 'LLM Agents', 'Campus ERP'],
      tags: ['Multi-Agent', 'LLMs', 'Automation'],
      abstract: 'Navigating institutional bureaucracies represents a substantial barrier to undergraduate research efficiency. CampusAssist demonstrates a decentralized multi-agent system coordinating departmental approvals, mentor notifications, and milestone tracking with 94.2% completion reliability.',
    },
    {
      title: 'Zero-Trust Telemetry and Micro-Segmentation for Multi-Tenant Academic Clouds',
      authors: ['Dr. Marcus Holloway', 'Liam O\'Connor'],
      domainSlug: 'cybersecurity',
      department: 'Cybersecurity & Information Security',
      venue: 'USENIX Security Symposium 2024',
      publicationDate: new Date('2024-08-12'),
      doi: '10.5555/3649210.3649288',
      citationsCount: 89,
      savedCount: 44,
      keywords: ['Zero Trust', 'Micro-segmentation', 'Network Security', 'eBPF'],
      tags: ['Security', 'Cloud', 'Zero-Trust'],
      abstract: 'University server clusters maintain heterogeneous permission topologies across students, faculty, and outside collaborators. We evaluate an eBPF-driven zero-trust kernel monitoring module that enforces dynamic mutual TLS and packet validation with sub-microsecond overhead.',
    },
    {
      title: 'Self-Supervised Multi-Scale Contrastive Learning for Early Pathology Triage',
      authors: ['Dr. Maya Patel', 'Marcus Chen'],
      domainSlug: 'healthcare-tech',
      department: 'Data Science & Artificial Intelligence',
      venue: 'Nature Digital Medicine, Vol 7',
      publicationDate: new Date('2023-11-04'),
      doi: '10.1038/s41746-023-00941-8',
      citationsCount: 215,
      savedCount: 63,
      keywords: ['Self-Supervised Learning', 'Chest Radiography', 'Medical Diagnostics'],
      tags: ['Healthcare', 'Computer Vision', 'Deep Learning'],
      abstract: 'Label scarcity impedes the deployment of deep computer vision diagnostics in low-resource clinics. We propose a hierarchical patch-contrastive objective that yields robust representations without human annotation, exceeding supervised baselines by 4.2% AUC.',
    },
    {
      title: 'Real-Time Edge Energy Disaggregation and Peak Shaving in Smart University Campuses',
      authors: ['Sofia Rodriguez', 'Dr. Samuel Wright'],
      domainSlug: 'smart-campus',
      department: 'Electronics & Communication Engineering',
      venue: 'IEEE Internet of Things Journal, Vol 11',
      publicationDate: new Date('2024-02-18'),
      doi: '10.1109/JIOT.2024.3361890',
      citationsCount: 53,
      savedCount: 29,
      keywords: ['Non-Intrusive Load Monitoring', 'Edge AI', 'Smart Grid', 'Sustainability'],
      tags: ['IoT', 'Smart Campus', 'Energy'],
      abstract: 'Deploying deep convolutional neural networks onto ESP32 microcontrollers enables non-intrusive load monitoring directly on distribution panels. Our 8-month trial across four campus residence halls reduced peak load charges by 18.3%.',
    },
    {
      title: 'Predicting Undergraduate Academic Attrition via Temporal Graph Attention Networks',
      authors: ['Marcus Chen', 'Dr. Maya Patel'],
      domainSlug: 'edtech',
      department: 'Data Science & Artificial Intelligence',
      venue: 'Educational Data Mining (EDM 2024)',
      publicationDate: new Date('2024-07-02'),
      doi: '10.5281/zenodo.1084291',
      citationsCount: 38,
      savedCount: 41,
      keywords: ['Graph Attention Networks', 'Student Retention', 'Early Warning Systems'],
      tags: ['EdTech', 'Graph Neural Networks', 'Analytics'],
      abstract: 'Early detection of at-risk students allows academic counselors to stage targeted interventions. We model institutional LMS interaction logs as temporal bipartite student-course graphs, achieving 0.91 precision in predicting course withdrawal 4 weeks prior to midterms.',
    },
  ];

  const createdPapers = [];
  for (const p of papersData) {
    const domain = domainDocs[p.domainSlug] || domainDocs['ai-ml'];
    const paper = await ResearchPaper.create({
      title: p.title,
      authors: p.authors,
      domainId: domain._id,
      department: p.department,
      venue: p.venue,
      publicationDate: p.publicationDate,
      doi: p.doi,
      citationsCount: p.citationsCount,
      savedCount: p.savedCount,
      keywords: p.keywords,
      tags: p.tags,
      abstract: p.abstract,
      externalUrl: `https://doi.org/${p.doi}`,
    });
    createdPapers.push(paper);
  }

  console.log('[Seed] Creating Curated Project Ideas...');
  const ideaSpecs = [
    {
      title: 'Campus Research Assistant with Semantic RAG Pipeline',
      domainSlug: 'ai-ml',
      difficulty: 'INTERMEDIATE',
      problemStatement: 'University students and faculty face considerable difficulty locating relevant departmental theses, past capstone projects, and available laboratory equipment due to disparate PDF archives and fragmented file servers.',
      objectives: [
        'Build a vector indexing pipeline for historical campus project reports',
        'Implement hybrid dense/sparse search using LangChain or LlamaIndex',
        'Deploy a conversational citation interface with hallucination verification',
      ],
      technologies: ['Python', 'FastAPI', 'ChromaDB', 'React', 'TypeScript', 'LangChain'],
      expectedOutcome: 'A deployable intranet application allowing students to search over 5,000 campus research documents with verified source highlights.',
      prerequisites: ['Basic machine learning knowledge', 'Familiarity with vector embeddings and REST APIs'],
      tags: ['RAG', 'Vector Search', 'NLP', 'Student Assistant'],
    },
    {
      title: 'Automated Smart Parking & EV Charging Management for Campus Commuters',
      domainSlug: 'smart-campus',
      difficulty: 'BEGINNER',
      problemStatement: 'Campus parking facilities suffer from congested morning queues, unmonitored permit abuse, and inefficient queueing for electric vehicle charging terminals.',
      objectives: [
        'Deploy ultrasonic and camera sensors for bay occupancy detection',
        'Provide a live mobile dashboard indicating available bays in real time',
        'Implement an algorithmic queue reservation system for EV chargers',
      ],
      technologies: ['Node.js', 'Express', 'React', 'MQTT', 'ESP32', 'PostgreSQL'],
      expectedOutcome: 'A real-time telemetry portal and mobile responsive UI reducing parking search time by an estimated 60%.',
      prerequisites: ['Fundamental web development', 'Basic microcontroller interfacing'],
      tags: ['IoT', 'Smart Campus', 'Sensors'],
    },
    {
      title: 'Phishing Detection via Domain Reputation Graph & Email Header Analysis',
      domainSlug: 'cybersecurity',
      difficulty: 'ADVANCED',
      problemStatement: 'Spear-phishing campaigns targeting institutional credentials and payroll accounts are increasingly sophisticated, routinely bypassing standard spam filters.',
      objectives: [
        'Extract and parse RFC 5322 headers, DKIM, SPF, and DMARC verifications',
        'Construct a domain reputation graph leveraging DNS passive telemetry',
        'Train an ensemble classifier detecting malicious intent in email text and URLs',
      ],
      technologies: ['Python', 'Scikit-Learn', 'Neo4j', 'FastAPI', 'Docker'],
      expectedOutcome: 'An enterprise mail gateway plugin capable of intercepting deceptive emails with under 0.1% false-positive rate.',
      prerequisites: ['Cybersecurity foundations', 'Graph theory and machine learning classification'],
      tags: ['Security', 'Machine Learning', 'Threat Intelligence'],
    },
  ];

  for (const idea of ideaSpecs) {
    const domain = domainDocs[idea.domainSlug] || domainDocs['ai-ml'];
    await ProjectIdea.create({
      title: idea.title,
      slug: idea.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      domainId: domain._id,
      difficulty: idea.difficulty as any,
      problemStatement: idea.problemStatement,
      objectives: idea.objectives,
      technologies: idea.technologies,
      expectedOutcome: idea.expectedOutcome,
      prerequisites: idea.prerequisites,
      tags: idea.tags,
      isCurated: true,
      addedBy: facultyUsers[0]._id,
      savedCount: 14,
    });
  }

  console.log('[Seed] Creating Realistic Projects with Milestones, Reviews, and Faculty Comments...');

  // Project 1: AI-Based Campus Assistant (In Progress, Guided by Eleanor Vance)
  const studentAlex = studentUsers[0];
  const facultyEleanor = facultyUsers[0];

  const project1 = await Project.create({
    code: 'PRJ-2025-001',
    title: 'Autonomous Campus Research Knowledge Assistant (ACR-Agent)',
    domainId: domainDocs['ai-ml']._id,
    department: 'Computer Science & Engineering',
    problemStatement: 'Undergraduate researchers spend up to 40% of their initial semester parsing unstandardized project repositories and identifying faculty mentors with matching laboratory bandwidth. This project designs a localized neuro-symbolic assistant automating literature synthesis and mentor alignment.',
    objectives: [
      'Construct a localized vector and graph knowledge base from 10,000 university publications',
      'Implement multi-agent retrieval with verified provenance links',
      'Integrate real-time faculty bandwidth verification to prevent mentor overload',
    ],
    technologies: ['React', 'TypeScript', 'Node.js', 'Python', 'FastAPI', 'MongoDB', 'ChromaDB'],
    status: ProjectStatus.IN_PROGRESS,
    progressPercentage: 68,
    ownerId: studentAlex._id,
    startDate: new Date('2024-09-01'),
    expectedCompletionDate: new Date('2025-05-30'),
    repositoryUrl: 'https://github.com/acr-org/acr-knowledge-agent',
    isPublic: true,
  });

  // Members
  await ProjectMember.create({
    projectId: project1._id,
    studentId: studentAlex._id,
    role: 'OWNER',
    status: 'ACCEPTED',
    joinedAt: new Date('2024-09-01'),
    invitedBy: studentAlex._id,
  });

  await ProjectMember.create({
    projectId: project1._id,
    studentId: studentUsers[1]._id, // Priya Sharma
    role: 'MEMBER',
    status: 'ACCEPTED',
    joinedAt: new Date('2024-09-03'),
    invitedBy: studentAlex._id,
  });

  // Primary Faculty Guide: Dr. Eleanor Vance (Associate Professor)
  await ProjectGuide.create({
    projectId: project1._id,
    facultyId: facultyEleanor._id,
    role: GuideRole.PRIMARY_GUIDE,
    status: GuideRequestStatus.ACCEPTED,
    requestedAt: new Date('2024-09-02'),
    respondedAt: new Date('2024-09-03'),
    notes: 'Approved guidance request. Project aligns directly with departmental neuro-symbolic research initiatives.',
  });

  // Milestones for Project 1
  const m1 = await Milestone.create({
    projectId: project1._id,
    title: 'Literature Survey & State-of-the-Art Analysis',
    description: 'Survey dense retrieval methods, bi-encoder benchmarks, and privacy-preserving retrieval architectures.',
    orderIndex: 1,
    dueDate: new Date('2024-10-15'),
    completionDate: new Date('2024-10-12'),
    status: MilestoneStatus.COMPLETED,
    assignedMemberIds: [studentAlex._id],
    weight: 2,
  });

  const m2 = await Milestone.create({
    projectId: project1._id,
    title: 'Problem Definition & System Design Specification',
    description: 'Draft software architecture diagrams, data schemas, API contracts, and vector database clustering plans.',
    orderIndex: 2,
    dueDate: new Date('2024-11-30'),
    completionDate: new Date('2024-11-28'),
    status: MilestoneStatus.COMPLETED,
    assignedMemberIds: [studentAlex._id, studentUsers[1]._id],
    weight: 2,
  });

  const m3 = await Milestone.create({
    projectId: project1._id,
    title: 'Core Indexing Pipeline & Microservices Implementation',
    description: 'Implement document chunking, embedding generation, FastAPI retrieval microservice, and Express orchestration.',
    orderIndex: 3,
    dueDate: new Date('2025-02-15'),
    status: MilestoneStatus.IN_PROGRESS,
    assignedMemberIds: [studentAlex._id, studentUsers[1]._id],
    weight: 3,
  });

  const m4 = await Milestone.create({
    projectId: project1._id,
    title: 'Experimental Validation, Precision Benchmarks & User Studies',
    description: 'Conduct empirical evaluations against student cohorts; measure recall, response latency, and user satisfaction.',
    orderIndex: 4,
    dueDate: new Date('2025-04-10'),
    status: MilestoneStatus.NOT_STARTED,
    assignedMemberIds: [studentAlex._id],
    weight: 2,
  });

  const m5 = await Milestone.create({
    projectId: project1._id,
    title: 'Final Thesis Documentation & Defense Presentation',
    description: 'Final submission of project documentation, IEEE formatted paper, and presentation to academic review panel.',
    orderIndex: 5,
    dueDate: new Date('2025-05-15'),
    status: MilestoneStatus.NOT_STARTED,
    assignedMemberIds: [studentAlex._id, studentUsers[1]._id],
    weight: 3,
  });

  // Documents
  const doc1 = await DocumentModel.create({
    projectId: project1._id,
    milestoneId: m1._id,
    filename: 'literature_survey_rev2.pdf',
    originalName: 'Literature_Survey_Dense_Retrieval.pdf',
    type: DocumentType.LITERATURE_SURVEY,
    fileSize: 1024 * 1024 * 2.4, // 2.4 MB
    mimeType: 'application/pdf',
    storagePath: '/uploads/documents/literature_survey_rev2.pdf',
    version: 2,
    uploadedBy: studentAlex._id,
    status: DocumentStatus.APPROVED,
    description: 'Revised literature survey incorporating recent 2024 benchmark papers on vector retrieval.',
  });

  // Comments (Authentic Academic Exchange between Associate Professor and Student)
  const comment1 = await Comment.create({
    projectId: project1._id,
    authorId: facultyEleanor._id,
    content: 'Please strengthen the literature survey with recent 2024 research papers on dense retrieval and hybrid search architectures.',
    referencedMilestoneId: m1._id,
    referencedDocumentId: doc1._id,
    status: 'RESOLVED',
    resolvedBy: facultyEleanor._id,
    resolvedAt: new Date('2024-10-14'),
  });

  await Comment.create({
    projectId: project1._id,
    authorId: studentAlex._id,
    content: 'Thank you Professor Vance. I have incorporated 4 new papers from IEEE TKDE and ACM CSCW into section 3.2 and updated the comparative benchmark table.',
    parentCommentId: comment1._id,
    status: 'RESOLVED',
  });

  await Comment.create({
    projectId: project1._id,
    authorId: facultyEleanor._id,
    content: 'Reviewed the revision. Excellent improvement in section 3.2. You may proceed to milestone 3 implementation.',
    parentCommentId: comment1._id,
    status: 'RESOLVED',
  });

  // Faculty Review
  await Review.create({
    projectId: project1._id,
    reviewerId: facultyEleanor._id,
    milestoneId: m1._id,
    rubricScores: [
      { criterion: 'Theoretical Grounding & Depth', score: 9, maxScore: 10, comments: 'Extensive coverage of modern dense embeddings and vector databases.' },
      { criterion: 'Literature Comprehensiveness', score: 10, maxScore: 10, comments: 'Substantial improvement after revision with 2024 citations.' },
      { criterion: 'Methodological Feasibility', score: 8, maxScore: 10, comments: 'Clear pipeline design, ensure latency benchmarks are monitored.' },
    ],
    totalScore: 27,
    maxPossibleScore: 30,
    percentage: 90,
    comments: 'Outstanding preliminary research phase. The proposed hybrid dense-sparse indexing paradigm addresses significant campus scalability bottlenecks.',
    recommendations: 'Begin benchmarking microservice response latency under concurrent client requests.',
    decision: ReviewDecision.APPROVED,
    version: 1,
  });

  // Support Tickets
  await SupportTicket.create({
    ticketNumber: 'TKT-1042',
    userId: studentAlex._id,
    category: SupportCategory.PROJECTS,
    subject: 'Request for high-memory GPU instance for vector indexing benchmark',
    description: 'Our project team requires access to the high-performance campus cluster for 48 hours to precompute embeddings for 10,000 PDF documents.',
    priority: SupportPriority.HIGH,
    status: SupportStatus.OPEN,
    messages: [
      {
        senderId: studentAlex._id,
        message: 'Our project team requires access to the high-performance campus cluster for 48 hours to precompute embeddings for 10,000 PDF documents.',
        createdAt: new Date(),
      },
    ],
  });

  // Audit Logs
  await AuditLog.create({
    userId: adminUser._id,
    action: AuditAction.LOGIN_SUCCESS,
    resourceType: 'User',
    resourceId: adminUser._id.toString(),
    details: { message: 'System Admin logged in via institutional portal' },
    ipAddress: '127.0.0.1',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  });

  await AuditLog.create({
    userId: studentAlex._id,
    action: AuditAction.PROJECT_CREATED,
    resourceType: 'Project',
    resourceId: project1._id.toString(),
    details: { title: project1.title, code: project1.code },
    ipAddress: '127.0.0.1',
  });

  await AuditLog.create({
    userId: facultyEleanor._id,
    action: AuditAction.FACULTY_GUIDE_RESPONDED,
    resourceType: 'Project',
    resourceId: project1._id.toString(),
    details: { status: 'ACCEPTED', role: 'PRIMARY_GUIDE' },
    ipAddress: '127.0.0.1',
  });

  // Notifications
  await Notification.create({
    recipientId: studentAlex._id,
    senderId: facultyEleanor._id,
    type: NotificationType.GUIDE_ACCEPTED,
    title: 'Faculty Guidance Accepted',
    message: 'Dr. Eleanor Vance (Associate Professor) has accepted your request as Primary Faculty Guide for ACR-Agent.',
    linkUrl: `/projects/${project1._id}`,
    isRead: true,
    readAt: new Date(),
  });

  await Notification.create({
    recipientId: studentAlex._id,
    senderId: facultyEleanor._id,
    type: NotificationType.REVIEW_SUBMITTED,
    title: 'Milestone Review Completed: APPROVED',
    message: 'Literature Survey & State-of-the-Art Analysis was approved with a score of 90%.',
    linkUrl: `/projects/${project1._id}`,
    isRead: false,
  });

  console.log('[Seed] Database seeding completed successfully!');
  console.log('----------------------------------------------------');
  console.log('System Accounts Provisioned:');
  console.log('  Admin:   admin@university.edu   / AdminSecret123!');
  console.log('  Faculty: faculty@university.edu / Password123! (Associate Professor)');
  console.log('  Student: student@university.edu / Password123! (Final Year CS)');
  console.log('----------------------------------------------------');

  await disconnectDB();
  process.exit(0);
}

seed().catch((err) => {
  console.error('[Seed] Seeding failed with error:', err);
  process.exit(1);
});
