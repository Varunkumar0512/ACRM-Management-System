import { connectDB, disconnectDB } from '../config/db.js';

import {
  User,
  StudentProfile,
  FacultyProfile,
  ResearchDomain,
  Project,
  ProjectMember,
  ProjectGuide,
  Milestone,
  DocumentModel,
  Comment,
  Review,
  AuditLog,
} from '../models/index.js';
import {
  ProjectStatus,
  MilestoneStatus,
  DocumentType,
  DocumentStatus,
  ReviewDecision,
  GuideRole,
  GuideRequestStatus,
  AuditAction,
} from '../config/constants.js';

interface MilestoneSpec {
  title: string;
  description: string;
  orderIndex: number;
  daysOffsetFromStart: number;
  durationDays: number;
  status: MilestoneStatus;
  weight: number;
}

interface DocumentSpec {
  filename: string;
  originalName: string;
  type: DocumentType;
  fileSize: number;
  mimeType: string;
  storagePath: string;
  version: number;
  status: DocumentStatus;
  description: string;
  milestoneIndex?: number;
}

interface CommentSpec {
  authorType: 'FACULTY' | 'STUDENT';
  content: string;
  isResolved?: boolean;
}

interface ReviewSpec {
  rubricScores: Array<{
    criterion: string;
    score: number;
    maxScore: number;
    comments: string;
  }>;
  totalScore: number;
  maxPossibleScore: number;
  percentage: number;
  comments: string;
  recommendations: string;
  decision: ReviewDecision;
  version: number;
  milestoneIndex?: number;
}

interface ProjectSeedSpec {
  code: string;
  title: string;
  domainSlug: string;
  department: string;
  problemStatement: string;
  objectives: string[];
  technologies: string[];
  status: ProjectStatus;
  progressPercentage: number;
  ownerEmail: string;
  collaboratorEmail?: string;
  primaryGuideEmail: string;
  coGuideEmail?: string;
  guideStatus: GuideRequestStatus;
  startDaysAgo: number;
  durationDays: number;
  repositoryUrl: string;
  milestones: MilestoneSpec[];
  documents: DocumentSpec[];
  comments?: CommentSpec[];
  review?: ReviewSpec;
}

const SAMPLE_PROJECTS: ProjectSeedSpec[] = [
  // 1. Healthcare AI
  {
    code: 'PRJ-2026-011',
    title: 'Federated Edge Learning for Privacy-Preserving Clinical EHR Analytics',
    domainSlug: 'healthcare-tech',
    department: 'Computer Science & Engineering',
    problemStatement:
      'Hospitals possess vast multi-modal electronic health record (EHR) datasets that cannot be centralized due to stringent HIPAA and patient confidentiality regulations. Traditional central learning methods risk data breaches and violate multi-institutional data governance. This research implements a federated edge-learning pipeline utilizing differential privacy and secure aggregation, allowing regional clinics to collaboratively train prognostic risk models without exposing raw patient records.',
    objectives: [
      'Develop a decentralized federated averaging framework tailored for non-IID clinical feature distributions',
      'Integrate Renyi Differential Privacy with dynamic noise calibration to prevent membership inference attacks',
      'Benchmark prognostic accuracy across 5 simulated hospital nodes using the MIMIC-IV clinical benchmark',
    ],
    technologies: ['Python', 'PyTorch', 'Flower FL', 'FastAPI', 'Docker', 'PostgreSQL', 'Differential Privacy'],
    status: ProjectStatus.IN_PROGRESS,
    progressPercentage: 65,
    ownerEmail: 'student@university.edu',
    collaboratorEmail: 'priya.sharma@university.edu',
    primaryGuideEmail: 'dr.maya.patel@university.edu',
    coGuideEmail: 'dr.aisha.khan@university.edu',
    guideStatus: GuideRequestStatus.ACCEPTED,
    startDaysAgo: 140,
    durationDays: 240,
    repositoryUrl: 'https://github.com/acrm-org/federated-clinical-ehr',
    milestones: [
      {
        title: 'Literature Survey on Federated Healthcare Architectures & HIPAA Compliance',
        description: 'Review existing federated averaging algorithms, differential privacy budgets, and clinical data silos.',
        orderIndex: 1,
        daysOffsetFromStart: 25,
        durationDays: 25,
        status: MilestoneStatus.COMPLETED,
        weight: 2,
      },
      {
        title: 'Differential Privacy Protocol & Secure Aggregator Architecture',
        description: 'Design the central orchestration server, noise injection protocol, and client authentication handshakes.',
        orderIndex: 2,
        daysOffsetFromStart: 60,
        durationDays: 35,
        status: MilestoneStatus.COMPLETED,
        weight: 2,
      },
      {
        title: 'Simulated Distributed Node Emulation & Model Convergence Benchmark',
        description: 'Deploy 5 containerized hospital client nodes with non-IID partition splits and evaluate convergence curves.',
        orderIndex: 3,
        daysOffsetFromStart: 120,
        durationDays: 60,
        status: MilestoneStatus.IN_PROGRESS,
        weight: 3,
      },
      {
        title: 'Clinical Validation Against MIMIC-IV Mortality and Sepsis Cohorts',
        description: 'Benchmark AUROC, precision-recall, and differential privacy leakage under membership inference attacks.',
        orderIndex: 4,
        daysOffsetFromStart: 190,
        durationDays: 70,
        status: MilestoneStatus.NOT_STARTED,
        weight: 2,
      },
      {
        title: 'Final Thesis Documentation & Institutional Review Defense',
        description: 'Compile capstone dissertation, IEEE Transactions formatted paper draft, and oral defense slides.',
        orderIndex: 5,
        daysOffsetFromStart: 240,
        durationDays: 50,
        status: MilestoneStatus.NOT_STARTED,
        weight: 3,
      },
    ],
    documents: [
      {
        filename: 'ehr_federated_protocol_v2.pdf',
        originalName: 'EHR_Federated_Protocol_Specification.pdf',
        type: DocumentType.RESEARCH_PROPOSAL,
        fileSize: 2150000,
        mimeType: 'application/pdf',
        storagePath: '/uploads/documents/ehr_federated_protocol_v2.pdf',
        version: 2,
        status: DocumentStatus.APPROVED,
        description: 'Formal protocol specification for client node orchestration and noise injection budget.',
        milestoneIndex: 0,
      },
      {
        filename: 'differential_privacy_survey.pdf',
        originalName: 'Differential_Privacy_In_Healthcare_Survey.pdf',
        type: DocumentType.LITERATURE_SURVEY,
        fileSize: 3420000,
        mimeType: 'application/pdf',
        storagePath: '/uploads/documents/differential_privacy_survey.pdf',
        version: 1,
        status: DocumentStatus.APPROVED,
        description: 'Comprehensive survey of 42 peer-reviewed papers on federated learning under clinical privacy guarantees.',
        milestoneIndex: 0,
      },
      {
        filename: 'sprint3_convergence_report.pdf',
        originalName: 'Sprint3_Model_Convergence_Benchmark.pdf',
        type: DocumentType.PROGRESS_REPORT,
        fileSize: 1850000,
        mimeType: 'application/pdf',
        storagePath: '/uploads/documents/sprint3_convergence_report.pdf',
        version: 1,
        status: DocumentStatus.SUBMITTED,
        description: 'Experimental loss curves and epoch convergence tables across 5 simulated nodes.',
        milestoneIndex: 2,
      },
    ],
    comments: [
      {
        authorType: 'FACULTY',
        content:
          'Ensure the differential privacy epsilon budget does not exceed 2.0 when simulating multi-center hospital rounds, otherwise privacy leakage risks increase significantly.',
        isResolved: true,
      },
      {
        authorType: 'STUDENT',
        content:
          'Thank you Dr. Patel. We have bounded epsilon to 1.85 with delta=1e-5 using the Moments Accountant mechanism and updated the convergence script accordingly.',
        isResolved: true,
      },
    ],
    review: {
      rubricScores: [
        { criterion: 'Theoretical Rigor & Mathematical Formulation', score: 9, maxScore: 10, comments: 'Solid formulation of the Renyi Differential Privacy budget.' },
        { criterion: 'System Architecture & Implementation Quality', score: 9, maxScore: 10, comments: 'Clean Flower FL containerization and secure socket layer.' },
        { criterion: 'Experimental Methodology & Evaluation', score: 8, maxScore: 10, comments: 'Ensure non-IID label skew experiments include Dirichlet distribution tests.' },
      ],
      totalScore: 26,
      maxPossibleScore: 30,
      percentage: 87,
      comments:
        'Commendable progress on milestone 2 deliverables. The federated client orchestration demonstrates high architectural maturity. You may proceed with distributed benchmark rounds.',
      recommendations: 'Track client communication payload overhead in addition to compute latency.',
      decision: ReviewDecision.APPROVED,
      version: 1,
      milestoneIndex: 1,
    },
  },

  // 2. Agriculture IoT (COMPLETED)
  {
    code: 'PRJ-2026-012',
    title: 'LoRaWAN Soil Telemetry and Autonomous Micro-Irrigation Scheduling for Semi-Arid Crops',
    domainSlug: 'agritech',
    department: 'Electronics & Communication Engineering',
    problemStatement:
      'Conventional flood and timer-based agricultural irrigation systems squander up to 60% of water resources and degrade soil fertility through salinization. In semi-arid cultivation, growers lack localized moisture telemetry and adaptive evapotranspiration analytics. This project engineers an autonomous solar-powered micro-irrigation system driven by long-range LoRaWAN sensor nodes, soil dielectric permittivity probes, and predictive FAO-56 Penman-Monteith irrigation controllers.',
    objectives: [
      'Fabricate low-power LoRaWAN sensor motes operating on ultra-low sleep currents under 15 microamps',
      'Implement real-time soil water potential and ambient vapor pressure deficit telemetry',
      'Deploy an automated solenoid valve dispatch engine achieving 35% water savings over standard drip timers',
    ],
    technologies: ['ESP32', 'LoRaWAN', 'FreeRTOS', 'The Things Network', 'MQTT', 'Node.js', 'TimescaleDB', 'Grafana'],
    status: ProjectStatus.COMPLETED,
    progressPercentage: 100,
    ownerEmail: 'sofia.rodriguez@university.edu',
    collaboratorEmail: 'varunkumard.ec24@bitsathy.ac.in',
    primaryGuideEmail: 'dr.samuel.wright@university.edu',
    guideStatus: GuideRequestStatus.ACCEPTED,
    startDaysAgo: 210,
    durationDays: 180,
    repositoryUrl: 'https://github.com/acrm-org/lorawan-smart-irrigation',
    milestones: [
      {
        title: 'Sensor Node Circuit Design & Power Profiling',
        description: 'Design solar-harvesting power supply and SDI-12 soil moisture sensor interfaces.',
        orderIndex: 1,
        daysOffsetFromStart: 30,
        durationDays: 30,
        status: MilestoneStatus.COMPLETED,
        weight: 2,
      },
      {
        title: 'LoRaWAN Gateway Deployment & Telemetry Pipeline',
        description: 'Install 868MHz outdoor gateway and configure ChirpStack and TimescaleDB backhaul.',
        orderIndex: 2,
        daysOffsetFromStart: 70,
        durationDays: 40,
        status: MilestoneStatus.COMPLETED,
        weight: 2,
      },
      {
        title: 'Evapotranspiration Algorithm & Automated Valve Actuation',
        description: 'Implement FAO-56 Penman-Monteith predictive watering algorithms and relay control.',
        orderIndex: 3,
        daysOffsetFromStart: 120,
        durationDays: 50,
        status: MilestoneStatus.COMPLETED,
        weight: 3,
      },
      {
        title: '60-Day Field Trial at University Agricultural Experimental Farm',
        description: 'Collect continuous soil moisture, crop yield, and water consumption datasets.',
        orderIndex: 4,
        daysOffsetFromStart: 160,
        durationDays: 40,
        status: MilestoneStatus.COMPLETED,
        weight: 3,
      },
      {
        title: 'Final Thesis Documentation & Panel Defense',
        description: 'Comprehensive dissertation submission, IEEE conference paper draft, and panel examination.',
        orderIndex: 5,
        daysOffsetFromStart: 180,
        durationDays: 20,
        status: MilestoneStatus.COMPLETED,
        weight: 2,
      },
    ],
    documents: [
      {
        filename: 'lorawan_agritech_survey.pdf',
        originalName: 'LoRaWAN_Agritech_Literature_Survey.pdf',
        type: DocumentType.LITERATURE_SURVEY,
        fileSize: 2840000,
        mimeType: 'application/pdf',
        storagePath: '/uploads/documents/lorawan_agritech_survey.pdf',
        version: 1,
        status: DocumentStatus.APPROVED,
        description: 'Review of long-range IoT propagation in dense agricultural canopies.',
        milestoneIndex: 0,
      },
      {
        filename: 'soil_moisture_calibration.pdf',
        originalName: 'Soil_Moisture_Sensor_Calibration_Report.pdf',
        type: DocumentType.PROGRESS_REPORT,
        fileSize: 4120000,
        mimeType: 'application/pdf',
        storagePath: '/uploads/documents/soil_moisture_calibration.pdf',
        version: 1,
        status: DocumentStatus.APPROVED,
        description: 'Empirical dielectric calibration curve across clay loam and sandy soils.',
        milestoneIndex: 2,
      },
      {
        filename: 'smart_irrigation_final_report.pdf',
        originalName: 'Smart_Irrigation_Autonomous_Scheduling_Final_Report.pdf',
        type: DocumentType.FINAL_REPORT,
        fileSize: 6540000,
        mimeType: 'application/pdf',
        storagePath: '/uploads/documents/smart_irrigation_final_report.pdf',
        version: 1,
        status: DocumentStatus.APPROVED,
        description: 'Complete capstone dissertation demonstrating 38.4% water reduction over baseline.',
        milestoneIndex: 4,
      },
      {
        filename: 'irrigation_defense_deck.pdf',
        originalName: 'Field_Trial_Presentation_Deck.pdf',
        type: DocumentType.PRESENTATION,
        fileSize: 5210000,
        mimeType: 'application/pdf',
        storagePath: '/uploads/documents/irrigation_defense_deck.pdf',
        version: 1,
        status: DocumentStatus.APPROVED,
        description: 'Final viva presentation slides delivered to departmental review committee.',
        milestoneIndex: 4,
      },
    ],
    review: {
      rubricScores: [
        { criterion: 'Hardware Engineering & Power Efficiency', score: 10, maxScore: 10, comments: 'Exemplary low-power sleep profiling with 11.2uA deep sleep verified.' },
        { criterion: 'Field Data Quality & Agronomic Rigor', score: 10, maxScore: 10, comments: 'Extensive 60-day field validation with statistically significant water savings.' },
        { criterion: 'Thesis Clarity & Presentation Quality', score: 9, maxScore: 10, comments: 'Publication-quality documentation and well-structured hardware schematics.' },
      ],
      totalScore: 29,
      maxPossibleScore: 30,
      percentage: 97,
      comments:
        'Outstanding capstone engineering achievement. The field trials convincingly prove the agronomic and computational merits of the LoRaWAN micro-irrigation controller. Strongly recommended for departmental best project award.',
      recommendations: 'Submit condensed version of thesis to IEEE Internet of Things Journal.',
      decision: ReviewDecision.APPROVED,
      version: 1,
      milestoneIndex: 4,
    },
  },

  // 3. Cybersecurity (UNDER_REVIEW)
  {
    code: 'PRJ-2026-013',
    title: 'Zero-Trust Microsegmentation and eBPF-Driven Threat Containment in Academic Cloud Clusters',
    domainSlug: 'cybersecurity',
    department: 'Cybersecurity & Information Security',
    problemStatement:
      'Heterogeneous academic compute clusters host untrusted student workloads alongside confidential research repositories, rendering traditional perimeter-based firewalls obsolete. Once an attacker obtains a foothold via unpatched student virtual machines, lateral movement across cluster nodes is trivial. This project designs a zero-trust kernel monitoring engine leveraging Linux extended Berkeley Packet Filters (eBPF) to enforce identity-aware microsegmentation with sub-microsecond inspection overhead.',
    objectives: [
      'Develop eBPF kernel hooks to intercept socket operations and bind events dynamically',
      'Enforce cryptographic mTLS session tokens at Layer 4 without kernel-to-userspace context switches',
      'Isolate compromised containers in under 15 milliseconds upon signature and behavioral anomaly detection',
    ],
    technologies: ['Go', 'C', 'eBPF', 'Cilium', 'Kubernetes', 'Envoy', 'Prometheus', 'Wireshark'],
    status: ProjectStatus.UNDER_REVIEW,
    progressPercentage: 40,
    ownerEmail: 'liam.oconnor@university.edu',
    collaboratorEmail: 'student@university.edu',
    primaryGuideEmail: 'dr.marcus.vance@university.edu',
    guideStatus: GuideRequestStatus.ACCEPTED,
    startDaysAgo: 90,
    durationDays: 200,
    repositoryUrl: 'https://github.com/acrm-org/ebpf-zero-trust-cluster',
    milestones: [
      {
        title: 'Threat Surface Assessment & Threat Modeling in Academic Clouds',
        description: 'Map attack vectors, lateral movement techniques, and privilege escalation vulnerabilities.',
        orderIndex: 1,
        daysOffsetFromStart: 25,
        durationDays: 25,
        status: MilestoneStatus.COMPLETED,
        weight: 2,
      },
      {
        title: 'eBPF Kernel Probe Implementation & Dynamic ACLs',
        description: 'Write BPF bytecode programs attaching to cgroup/sock_ops and tc egress hooks.',
        orderIndex: 2,
        daysOffsetFromStart: 65,
        durationDays: 40,
        status: MilestoneStatus.COMPLETED,
        weight: 3,
      },
      {
        title: 'Distributed Policy Enforcement Controller in Go',
        description: 'Implement Kubernetes custom resource definitions (CRD) and userspace policy synchronization daemon.',
        orderIndex: 3,
        daysOffsetFromStart: 120,
        durationDays: 55,
        status: MilestoneStatus.IN_PROGRESS,
        weight: 3,
      },
      {
        title: 'Red-Team Adversarial Penetration Testing',
        description: 'Simulate privilege escalations, unauthorized port scans, and automated threat containment latencies.',
        orderIndex: 4,
        daysOffsetFromStart: 165,
        durationDays: 45,
        status: MilestoneStatus.NOT_STARTED,
        weight: 2,
      },
      {
        title: 'Final Documentation & USENIX Security Draft Submission',
        description: 'Comprehensive research paper delivery, documentation, and viva defense.',
        orderIndex: 5,
        daysOffsetFromStart: 200,
        durationDays: 35,
        status: MilestoneStatus.NOT_STARTED,
        weight: 2,
      },
    ],
    documents: [
      {
        filename: 'ebpf_microsegmentation_charter.pdf',
        originalName: 'ZeroTrust_eBPF_Architecture.pdf',
        type: DocumentType.PROBLEM_STATEMENT,
        fileSize: 1540000,
        mimeType: 'application/pdf',
        storagePath: '/uploads/documents/ebpf_microsegmentation_charter.pdf',
        version: 1,
        status: DocumentStatus.APPROVED,
        description: 'Threat matrix and architectural charter for kernel-space zero-trust containment.',
        milestoneIndex: 0,
      },
      {
        filename: 'kernel_packet_filter_arch.pdf',
        originalName: 'Kernel_Packet_Filter_Architecture_Rev2.pdf',
        type: DocumentType.SYSTEM_DESIGN,
        fileSize: 3720000,
        mimeType: 'application/pdf',
        storagePath: '/uploads/documents/kernel_packet_filter_arch.pdf',
        version: 2,
        status: DocumentStatus.APPROVED,
        description: 'Detailed memory layout of BPF maps and socket egress hooks.',
        milestoneIndex: 1,
      },
      {
        filename: 'midterm_containment_report.pdf',
        originalName: 'Midterm_Prototype_Demonstration_Report.pdf',
        type: DocumentType.PROGRESS_REPORT,
        fileSize: 2210000,
        mimeType: 'application/pdf',
        storagePath: '/uploads/documents/midterm_containment_report.pdf',
        version: 1,
        status: DocumentStatus.SUBMITTED,
        description: 'Latency benchmarks demonstrating 12.4ms containment upon malicious lateral SYN packets.',
        milestoneIndex: 2,
      },
    ],
    comments: [
      {
        authorType: 'FACULTY',
        content:
          'Please ensure that your BPF bytecode does not exceed the instruction complexity verifier limits when compiling on Linux kernel 6.8+.',
        isResolved: true,
      },
      {
        authorType: 'STUDENT',
        content:
          'We decomposed large loops using bounded unrolling and partitioned state into hash-of-maps structures to comply with the in-kernel verifier.',
        isResolved: true,
      },
    ],
    review: {
      rubricScores: [
        { criterion: 'Kernel Architecture & Low-Level Code Quality', score: 8, maxScore: 10, comments: 'BPF program structure is robust; review verifier complexity on newer kernels.' },
        { criterion: 'Threat Modeling & Defensive Completeness', score: 8, maxScore: 10, comments: 'Covers lateral IP spoofing; add ARP poisoning containment analysis.' },
        { criterion: 'Empirical Latency Benchmarks', score: 7, maxScore: 10, comments: 'Measure network throughput penalties under saturated 10Gbps line-rate conditions.' },
      ],
      totalScore: 23,
      maxPossibleScore: 30,
      percentage: 77,
      comments:
        'Good demonstration of kernel-level enforcement. Need deeper performance benchmarking under high packet bursts before proceeding to milestone 4.',
      recommendations: 'Incorporate pktgen throughput benchmarking alongside containment latency tests.',
      decision: ReviewDecision.CHANGES_REQUESTED,
      version: 1,
      milestoneIndex: 1,
    },
  },

  // 4. Renewable Energy (IN_PROGRESS)
  {
    code: 'PRJ-2026-014',
    title: 'Real-Time Rooftop PV Solar Inverter Health Monitoring and Adaptive MPPT Under Dynamic Shading',
    domainSlug: 'renewable-energy',
    department: 'Electronics & Communication Engineering',
    problemStatement:
      'Institutional rooftop solar arrays experience severe power generation degradation and thermal hotspot accelerated aging due to localized bird droppings, cloud transitions, and building shading. Traditional perturb-and-observe maximum power point tracking (MPPT) algorithms get trapped in local power minima, reducing harvest efficiency by up to 35%. This capstone develops a dual-core DSP-based smart solar inverter equipped with particle swarm optimization MPPT and thermal anomaly telemetry.',
    objectives: [
      'Model PV array non-linear I-V curves under complex multi-peak partial shading conditions in MATLAB',
      'Implement an adaptive particle swarm global MPPT algorithm on an STM32F4 microcontroller',
      'Design edge telemetry gateway transmitting string voltages, currents, and temperature to a campus energy portal',
    ],
    technologies: ['MATLAB/Simulink', 'STM32F4', 'C++', 'CAN Bus', 'Python', 'Scikit-Learn', 'IoT Dashboard'],
    status: ProjectStatus.IN_PROGRESS,
    progressPercentage: 70,
    ownerEmail: 'varunkumard.ec24@bitsathy.ac.in',
    collaboratorEmail: 'sofia.rodriguez@university.edu',
    primaryGuideEmail: 'dr.david.miller@university.edu',
    coGuideEmail: 'dr.samuel.wright@university.edu',
    guideStatus: GuideRequestStatus.ACCEPTED,
    startDaysAgo: 160,
    durationDays: 220,
    repositoryUrl: 'https://github.com/acrm-org/solar-mppt-inverter-iot',
    milestones: [
      {
        title: 'PV Characteristic Modeling & Simulation in Simulink',
        description: 'Simulate 10kW rooftop array under 8 distinct partial shading and bypass diode configurations.',
        orderIndex: 1,
        daysOffsetFromStart: 35,
        durationDays: 35,
        status: MilestoneStatus.COMPLETED,
        weight: 2,
      },
      {
        title: 'STM32 Dual-Core Inverter Controller Hardware Fabrication',
        description: 'Design schematic, 4-layer PCB layout, and isolated gate driver stages.',
        orderIndex: 2,
        daysOffsetFromStart: 80,
        durationDays: 45,
        status: MilestoneStatus.COMPLETED,
        weight: 3,
      },
      {
        title: 'Particle Swarm Global MPPT Firmware Implementation',
        description: 'Develop fast-converging optimization algorithm tracking global power peaks in under 180ms.',
        orderIndex: 3,
        daysOffsetFromStart: 130,
        durationDays: 50,
        status: MilestoneStatus.COMPLETED,
        weight: 3,
      },
      {
        title: 'Experimental Rig Validation Under Solar Simulator',
        description: 'Validate hardware prototype on 2kW laboratory test rig under controlled dynamic shading.',
        orderIndex: 4,
        daysOffsetFromStart: 180,
        durationDays: 50,
        status: MilestoneStatus.IN_PROGRESS,
        weight: 2,
      },
      {
        title: 'Final Capstone Thesis Defense & Patent Disclosure Submission',
        description: 'Prepare institutional presentation, project documentation, and novelty disclosure form.',
        orderIndex: 5,
        daysOffsetFromStart: 220,
        durationDays: 40,
        status: MilestoneStatus.NOT_STARTED,
        weight: 2,
      },
    ],
    documents: [
      {
        filename: 'solar_mppt_survey.pdf',
        originalName: 'Adaptive_MPPT_Comparative_Survey.pdf',
        type: DocumentType.LITERATURE_SURVEY,
        fileSize: 2950000,
        mimeType: 'application/pdf',
        storagePath: '/uploads/documents/solar_mppt_survey.pdf',
        version: 1,
        status: DocumentStatus.APPROVED,
        description: 'Benchmark review of bio-inspired algorithms for global maximum power point tracking.',
        milestoneIndex: 0,
      },
      {
        filename: 'inverter_hardware_spec.pdf',
        originalName: 'Solar_MPPT_Controller_Design.pdf',
        type: DocumentType.SYSTEM_DESIGN,
        fileSize: 4520000,
        mimeType: 'application/pdf',
        storagePath: '/uploads/documents/inverter_hardware_spec.pdf',
        version: 2,
        status: DocumentStatus.APPROVED,
        description: 'Full schematic, bill of materials, and gate driver isolation specifications.',
        milestoneIndex: 1,
      },
      {
        filename: 'thermal_shading_report.pdf',
        originalName: 'Thermal_Imaging_Partial_Shading_Results.pdf',
        type: DocumentType.PROGRESS_REPORT,
        fileSize: 3120000,
        mimeType: 'application/pdf',
        storagePath: '/uploads/documents/thermal_shading_report.pdf',
        version: 1,
        status: DocumentStatus.APPROVED,
        description: 'FLIR thermal camera imaging and power extraction efficiency curves.',
        milestoneIndex: 2,
      },
    ],
    review: {
      rubricScores: [
        { criterion: 'Power Electronics & Control Theory Implementation', score: 9, maxScore: 10, comments: 'High-quality PCB layout with proper high-voltage galvanic isolation.' },
        { criterion: 'Algorithm Convergence Speed & Accuracy', score: 9, maxScore: 10, comments: 'Global peak convergence achieved in 165ms, outperforming classical P&O.' },
        { criterion: 'Experimental Documentation & Rig Safety', score: 9, maxScore: 10, comments: 'Rigorous safety interlocks and comprehensive thermal dissipation measures.' },
      ],
      totalScore: 27,
      maxPossibleScore: 30,
      percentage: 90,
      comments:
        'Excellent engineering execution on the hardware prototype and algorithm design. The experimental validation curves match theoretical simulations with under 3% error.',
      recommendations: 'Conduct endurance testing over a continuous 48-hour cycle to assess MOSFET thermal stability.',
      decision: ReviewDecision.APPROVED,
      version: 1,
      milestoneIndex: 2,
    },
  },

  // 5. EdTech (UNDER_REVIEW)
  {
    code: 'PRJ-2026-015',
    title: 'Adaptive Cognitive Student Skill Modeling via Deep Knowledge Tracing Transformers',
    domainSlug: 'edtech',
    department: 'Data Science & Artificial Intelligence',
    problemStatement:
      'Standardized computerized tests and static university LMS learning paths treat all undergraduate students uniformly, failing to anticipate prerequisite misconceptions or cognitive fatigue. When students struggle with foundational topics in mathematics and programming, attrition compounds silently before midterm exams. This research develops a deep knowledge tracing model utilizing attention mechanisms to predict next-question mastery and recommend individualized remediation pathways in real time.',
    objectives: [
      'Extract temporal interaction trajectories from 4 semesters of campus programming LMS exercises',
      'Train an attention-based deep knowledge tracing architecture outperforming baseline Bayesian Knowledge Tracing',
      'Deploy an automated diagnostic plugin highlighting prerequisite knowledge gaps for academic advisors',
    ],
    technologies: ['Python', 'PyTorch', 'Hugging Face Transformers', 'FastAPI', 'Next.js', 'Redis', 'MongoDB'],
    status: ProjectStatus.UNDER_REVIEW,
    progressPercentage: 35,
    ownerEmail: 'marcus.chen@university.edu',
    collaboratorEmail: 'priya.sharma@university.edu',
    primaryGuideEmail: 'faculty@university.edu',
    guideStatus: GuideRequestStatus.ACCEPTED,
    startDaysAgo: 75,
    durationDays: 180,
    repositoryUrl: 'https://github.com/acrm-org/deep-knowledge-tracing-lms',
    milestones: [
      {
        title: 'Academic Log Dataset Preprocessing & Concept Tagging',
        description: 'Anonymize and map 250,000 student code submission interactions to Bloom cognitive taxonomy.',
        orderIndex: 1,
        daysOffsetFromStart: 25,
        durationDays: 25,
        status: MilestoneStatus.COMPLETED,
        weight: 2,
      },
      {
        title: 'Self-Attentive Knowledge Tracing (SAKT) Model Architecture',
        description: 'Implement multi-head attention network over sequential question-response embeddings.',
        orderIndex: 2,
        daysOffsetFromStart: 60,
        durationDays: 35,
        status: MilestoneStatus.COMPLETED,
        weight: 3,
      },
      {
        title: 'Real-Time Student Mastery Inference Service in FastAPI',
        description: 'Develop low-latency caching microservice predicting probability of answering subsequent questions.',
        orderIndex: 3,
        daysOffsetFromStart: 110,
        durationDays: 50,
        status: MilestoneStatus.IN_PROGRESS,
        weight: 3,
      },
      {
        title: 'Controlled Pedagogical Classroom Trial',
        description: 'Conduct A/B trial across two sections of Data Structures to measure intervention effectiveness.',
        orderIndex: 4,
        daysOffsetFromStart: 150,
        durationDays: 40,
        status: MilestoneStatus.NOT_STARTED,
        weight: 2,
      },
      {
        title: 'Thesis Defense & Educational Data Mining Paper Submission',
        description: 'Finalize dissertation documentation, IEEE/EDM conference manuscript, and panel defense.',
        orderIndex: 5,
        daysOffsetFromStart: 180,
        durationDays: 30,
        status: MilestoneStatus.NOT_STARTED,
        weight: 2,
      },
    ],
    documents: [
      {
        filename: 'knowledge_tracing_survey.pdf',
        originalName: 'Knowledge_Tracing_Evaluation.pdf',
        type: DocumentType.LITERATURE_SURVEY,
        fileSize: 2310000,
        mimeType: 'application/pdf',
        storagePath: '/uploads/documents/knowledge_tracing_survey.pdf',
        version: 1,
        status: DocumentStatus.APPROVED,
        description: 'Comparative review of BKT, DKT, and attention-based student cognitive modeling paradigms.',
        milestoneIndex: 0,
      },
      {
        filename: 'attention_skill_spec.pdf',
        originalName: 'Attention_Skill_Matrix_Specification.pdf',
        type: DocumentType.SYSTEM_DESIGN,
        fileSize: 3040000,
        mimeType: 'application/pdf',
        storagePath: '/uploads/documents/attention_skill_spec.pdf',
        version: 1,
        status: DocumentStatus.SUBMITTED,
        description: 'Design specification of concept embedding dimension and multi-head temporal attention layers.',
        milestoneIndex: 1,
      },
    ],
    review: {
      rubricScores: [
        { criterion: 'Educational Data Mining Domain Depth', score: 8, maxScore: 10, comments: 'Solid understanding of cognitive diagnostic models.' },
        { criterion: 'Neural Architecture Formulation', score: 8, maxScore: 10, comments: 'SAKT architecture accurately implemented; consider incorporating forgetting curves.' },
        { criterion: 'Experimental Baseline Rigor', score: 8, maxScore: 10, comments: 'Baselines must include Logistic Knowledge Tracing in addition to standard BKT.' },
      ],
      totalScore: 24,
      maxPossibleScore: 30,
      percentage: 80,
      comments:
        'Good theoretical grounding and clear preprocessing methodology. The concept tagging pipeline effectively handles multi-topic programming problems.',
      recommendations: 'Ensure student identity anonymization complies strictly with institutional FERPA guidelines.',
      decision: ReviewDecision.APPROVED,
      version: 1,
      milestoneIndex: 1,
    },
  },

  // 6. Agriculture / Drone AI (PENDING)
  {
    code: 'PRJ-2026-016',
    title: 'Autonomous UAV Path Planning for Multispectral Precision Crop Health Assessment',
    domainSlug: 'agritech',
    department: 'Computer Science & Engineering',
    problemStatement:
      'Manual field surveying of large-scale orchards and crop hectares is labor-intensive, hazardous, and fails to identify pest infestations until visual foliage damage is severe. Commercial autonomous drone flight plans follow static grid patterns that exhaust battery reserves over barren areas while neglecting high-risk canopy clusters. This project formulates an adaptive energy-aware path planning algorithm for quadcopter drones equipped with multispectral NDVI cameras.',
    objectives: [
      'Implement an adaptive informativeness-driven coverage path planning algorithm in ROS2 and Gazebo',
      'Integrate onboard edge visual processing calculating real-time Normalized Difference Vegetation Index (NDVI)',
      'Demonstrate a 30% reduction in mission flight time compared to conventional boustrophedon sweep surveys',
    ],
    technologies: ['ROS2', 'Python', 'C++', 'PX4 Autopilot', 'OpenCV', 'Gazebo', 'Jetson Nano'],
    status: ProjectStatus.SUBMITTED,
    progressPercentage: 10,
    ownerEmail: 'priya.sharma@university.edu',
    collaboratorEmail: 'sofia.rodriguez@university.edu',
    primaryGuideEmail: 'dr.david.miller@university.edu',
    guideStatus: GuideRequestStatus.REQUESTED,
    startDaysAgo: 15,
    durationDays: 240,
    repositoryUrl: 'https://github.com/acrm-org/uav-multispectral-crop-survey',
    milestones: [
      {
        title: 'Literature Survey on Aerial Photogrammetry & NDVI',
        description: 'Review drone aerodynamics, coverage path planning, and multispectral imaging bands.',
        orderIndex: 1,
        daysOffsetFromStart: 30,
        durationDays: 30,
        status: MilestoneStatus.SUBMITTED,
        weight: 2,
      },
      {
        title: 'Simulation Environment Setup in Gazebo with Crop Models',
        description: 'Construct realistic 3D farm terrain with varying canopy health and wind vector disturbances.',
        orderIndex: 2,
        daysOffsetFromStart: 80,
        durationDays: 50,
        status: MilestoneStatus.NOT_STARTED,
        weight: 2,
      },
      {
        title: 'Energy-Optimal Waypoint Coverage Algorithm',
        description: 'Implement genetic algorithm and frontier exploration for adaptive waypoint sequencing.',
        orderIndex: 3,
        daysOffsetFromStart: 140,
        durationDays: 60,
        status: MilestoneStatus.NOT_STARTED,
        weight: 3,
      },
      {
        title: 'Hardware Integration with Multispectral Camera Rig',
        description: 'Mount Jetson Nano edge computer and calibrate camera payload on quadcopter frame.',
        orderIndex: 4,
        daysOffsetFromStart: 195,
        durationDays: 55,
        status: MilestoneStatus.NOT_STARTED,
        weight: 3,
      },
      {
        title: 'Field Mission Validation & Final Capstone Defense',
        description: 'Conduct authorized field test flights and compile comprehensive engineering thesis.',
        orderIndex: 5,
        daysOffsetFromStart: 240,
        durationDays: 45,
        status: MilestoneStatus.NOT_STARTED,
        weight: 2,
      },
    ],
    documents: [
      {
        filename: 'precision_crop_uav_charter.pdf',
        originalName: 'Precision_Crop_UAV_Proposal.pdf',
        type: DocumentType.RESEARCH_PROPOSAL,
        fileSize: 1920000,
        mimeType: 'application/pdf',
        storagePath: '/uploads/documents/precision_crop_uav_charter.pdf',
        version: 1,
        status: DocumentStatus.SUBMITTED,
        description: 'Formal project research proposal detailing flight safety protocols and payload specifications.',
        milestoneIndex: 0,
      },
      {
        filename: 'ndvi_photogrammetry_survey.pdf',
        originalName: 'Literature_Review_Multispectral_NDVI.pdf',
        type: DocumentType.LITERATURE_SURVEY,
        fileSize: 2710000,
        mimeType: 'application/pdf',
        storagePath: '/uploads/documents/ndvi_photogrammetry_survey.pdf',
        version: 1,
        status: DocumentStatus.SUBMITTED,
        description: 'Survey of vegetation indexing algorithms and drone battery constraints in agricultural applications.',
        milestoneIndex: 0,
      },
    ],
  },

  // 7. Embedded Systems (IN_PROGRESS)
  {
    code: 'PRJ-2026-017',
    title: 'Real-Time Embedded RTOS Engine for Ultra-Low Power Wearable Biosensors',
    domainSlug: 'embedded-systems',
    department: 'Electronics & Communication Engineering',
    problemStatement:
      'Continuous physiological monitoring devices (ECG, photoplethysmography, galvanic skin response) are constrained by limited coin-cell battery capacity and strict real-time scheduling latency requirements. Frequent polling and inefficient context switching drain battery reserves within 48 hours, forcing patients to interrupt telemetry cycles. This capstone develops an ultra-low power firmware kernel running on FreeRTOS with tickless idle operation and on-chip TinyML event filtering.',
    objectives: [
      'Design low-noise analog biosignal conditioning circuitry interfacing with ARM Cortex-M4 architecture',
      'Optimize FreeRTOS tickless idle routines to achieve sub-20uA standby power consumption',
      'Deploy on-device quantized 1D-CNN detecting premature ventricular contractions (PVC) with 94%+ precision',
    ],
    technologies: ['C', 'ARM Cortex-M4', 'FreeRTOS', 'BLE 5.2', 'Nordic nRF52840', 'TinyML'],
    status: ProjectStatus.IN_PROGRESS,
    progressPercentage: 55,
    ownerEmail: 'sofia.rodriguez@university.edu',
    collaboratorEmail: 'liam.oconnor@university.edu',
    primaryGuideEmail: 'dr.samuel.wright@university.edu',
    guideStatus: GuideRequestStatus.ACCEPTED,
    startDaysAgo: 110,
    durationDays: 200,
    repositoryUrl: 'https://github.com/acrm-org/wearable-biosensor-rtos',
    milestones: [
      {
        title: 'Analog Front-End ECG Signal Acquisition Circuitry',
        description: 'Design instrumentation amplifier stages, notch filters, and lead-off detection circuits.',
        orderIndex: 1,
        daysOffsetFromStart: 30,
        durationDays: 30,
        status: MilestoneStatus.COMPLETED,
        weight: 2,
      },
      {
        title: 'FreeRTOS Tickless Idle Integration & Power Budgeting',
        description: 'Configure RTC alarm wakeups, peripheral power gates, and Bluetooth Low Energy advertisements.',
        orderIndex: 2,
        daysOffsetFromStart: 70,
        durationDays: 40,
        status: MilestoneStatus.COMPLETED,
        weight: 3,
      },
      {
        title: 'On-Chip Arrhythmia Feature Extraction via TinyML',
        description: 'Train 8-bit quantized 1D convolutional model executing in under 20KB SRAM footprint.',
        orderIndex: 3,
        daysOffsetFromStart: 125,
        durationDays: 55,
        status: MilestoneStatus.IN_PROGRESS,
        weight: 3,
      },
      {
        title: 'Clinical Benchmark Testing with MIT-BIH Database',
        description: 'Replay standardized patient records through hardware DAC and verify real-time classification.',
        orderIndex: 4,
        daysOffsetFromStart: 170,
        durationDays: 45,
        status: MilestoneStatus.NOT_STARTED,
        weight: 2,
      },
      {
        title: 'Final Thesis Defense and Hardware Prototype Demonstration',
        description: 'Demonstrate live wearable telemetry to faculty panel and deliver complete documentation.',
        orderIndex: 5,
        daysOffsetFromStart: 200,
        durationDays: 30,
        status: MilestoneStatus.NOT_STARTED,
        weight: 2,
      },
    ],
    documents: [
      {
        filename: 'biosensor_firmware_spec.pdf',
        originalName: 'FreeRTOS_Biosensor_Firmware_Spec.pdf',
        type: DocumentType.SYSTEM_DESIGN,
        fileSize: 3620000,
        mimeType: 'application/pdf',
        storagePath: '/uploads/documents/biosensor_firmware_spec.pdf',
        version: 1,
        status: DocumentStatus.APPROVED,
        description: 'Full register-level firmware architecture, FreeRTOS task priority hierarchy, and queue sizes.',
        milestoneIndex: 1,
      },
      {
        filename: 'tickless_idle_power_report.pdf',
        originalName: 'Power_Optimization_Tickless_Idle_Benchmarks.pdf',
        type: DocumentType.PROGRESS_REPORT,
        fileSize: 2480000,
        mimeType: 'application/pdf',
        storagePath: '/uploads/documents/tickless_idle_power_report.pdf',
        version: 1,
        status: DocumentStatus.APPROVED,
        description: 'Oscilloscope current probe measurements demonstrating 18.6uA average idle current.',
        milestoneIndex: 1,
      },
    ],
    review: {
      rubricScores: [
        { criterion: 'Embedded Hardware-Software Co-Design', score: 9, maxScore: 10, comments: 'Clean interrupt priority assignment avoiding priority inversion.' },
        { criterion: 'Power Consumption Optimization', score: 9, maxScore: 10, comments: 'Impressive current profile; verify BLE connection interval negotiations.' },
        { criterion: 'Signal Processing Integrity', score: 7, maxScore: 10, comments: 'Ensure motion artifact rejection filter does not distort QRS peak amplitude.' },
      ],
      totalScore: 25,
      maxPossibleScore: 30,
      percentage: 83,
      comments:
        'Very strong progress on milestone 2. The tickless idle implementation successfully meets the battery lifetime targets. Focus next on robust QRS detection during physical movement.',
      recommendations: 'Incorporate 3-axis accelerometer data as an auxiliary channel to cancel motion artifacts.',
      decision: ReviewDecision.APPROVED,
      version: 1,
      milestoneIndex: 1,
    },
  },

  // 8. Healthcare AI (COMPLETED)
  {
    code: 'PRJ-2026-018',
    title: 'Multi-Modal Deep Neural Transformer for Automated Diabetic Retinopathy Grading',
    domainSlug: 'healthcare-tech',
    department: 'Computer Science & Engineering',
    problemStatement:
      'Diabetic retinopathy is the leading cause of preventable blindness among working-age adults globally, yet regular ophthalmologist screenings remain inaccessible to rural and underserved populations. Early microaneurysms and subtle hemorrhages are easily missed on standard single-field fundus photography. This capstone presents a multi-modal vision transformer integrating high-resolution digital fundus images and clinical risk factor metadata to achieve automated 5-stage diabetic retinopathy severity triage.',
    objectives: [
      'Assemble and curate a benchmark dataset of 35,000 dual-field retinal fundus photographs',
      'Train a hierarchical Vision Transformer (ViT) with patch-wise self-attention identifying microvascular lesions',
      'Achieve quadratic weighted kappa score exceeding 0.88 on independent clinical test cohorts',
    ],
    technologies: ['PyTorch', 'TorchVision', 'Vision Transformer (ViT)', 'FastAPI', 'Docker', 'Grad-CAM', 'React'],
    status: ProjectStatus.COMPLETED,
    progressPercentage: 100,
    ownerEmail: 'student@university.edu',
    collaboratorEmail: 'marcus.chen@university.edu',
    primaryGuideEmail: 'dr.maya.patel@university.edu',
    guideStatus: GuideRequestStatus.ACCEPTED,
    startDaysAgo: 240,
    durationDays: 200,
    repositoryUrl: 'https://github.com/acrm-org/retinopathy-vit-diagnostic',
    milestones: [
      {
        title: 'EyePACS & Messidor-2 Dataset Normalization and Augmentation',
        description: 'Clean, normalize illumination, crop optic discs, and balance severity distributions.',
        orderIndex: 1,
        daysOffsetFromStart: 35,
        durationDays: 35,
        status: MilestoneStatus.COMPLETED,
        weight: 2,
      },
      {
        title: 'Multi-Scale Patch Vision Transformer Training',
        description: 'Train ViT-B/16 architecture pre-trained on ImageNet-21k with focal loss for class imbalance.',
        orderIndex: 2,
        daysOffsetFromStart: 85,
        durationDays: 50,
        status: MilestoneStatus.COMPLETED,
        weight: 3,
      },
      {
        title: 'Grad-CAM Lesion Explainability & Heatmap Visualization',
        description: 'Generate saliency maps highlighting exudates and hemorrhages for clinician review.',
        orderIndex: 3,
        daysOffsetFromStart: 135,
        durationDays: 50,
        status: MilestoneStatus.COMPLETED,
        weight: 3,
      },
      {
        title: 'Ophthalmologist Double-Blind Evaluation Study',
        description: 'Conduct blind diagnostic validation with 3 board-certified retina specialists on 500 cases.',
        orderIndex: 4,
        daysOffsetFromStart: 175,
        durationDays: 40,
        status: MilestoneStatus.COMPLETED,
        weight: 2,
      },
      {
        title: 'Thesis Manuscript Submission & Committee Defense',
        description: 'Deliver comprehensive dissertation, IEEE TMI publication draft, and viva defense.',
        orderIndex: 5,
        daysOffsetFromStart: 200,
        durationDays: 25,
        status: MilestoneStatus.COMPLETED,
        weight: 2,
      },
    ],
    documents: [
      {
        filename: 'retinopathy_survey.pdf',
        originalName: 'Diabetic_Retinopathy_Literature_Survey.pdf',
        type: DocumentType.LITERATURE_SURVEY,
        fileSize: 3120000,
        mimeType: 'application/pdf',
        storagePath: '/uploads/documents/retinopathy_survey.pdf',
        version: 1,
        status: DocumentStatus.APPROVED,
        description: 'Exhaustive survey on deep learning diagnostics in computer-assisted ophthalmology.',
        milestoneIndex: 0,
      },
      {
        filename: 'vit_fundus_design.pdf',
        originalName: 'ViT_Fundus_Diagnostic_Architecture.pdf',
        type: DocumentType.SYSTEM_DESIGN,
        fileSize: 4820000,
        mimeType: 'application/pdf',
        storagePath: '/uploads/documents/vit_fundus_design.pdf',
        version: 2,
        status: DocumentStatus.APPROVED,
        description: 'Complete neural architecture specification, patch projection dimension, and attention heads.',
        milestoneIndex: 1,
      },
      {
        filename: 'retinopathy_final_thesis.pdf',
        originalName: 'Retinopathy_Diagnostic_Thesis.pdf',
        type: DocumentType.FINAL_REPORT,
        fileSize: 7240000,
        mimeType: 'application/pdf',
        storagePath: '/uploads/documents/retinopathy_final_thesis.pdf',
        version: 1,
        status: DocumentStatus.APPROVED,
        description: 'Defended capstone thesis achieving 0.914 quadratic weighted kappa score.',
        milestoneIndex: 4,
      },
      {
        filename: 'retinopathy_presentation.pdf',
        originalName: 'Thesis_Defense_Presentation_Slides.pdf',
        type: DocumentType.PRESENTATION,
        fileSize: 6150000,
        mimeType: 'application/pdf',
        storagePath: '/uploads/documents/retinopathy_presentation.pdf',
        version: 1,
        status: DocumentStatus.APPROVED,
        description: 'Final viva slides presented to the departmental evaluation panel.',
        milestoneIndex: 4,
      },
    ],
    review: {
      rubricScores: [
        { criterion: 'Deep Learning Methodology & Training Rigor', score: 10, maxScore: 10, comments: 'Exemplary cross-validation setup with robust focal loss handling of class imbalance.' },
        { criterion: 'Clinical Relevance & Explainability', score: 10, maxScore: 10, comments: 'Grad-CAM attention overlays correspond directly to microaneurysm clinical pathology.' },
        { criterion: 'Dissertation Depth & Academic Contribution', score: 9, maxScore: 10, comments: 'Excellently structured thesis with thorough statistical significance analysis.' },
      ],
      totalScore: 29,
      maxPossibleScore: 30,
      percentage: 97,
      comments:
        'A masterclass in translational biomedical engineering. The student demonstrated outstanding proficiency in deep vision models and clinical validation methodology. Recommended for institutional publication award.',
      recommendations: 'Pursue institutional clinical trial pilot in collaboration with university hospital.',
      decision: ReviewDecision.APPROVED,
      version: 1,
      milestoneIndex: 4,
    },
  },

  // 9. IoT (UNDER_REVIEW)
  {
    code: 'PRJ-2026-019',
    title: 'Self-Healing Smart Grid Micro-Substation Controller with Embedded Edge AI Telemetry',
    domainSlug: 'iot',
    department: 'Electronics & Communication Engineering',
    problemStatement:
      'Distributed generation from residential solar and battery storage creates unpredictable bidirectional power flows, causing localized voltage fluctuations and substation transformer overloads. Traditional distribution automation relies on centralized SCADA centers that incur latency delays of 3 to 15 seconds, during which branch circuit breakers trip unnecessarily. This project implements an embedded IoT micro-substation controller capable of sub-cycle fault detection and automated reconfigurable islanding.',
    objectives: [
      'Develop embedded Modbus-TCP and MQTT protocol bridges on an ESP32-S3 microcontroller',
      'Deploy 1D wavelet transform models for transient short-circuit fault classification in under 16ms',
      'Demonstrate automated sectionalizing and load-shedding preserving critical campus laboratory circuits',
    ],
    technologies: ['Rust', 'C++', 'ESP32-S3', 'Modbus-TCP', 'MQTT', 'InfluxDB', 'Docker', 'Edge Impulse'],
    status: ProjectStatus.UNDER_REVIEW,
    progressPercentage: 45,
    ownerEmail: 'varunkumard.ec24@bitsathy.ac.in',
    collaboratorEmail: 'priya.sharma@university.edu',
    primaryGuideEmail: 'dr.samuel.wright@university.edu',
    coGuideEmail: 'dr.david.miller@university.edu',
    guideStatus: GuideRequestStatus.ACCEPTED,
    startDaysAgo: 95,
    durationDays: 200,
    repositoryUrl: 'https://github.com/acrm-org/self-healing-grid-iot',
    milestones: [
      {
        title: 'Substation Telemetry & Modbus-TCP Protocol Stack',
        description: 'Interface power quality transducers and implement high-throughput Modbus polling loop in Rust.',
        orderIndex: 1,
        daysOffsetFromStart: 30,
        durationDays: 30,
        status: MilestoneStatus.COMPLETED,
        weight: 2,
      },
      {
        title: 'Fast Transient Fault Waveform Capture Engine',
        description: 'Sample voltage and current at 5kHz and compute real-time symmetrical components.',
        orderIndex: 2,
        daysOffsetFromStart: 70,
        durationDays: 40,
        status: MilestoneStatus.COMPLETED,
        weight: 3,
      },
      {
        title: 'Automated Islanding & Self-Healing Switching Logic',
        description: 'Implement distributed consensus state machine coordinating motorized circuit breaker trips.',
        orderIndex: 3,
        daysOffsetFromStart: 125,
        durationDays: 55,
        status: MilestoneStatus.IN_PROGRESS,
        weight: 3,
      },
      {
        title: 'Physical Microgrid Hardware-in-the-Loop Simulation',
        description: 'Validate controller responses against OPAL-RT real-time power grid simulation environment.',
        orderIndex: 4,
        daysOffsetFromStart: 170,
        durationDays: 45,
        status: MilestoneStatus.NOT_STARTED,
        weight: 2,
      },
      {
        title: 'Institutional Research Presentation & IPR Filing',
        description: 'Final viva defense, comprehensive thesis documentation, and novelty disclosure filing.',
        orderIndex: 5,
        daysOffsetFromStart: 200,
        durationDays: 30,
        status: MilestoneStatus.NOT_STARTED,
        weight: 2,
      },
    ],
    documents: [
      {
        filename: 'micro_substation_spec.pdf',
        originalName: 'MicroSubstation_Edge_Specs.pdf',
        type: DocumentType.SYSTEM_DESIGN,
        fileSize: 3840000,
        mimeType: 'application/pdf',
        storagePath: '/uploads/documents/micro_substation_spec.pdf',
        version: 1,
        status: DocumentStatus.APPROVED,
        description: 'Electrical wiring diagram, Rust async runtime architecture, and Modbus register mapping.',
        milestoneIndex: 0,
      },
      {
        filename: 'edge_inference_latency.pdf',
        originalName: 'Edge_Inference_Latency_Benchmark.pdf',
        type: DocumentType.PROGRESS_REPORT,
        fileSize: 2150000,
        mimeType: 'application/pdf',
        storagePath: '/uploads/documents/edge_inference_latency.pdf',
        version: 1,
        status: DocumentStatus.SUBMITTED,
        description: 'Execution benchmark verifying 14.2ms fault classification on ESP32-S3 vector instructions.',
        milestoneIndex: 1,
      },
    ],
    review: {
      rubricScores: [
        { criterion: 'Power Systems Protocol Engineering', score: 9, maxScore: 10, comments: 'Rust async implementation provides robust memory safety during high-frequency telemetry.' },
        { criterion: 'Fault Detection Latency & Precision', score: 9, maxScore: 10, comments: 'Sub-cycle fault classification verified within 14.2 milliseconds.' },
        { criterion: 'Experimental Setup & Simulation Realism', score: 8, maxScore: 10, comments: 'Hardware-in-the-loop plans are thorough; prepare OPAL-RT interface scripts.' },
      ],
      totalScore: 26,
      maxPossibleScore: 30,
      percentage: 87,
      comments:
        'Impressive embedded systems implementation. The use of memory-safe Rust for grid automation is cutting-edge and highly commended.',
      recommendations: 'Ensure fail-safe hardware watchdog timers are wired to trigger breaker fallback on power loss.',
      decision: ReviewDecision.APPROVED,
      version: 1,
      milestoneIndex: 1,
    },
  },

  // 10. Cybersecurity (PENDING)
  {
    code: 'PRJ-2026-020',
    title: 'Automated Static Analysis and Formal Verification of Smart Contract Reentrancy Vulnerabilities',
    domainSlug: 'cybersecurity',
    department: 'Cybersecurity & Information Security',
    problemStatement:
      'Decentralized finance (DeFi) protocols executing on the Ethereum Virtual Machine (EVM) manage billions in digital assets, yet remain susceptible to subtle reentrancy, integer overflow, and flash-loan price manipulation exploits. Because smart contracts are immutable post-deployment, post-facto security patches are impossible. This research constructs an automated static analysis engine coupling abstract syntax tree parsing with the Z3 SMT solver for formal mathematical verification of contract invariance.',
    objectives: [
      'Develop an EVM bytecode disassembler and control-flow graph (CFG) generator in Rust',
      'Formulate first-order logic constraints modeling reentrancy attack vectors into Z3 SMT solver queries',
      'Audit 1,000 top Ethereum contracts and isolate zero-day vulnerabilities with under 5% false positive rate',
    ],
    technologies: ['Solidity', 'Rust', 'Slither', 'Z3 SMT Solver', 'Python', 'Hardhat', 'Web3.js'],
    status: ProjectStatus.SUBMITTED,
    progressPercentage: 15,
    ownerEmail: 'liam.oconnor@university.edu',
    collaboratorEmail: 'priya.sharma@university.edu',
    primaryGuideEmail: 'dr.marcus.vance@university.edu',
    guideStatus: GuideRequestStatus.REQUESTED,
    startDaysAgo: 20,
    durationDays: 220,
    repositoryUrl: 'https://github.com/acrm-org/solidity-formal-verification',
    milestones: [
      {
        title: 'Comprehensive Taxonomy of EVM Vulnerabilities & Exploit Corpus',
        description: 'Catalog historical reentrancy exploits (DAO, Lendf.me, Cream) and curate annotated test suite.',
        orderIndex: 1,
        daysOffsetFromStart: 30,
        durationDays: 30,
        status: MilestoneStatus.SUBMITTED,
        weight: 2,
      },
      {
        title: 'Abstract Syntax Tree Parser & Control Flow Graph Builder in Rust',
        description: 'Parse Solidity AST and synthesize inter-procedural call graphs with state variable dependencies.',
        orderIndex: 2,
        daysOffsetFromStart: 80,
        durationDays: 50,
        status: MilestoneStatus.NOT_STARTED,
        weight: 3,
      },
      {
        title: 'Symbolic Execution Engine Integration with Z3 SMT Solver',
        description: 'Translate contract state update constraints into first-order satisfiability theorems.',
        orderIndex: 3,
        daysOffsetFromStart: 140,
        durationDays: 60,
        status: MilestoneStatus.NOT_STARTED,
        weight: 3,
      },
      {
        title: 'Benchmark Evaluation Against Vulnerable Contract Repositories',
        description: 'Benchmark precision, recall, and analysis execution speed against Slither and Mythril.',
        orderIndex: 4,
        daysOffsetFromStart: 185,
        durationDays: 45,
        status: MilestoneStatus.NOT_STARTED,
        weight: 2,
      },
      {
        title: 'Final Thesis Defense & Open-Source Audit Tool Release',
        description: 'Deliver dissertation, documentation, and open-source CLI analysis tool on GitHub.',
        orderIndex: 5,
        daysOffsetFromStart: 220,
        durationDays: 35,
        status: MilestoneStatus.NOT_STARTED,
        weight: 2,
      },
    ],
    documents: [
      {
        filename: 'smart_contract_charter.pdf',
        originalName: 'Smart_Contract_Audit_Charter.pdf',
        type: DocumentType.RESEARCH_PROPOSAL,
        fileSize: 1720000,
        mimeType: 'application/pdf',
        storagePath: '/uploads/documents/smart_contract_charter.pdf',
        version: 1,
        status: DocumentStatus.SUBMITTED,
        description: 'Research charter outlining formal verification scope and symbolic execution pipeline.',
        milestoneIndex: 0,
      },
      {
        filename: 'evm_bytecode_survey.pdf',
        originalName: 'EVM_Bytecode_Disassembly_Survey.pdf',
        type: DocumentType.LITERATURE_SURVEY,
        fileSize: 2410000,
        mimeType: 'application/pdf',
        storagePath: '/uploads/documents/evm_bytecode_survey.pdf',
        version: 1,
        status: DocumentStatus.SUBMITTED,
        description: 'Survey of static analysis, symbolic execution, and formal methods in smart contract security.',
        milestoneIndex: 0,
      },
    ],
  },

  // 11. AI / Smart Campus (IN_PROGRESS)
  {
    code: 'PRJ-2026-021',
    title: 'Multi-Agent Reinforcement Learning for Adaptive Campus Microgrid Peak Load Balancing',
    domainSlug: 'ai-ml',
    department: 'Computer Science & Engineering',
    problemStatement:
      'Collegiate campuses consume peak energy tariffs during mid-day laboratory sessions and evening library occupancy surges, leading to excessive utility penalty charges and strained regional electrical grids. Fixed time-of-use scheduling cannot adapt to sudden classroom occupancy shifts or variable solar irradiance. This capstone deploys a decentralized multi-agent reinforcement learning (MARL) framework coordinating building chillers, EV chargers, and battery banks.',
    objectives: [
      'Model campus facility thermodynamic envelopes and battery degradation functions in OpenAI Gym',
      'Train multi-agent proximal policy optimization (MAPPO) agents balancing local thermal comfort against tariffs',
      'Achieve 22% reduction in peak demand surcharges across simulated campus building clusters',
    ],
    technologies: ['Python', 'Ray RLlib', 'PyTorch', 'OpenAI Gym', 'FastAPI', 'PostgreSQL', 'Grafana'],
    status: ProjectStatus.IN_PROGRESS,
    progressPercentage: 60,
    ownerEmail: 'priya.sharma@university.edu',
    collaboratorEmail: 'student@university.edu',
    primaryGuideEmail: 'faculty@university.edu',
    guideStatus: GuideRequestStatus.ACCEPTED,
    startDaysAgo: 120,
    durationDays: 210,
    repositoryUrl: 'https://github.com/acrm-org/marl-campus-microgrid',
    milestones: [
      {
        title: 'Campus Electric Load Profiling & Environment Simulation',
        description: 'Extract 3 years of 15-minute smart meter logs across 18 campus buildings and calibrate simulator.',
        orderIndex: 1,
        daysOffsetFromStart: 30,
        durationDays: 30,
        status: MilestoneStatus.COMPLETED,
        weight: 2,
      },
      {
        title: 'Centralized Training Decentralized Execution (CTDE) MAPPO Setup',
        description: 'Implement multi-agent policy networks in Ray RLlib with shared critic value functions.',
        orderIndex: 2,
        daysOffsetFromStart: 75,
        durationDays: 45,
        status: MilestoneStatus.COMPLETED,
        weight: 3,
      },
      {
        title: 'Dynamic Tariff & Battery Degradation Optimization',
        description: 'Integrate non-linear battery degradation penalties and peak demand tariff incentives.',
        orderIndex: 3,
        daysOffsetFromStart: 130,
        durationDays: 55,
        status: MilestoneStatus.IN_PROGRESS,
        weight: 3,
      },
      {
        title: 'Grid Stress Resilience Tests & Extreme Weather Scenarios',
        description: 'Evaluate agent adaptation to sudden solar cloud coverage drop-offs and extreme heat waves.',
        orderIndex: 4,
        daysOffsetFromStart: 175,
        durationDays: 45,
        status: MilestoneStatus.NOT_STARTED,
        weight: 2,
      },
      {
        title: 'Capstone Thesis Defense & IEEE Manuscript Preparation',
        description: 'Compile thesis documentation, interactive energy dashboard, and oral panel defense.',
        orderIndex: 5,
        daysOffsetFromStart: 210,
        durationDays: 35,
        status: MilestoneStatus.NOT_STARTED,
        weight: 2,
      },
    ],
    documents: [
      {
        filename: 'marl_microgrid_survey.pdf',
        originalName: 'MARL_Campus_Energy_System_Design.pdf',
        type: DocumentType.LITERATURE_SURVEY,
        fileSize: 3340000,
        mimeType: 'application/pdf',
        storagePath: '/uploads/documents/marl_microgrid_survey.pdf',
        version: 1,
        status: DocumentStatus.APPROVED,
        description: 'Comprehensive review of multi-agent reinforcement learning in smart grid dispatch.',
        milestoneIndex: 0,
      },
      {
        filename: 'marl_actor_critic_design.pdf',
        originalName: 'Actor_Critic_Dispatch_Architecture.pdf',
        type: DocumentType.SYSTEM_DESIGN,
        fileSize: 4050000,
        mimeType: 'application/pdf',
        storagePath: '/uploads/documents/marl_actor_critic_design.pdf',
        version: 1,
        status: DocumentStatus.APPROVED,
        description: 'Formal policy network specifications and reward shaping formulations for comfort vs cost.',
        milestoneIndex: 1,
      },
      {
        filename: 'peak_shaving_results.pdf',
        originalName: 'Peak_Load_Shaving_Simulation_Results.pdf',
        type: DocumentType.PROGRESS_REPORT,
        fileSize: 2740000,
        mimeType: 'application/pdf',
        storagePath: '/uploads/documents/peak_shaving_results.pdf',
        version: 1,
        status: DocumentStatus.SUBMITTED,
        description: 'Comparative load profile plots demonstrating 19.8% peak shaving under simulated summer conditions.',
        milestoneIndex: 2,
      },
    ],
    review: {
      rubricScores: [
        { criterion: 'RL Formulation & Reward Engineering', score: 9, maxScore: 10, comments: 'Well-balanced reward function avoiding bang-bang chiller oscillations.' },
        { criterion: 'Simulation Fidelity & Environmental Realism', score: 9, maxScore: 10, comments: 'Building thermal lag accurately modeled using calibrated RC parameters.' },
        { criterion: 'Scalability & Multi-Agent Coordination', score: 9, maxScore: 10, comments: 'CTDE architecture scales effectively across the 18 campus building nodes.' },
      ],
      totalScore: 27,
      maxPossibleScore: 30,
      percentage: 90,
      comments:
        'Excellent progress on milestone 2. The multi-agent dispatch demonstrates real economic viability on the university electric bill. Ensure battery state-of-health degradation is accurately accounted for.',
      recommendations: 'Test sensitivity against uncertain weather forecasts with varying noise envelopes.',
      decision: ReviewDecision.APPROVED,
      version: 1,
      milestoneIndex: 1,
    },
  },

  // 12. EdTech (COMPLETED)
  {
    code: 'PRJ-2026-022',
    title: 'Intelligent Multimodal Peer-Assessment and Automated Code Rubric Feedback Engine',
    domainSlug: 'edtech',
    department: 'Data Science & Artificial Intelligence',
    problemStatement:
      'In massive undergraduate computer science cohorts, faculty teaching assistants cannot provide timely, granular feedback on code style, algorithmic efficiency, and documentation quality. Peer review systems suffer from subjective bias, varying grading leniency, and inconsistent rubric application. This capstone engineers an automated grading and peer calibration engine combining static abstract syntax tree analysis with LLM generative guidance to produce verifiable rubric evaluations.',
    objectives: [
      'Parse student programming assignments across Python, Java, and C++ into unified AST representations',
      'Train a fine-tuned CodeBERT model predicting code rubric criterion scores with 89%+ human agreement',
      'Deploy an automated feedback assistant providing actionable syntax and algorithmic improvement suggestions',
    ],
    technologies: ['Python', 'Tree-sitter', 'CodeBERT', 'LangChain', 'FastAPI', 'React', 'TypeScript', 'Docker'],
    status: ProjectStatus.COMPLETED,
    progressPercentage: 100,
    ownerEmail: 'marcus.chen@university.edu',
    collaboratorEmail: 'liam.oconnor@university.edu',
    primaryGuideEmail: 'faculty@university.edu',
    coGuideEmail: 'dr.maya.patel@university.edu',
    guideStatus: GuideRequestStatus.ACCEPTED,
    startDaysAgo: 220,
    durationDays: 190,
    repositoryUrl: 'https://github.com/acrm-org/automated-code-rubric-engine',
    milestones: [
      {
        title: 'Dataset Collection of Student Programming Submissions',
        description: 'Anonymize and curate 12,000 historical student assignment submissions with rubric grades.',
        orderIndex: 1,
        daysOffsetFromStart: 30,
        durationDays: 30,
        status: MilestoneStatus.COMPLETED,
        weight: 2,
      },
      {
        title: 'Syntactic & Semantic Static Rubric Extraction Engine',
        description: 'Build Tree-sitter AST parser extracting cyclomatic complexity, naming conventions, and modularity.',
        orderIndex: 2,
        daysOffsetFromStart: 75,
        durationDays: 45,
        status: MilestoneStatus.COMPLETED,
        weight: 3,
      },
      {
        title: 'Context-Aware LLM Formative Feedback Pipeline',
        description: 'Deploy LangChain orchestration providing line-level actionable recommendations without giving answers.',
        orderIndex: 3,
        daysOffsetFromStart: 125,
        durationDays: 50,
        status: MilestoneStatus.COMPLETED,
        weight: 3,
      },
      {
        title: 'Double-Blind Peer Review Calibration and Bias Mitigation',
        description: 'Develop Bayesian grader reliability scoring calibrating student peer review distributions.',
        orderIndex: 4,
        daysOffsetFromStart: 165,
        durationDays: 40,
        status: MilestoneStatus.COMPLETED,
        weight: 2,
      },
      {
        title: 'Institutional Deployment and Final Thesis Defense',
        description: 'Complete capstone dissertation, trial across 2 CS courses, and deliver defense presentation.',
        orderIndex: 5,
        daysOffsetFromStart: 190,
        durationDays: 25,
        status: MilestoneStatus.COMPLETED,
        weight: 2,
      },
    ],
    documents: [
      {
        filename: 'code_assessment_survey.pdf',
        originalName: 'Automated_Code_Assessment_Literature_Review.pdf',
        type: DocumentType.LITERATURE_SURVEY,
        fileSize: 2940000,
        mimeType: 'application/pdf',
        storagePath: '/uploads/documents/code_assessment_survey.pdf',
        version: 1,
        status: DocumentStatus.APPROVED,
        description: 'Review of automated program repair, static analysis, and neural code evaluation benchmarks.',
        milestoneIndex: 0,
      },
      {
        filename: 'ast_rubric_architecture.pdf',
        originalName: 'AST_Rubric_Parser_Architecture.pdf',
        type: DocumentType.SYSTEM_DESIGN,
        fileSize: 3510000,
        mimeType: 'application/pdf',
        storagePath: '/uploads/documents/ast_rubric_architecture.pdf',
        version: 2,
        status: DocumentStatus.APPROVED,
        description: 'Tree-sitter grammar integration and multi-language AST extraction pipeline.',
        milestoneIndex: 1,
      },
      {
        filename: 'rubric_grading_final.pdf',
        originalName: 'Automated_Rubric_Grading_Final.pdf',
        type: DocumentType.FINAL_REPORT,
        fileSize: 6820000,
        mimeType: 'application/pdf',
        storagePath: '/uploads/documents/rubric_grading_final.pdf',
        version: 1,
        status: DocumentStatus.APPROVED,
        description: 'Final thesis documenting 91.2% grader agreement and 4.2x faster turnaround time.',
        milestoneIndex: 4,
      },
      {
        filename: 'edtech_presentation_deck.pdf',
        originalName: 'Academic_Board_Presentation_Deck.pdf',
        type: DocumentType.PRESENTATION,
        fileSize: 5610000,
        mimeType: 'application/pdf',
        storagePath: '/uploads/documents/edtech_presentation_deck.pdf',
        version: 1,
        status: DocumentStatus.APPROVED,
        description: 'Final viva slides presented to the departmental curriculum committee.',
        milestoneIndex: 4,
      },
    ],
    review: {
      rubricScores: [
        { criterion: 'Software Architecture & Code Quality', score: 10, maxScore: 10, comments: 'Exceptionally well-engineered pipeline supporting multiple languages seamlessly.' },
        { criterion: 'Pedagogical Rigor & Feedback Utility', score: 9, maxScore: 10, comments: 'Generative feedback hints effectively guide students without spoiling solution code.' },
        { criterion: 'Empirical Trial & Grader Reliability', score: 9, maxScore: 10, comments: 'Convincing trial across 400 undergraduate students with significant time savings.' },
      ],
      totalScore: 28,
      maxPossibleScore: 30,
      percentage: 93,
      comments:
        'A comprehensive capstone project with tangible educational benefits for our department. The combination of deterministic AST rules and LLM guidance is principled and reliable.',
      recommendations: 'Prepare integration plugin for university Canvas LMS.',
      decision: ReviewDecision.APPROVED,
      version: 1,
      milestoneIndex: 4,
    },
  },

  // 13. Embedded Systems (PENDING)
  {
    code: 'PRJ-2026-023',
    title: 'Lightweight Elliptic Curve Cryptography Hardware Accelerator for RISC-V IoT Nodes',
    domainSlug: 'embedded-systems',
    department: 'Computer Science & Engineering',
    problemStatement:
      'Low-power microcontroller nodes deployed in smart infrastructure cannot execute 256-bit asymmetric cryptography (such as Curve25519 or secp256r1) in software without exhausting clock cycles and triggering thermal throttling. Traditional hardware coprocessors consume excessive FPGA logic cells and gate counts. This capstone designs a minimal area-optimized Montgomery multiplication hardware accelerator integrated via the open-standard RISC-V custom instruction set interface.',
    objectives: [
      'Model 256-bit Montgomery modular multiplication and inversion in SystemVerilog',
      'Synthesize hardware accelerator as a tightly coupled execution unit within a 32-bit RISC-V core',
      'Achieve 10x speedup in ECDSA signature generation while utilizing under 4,500 FPGA LUTs',
    ],
    technologies: ['Verilog', 'SystemVerilog', 'RISC-V (RV32I)', 'Xilinx Vivado', 'Python', 'C'],
    status: ProjectStatus.SUBMITTED,
    progressPercentage: 10,
    ownerEmail: 'student@university.edu',
    collaboratorEmail: 'sofia.rodriguez@university.edu',
    primaryGuideEmail: 'dr.marcus.vance@university.edu',
    coGuideEmail: 'dr.samuel.wright@university.edu',
    guideStatus: GuideRequestStatus.REQUESTED,
    startDaysAgo: 10,
    durationDays: 240,
    repositoryUrl: 'https://github.com/acrm-org/riscv-ecc-accelerator',
    milestones: [
      {
        title: 'Survey of Post-Quantum & Classical ECC Coprocessors',
        description: 'Evaluate gate count benchmarks, power budgets, and timing paths for Curve25519.',
        orderIndex: 1,
        daysOffsetFromStart: 30,
        durationDays: 30,
        status: MilestoneStatus.SUBMITTED,
        weight: 2,
      },
      {
        title: 'Point Multiplication Finite State Machine Architecture',
        description: 'Write SystemVerilog RTL for systolic array Montgomery multiplier with carry-save adders.',
        orderIndex: 2,
        daysOffsetFromStart: 85,
        durationDays: 55,
        status: MilestoneStatus.NOT_STARTED,
        weight: 3,
      },
      {
        title: 'RISC-V Custom Instruction Extension & Pipeline Hook',
        description: 'Decode custom-0 opcode space in RV32I pipeline and implement non-blocking stall logic.',
        orderIndex: 3,
        daysOffsetFromStart: 145,
        durationDays: 60,
        status: MilestoneStatus.NOT_STARTED,
        weight: 3,
      },
      {
        title: 'FPGA Synthesis & Side-Channel Power Analysis',
        description: 'Synthesize onto Xilinx Artix-7 and measure execution timing against simple power analysis.',
        orderIndex: 4,
        daysOffsetFromStart: 195,
        durationDays: 50,
        status: MilestoneStatus.NOT_STARTED,
        weight: 2,
      },
      {
        title: 'Final Thesis Documentation & Silicon Tape-Out Preparation',
        description: 'Complete capstone documentation, formal timing closure reports, and committee defense.',
        orderIndex: 5,
        daysOffsetFromStart: 240,
        durationDays: 45,
        status: MilestoneStatus.NOT_STARTED,
        weight: 2,
      },
    ],
    documents: [
      {
        filename: 'riscv_ecc_charter.pdf',
        originalName: 'RISCV_ECC_Accelerator_Proposal.pdf',
        type: DocumentType.RESEARCH_PROPOSAL,
        fileSize: 1640000,
        mimeType: 'application/pdf',
        storagePath: '/uploads/documents/riscv_ecc_charter.pdf',
        version: 1,
        status: DocumentStatus.SUBMITTED,
        description: 'RTL hardware accelerator proposal and RISC-V custom opcode decoding specification.',
        milestoneIndex: 0,
      },
      {
        filename: 'montgomery_survey.pdf',
        originalName: 'Montgomery_Multiplier_Literature_Review.pdf',
        type: DocumentType.LITERATURE_SURVEY,
        fileSize: 2240000,
        mimeType: 'application/pdf',
        storagePath: '/uploads/documents/montgomery_survey.pdf',
        version: 1,
        status: DocumentStatus.SUBMITTED,
        description: 'Comparative review of Radix-2 and Radix-4 Montgomery multiplication architectures.',
        milestoneIndex: 0,
      },
    ],
  },

  // 14. IoT (UNDER_REVIEW)
  {
    code: 'PRJ-2026-024',
    title: 'LoRa-Mesh Telemetry and Early Warning Disaster Alerting for Rural Flash Floods',
    domainSlug: 'iot',
    department: 'Computer Science & Engineering',
    problemStatement:
      'Mountainous catchment basins and rural riverbanks experience sudden flash floods during monsoon deluges, causing loss of life and livestock before emergency responders can mobilize. Traditional cellular telemetry stations fail during severe storms due to mast power loss and fiber cuts. This project implements a decentralized, self-healing multi-hop LoRa mesh network of river level sensing buoys that relay early warning alerts autonomously even when regional telecom infrastructure collapses.',
    objectives: [
      'Design waterproof solar-harvesting buoys equipped with ultrasonic level gauges and LoRa transceivers',
      'Implement an energy-efficient ad-hoc mesh routing protocol handling dynamic node failures',
      'Demonstrate end-to-end warning dispatch to village siren stations in under 10 seconds across 15km',
    ],
    technologies: ['ESP32', 'LoRa Mesh', 'RadioHead', 'Ultrasonic Sensors', 'C++', 'Node.js', 'WebSockets', 'Leaflet'],
    status: ProjectStatus.UNDER_REVIEW,
    progressPercentage: 30,
    ownerEmail: 'priya.sharma@university.edu',
    collaboratorEmail: 'varunkumard.ec24@bitsathy.ac.in',
    primaryGuideEmail: 'dr.samuel.wright@university.edu',
    guideStatus: GuideRequestStatus.ACCEPTED,
    startDaysAgo: 60,
    durationDays: 190,
    repositoryUrl: 'https://github.com/acrm-org/lora-mesh-flood-warning',
    milestones: [
      {
        title: 'Hydrological Sensor Selection & Waterproof Enclosure Modeling',
        description: 'Model IP68 submersible enclosures and evaluate ultrasonic vs hydrostatic pressure probes.',
        orderIndex: 1,
        daysOffsetFromStart: 25,
        durationDays: 25,
        status: MilestoneStatus.COMPLETED,
        weight: 2,
      },
      {
        title: 'Dynamic Mesh Ad-Hoc Routing Firmware in C++',
        description: 'Implement modified flooding mesh routing protocol with sequence-based deduplication.',
        orderIndex: 2,
        daysOffsetFromStart: 60,
        durationDays: 35,
        status: MilestoneStatus.COMPLETED,
        weight: 3,
      },
      {
        title: 'Cellular Gateway Fallback & Emergency Alert Dispatcher',
        description: 'Deploy 4G LTE gateway node with offline GSM broadcast and audible relay alarm triggers.',
        orderIndex: 3,
        daysOffsetFromStart: 110,
        durationDays: 50,
        status: MilestoneStatus.IN_PROGRESS,
        weight: 3,
      },
      {
        title: 'Stream Inundation Field Simulation & Packet Loss Trial',
        description: 'Deploy 6-node test mesh along river tributary and measure packet delivery ratio during heavy rain.',
        orderIndex: 4,
        daysOffsetFromStart: 155,
        durationDays: 45,
        status: MilestoneStatus.NOT_STARTED,
        weight: 2,
      },
      {
        title: 'Civil Defense Presentation & Final Thesis Defense',
        description: 'Demonstrate live alerting to municipal disaster management committee and deliver thesis.',
        orderIndex: 5,
        daysOffsetFromStart: 190,
        durationDays: 35,
        status: MilestoneStatus.NOT_STARTED,
        weight: 2,
      },
    ],
    documents: [
      {
        filename: 'flood_mesh_survey.pdf',
        originalName: 'LoRa_Mesh_Watershed_Telemetry.pdf',
        type: DocumentType.LITERATURE_SURVEY,
        fileSize: 2520000,
        mimeType: 'application/pdf',
        storagePath: '/uploads/documents/flood_mesh_survey.pdf',
        version: 1,
        status: DocumentStatus.APPROVED,
        description: 'Survey of multi-hop ad-hoc wireless mesh routing algorithms in disaster telemetry.',
        milestoneIndex: 0,
      },
      {
        filename: 'sensor_array_schematic.pdf',
        originalName: 'Hydrological_Sensor_Array_Schematic.pdf',
        type: DocumentType.SYSTEM_DESIGN,
        fileSize: 3210000,
        mimeType: 'application/pdf',
        storagePath: '/uploads/documents/sensor_array_schematic.pdf',
        version: 1,
        status: DocumentStatus.SUBMITTED,
        description: 'Buoy mechanical assembly, battery charging circuit, and ultrasonic sensor mounting.',
        milestoneIndex: 1,
      },
    ],
    review: {
      rubricScores: [
        { criterion: 'Mesh Networking & Ad-Hoc Protocol Design', score: 8, maxScore: 10, comments: 'Good deduplication logic; check collision probability under high alerting node count.' },
        { criterion: 'Hardware Reliability & Weatherproofing', score: 7, maxScore: 10, comments: 'Provide empirical evidence of IP68 sealing under continuous submersion pressure.' },
        { criterion: 'Civilian Impact & Disaster Protocol Compliance', score: 7, maxScore: 10, comments: 'Ensure siren trigger protocols align with National Disaster Management guidelines.' },
      ],
      totalScore: 22,
      maxPossibleScore: 30,
      percentage: 73,
      comments:
        'Commendable social impact focus. The multi-hop mesh routing works well on paper, but solar battery resilience during consecutive overcast days must be empirically tested before field deployment.',
      recommendations: 'Recalculate battery sizing to guarantee 7 days of continuous operation without solar recharge.',
      decision: ReviewDecision.CHANGES_REQUESTED,
      version: 1,
      milestoneIndex: 1,
    },
  },

  // 15. Renewable Energy / Wind (IN_PROGRESS)
  {
    code: 'PRJ-2026-025',
    title: 'Offshore Wind Turbine Blade Structural Defect Detection via Acoustic Emission Transformers',
    domainSlug: 'renewable-energy',
    department: 'Data Science & Artificial Intelligence',
    problemStatement:
      'Offshore wind turbines operate under severe aerodynamic stress, salt-spray corrosion, and turbulence, making blade structural delamination and micro-cracking catastrophic if unaddressed. Inspecting offshore blades via rope access or drones requires calm sea conditions and incurs massive operational expenditure. This research develops a continuous non-destructive structural health monitoring system utilizing piezoelectric acoustic emission sensors and Audio Spectrogram Transformers.',
    objectives: [
      'Record high-frequency acoustic emission stress wave signatures from composite fiberglass blade specimens',
      'Transform time-domain transient bursts into continuous wavelet transform (CWT) scalograms',
      'Train an Audio Spectrogram Transformer (AST) classifying fatigue delamination with 92%+ accuracy',
    ],
    technologies: ['Python', 'PyTorch', 'Librosa', 'Spectrogram Transformers', 'C++', 'Edge Impulse', 'AWS S3'],
    status: ProjectStatus.IN_PROGRESS,
    progressPercentage: 75,
    ownerEmail: 'marcus.chen@university.edu',
    collaboratorEmail: 'student@university.edu',
    primaryGuideEmail: 'dr.david.miller@university.edu',
    guideStatus: GuideRequestStatus.ACCEPTED,
    startDaysAgo: 150,
    durationDays: 210,
    repositoryUrl: 'https://github.com/acrm-org/wind-turbine-acoustic-defect-ai',
    milestones: [
      {
        title: 'Synthetic & Lab Wind Turbine Blade Acoustic Dataset Assembly',
        description: 'Subject composite fiberglass test coupons to cyclic three-point bending fatigue tests.',
        orderIndex: 1,
        daysOffsetFromStart: 35,
        durationDays: 35,
        status: MilestoneStatus.COMPLETED,
        weight: 2,
      },
      {
        title: 'Time-Frequency Wavelet Spectrogram Generation Pipeline',
        description: 'Compute continuous Morlet wavelet transforms capturing transient crack propagation waves.',
        orderIndex: 2,
        daysOffsetFromStart: 80,
        durationDays: 45,
        status: MilestoneStatus.COMPLETED,
        weight: 3,
      },
      {
        title: 'Audio Spectrogram Transformer (AST) Fine-Tuning',
        description: 'Train patch-based attention network discriminating between background aerodynamic noise and cracks.',
        orderIndex: 3,
        daysOffsetFromStart: 135,
        durationDays: 55,
        status: MilestoneStatus.COMPLETED,
        weight: 3,
      },
      {
        title: 'Embedded Micro-Acoustic Sensor Benchmarking in Wind Tunnel',
        description: 'Validate edge classifier latency on sub-scale wind turbine model in university wind tunnel.',
        orderIndex: 4,
        daysOffsetFromStart: 180,
        durationDays: 45,
        status: MilestoneStatus.IN_PROGRESS,
        weight: 2,
      },
      {
        title: 'Final Thesis Defense & Renewable Energy Journal Manuscript',
        description: 'Compile capstone dissertation, IEEE Transactions paper draft, and panel defense.',
        orderIndex: 5,
        daysOffsetFromStart: 210,
        durationDays: 30,
        status: MilestoneStatus.NOT_STARTED,
        weight: 2,
      },
    ],
    documents: [
      {
        filename: 'acoustic_ndt_survey.pdf',
        originalName: 'Acoustic_Blade_Defect_Analysis.pdf',
        type: DocumentType.LITERATURE_SURVEY,
        fileSize: 3620000,
        mimeType: 'application/pdf',
        storagePath: '/uploads/documents/acoustic_ndt_survey.pdf',
        version: 1,
        status: DocumentStatus.APPROVED,
        description: 'Survey of acoustic emission testing, piezoelectric sensing, and deep spectrogram analysis.',
        milestoneIndex: 0,
      },
      {
        filename: 'piezoelectric_sensor_arch.pdf',
        originalName: 'Piezoelectric_Sensor_Array_Architecture.pdf',
        type: DocumentType.SYSTEM_DESIGN,
        fileSize: 4210000,
        mimeType: 'application/pdf',
        storagePath: '/uploads/documents/piezoelectric_sensor_arch.pdf',
        version: 1,
        status: DocumentStatus.APPROVED,
        description: 'Detailed sensor placement schematic along blade span, preamp filters, and ADC sampling rates.',
        milestoneIndex: 1,
      },
      {
        filename: 'fatigue_crack_results.pdf',
        originalName: 'Fatigue_Crack_Classification_Benchmark.pdf',
        type: DocumentType.PROGRESS_REPORT,
        fileSize: 3050000,
        mimeType: 'application/pdf',
        storagePath: '/uploads/documents/fatigue_crack_results.pdf',
        version: 1,
        status: DocumentStatus.APPROVED,
        description: 'Evaluation results showing 93.4% classification accuracy across fiber breakage vs matrix cracking.',
        milestoneIndex: 2,
      },
    ],
    review: {
      rubricScores: [
        { criterion: 'Non-Destructive Testing & Acoustic Physics', score: 10, maxScore: 10, comments: 'Rigorous understanding of stress wave attenuation and dispersion in composite laminates.' },
        { criterion: 'Deep Learning Model Performance', score: 9, maxScore: 10, comments: 'Audio Spectrogram Transformer demonstrates excellent noise immunity against wind shear.' },
        { criterion: 'Wind Tunnel Experimental Setup', score: 9, maxScore: 10, comments: 'Well-calibrated experimental rig with proper baseline background noise cancellation.' },
      ],
      totalScore: 28,
      maxPossibleScore: 30,
      percentage: 93,
      comments:
        'Outstanding interdisciplinary project bridging mechanical structural testing and modern transformer architectures. The acoustic classification accuracy significantly exceeds industrial benchmarks.',
      recommendations: 'Explore quantization for deployment on low-cost ARM Cortex-M7 edge nodes.',
      decision: ReviewDecision.APPROVED,
      version: 1,
      milestoneIndex: 2,
    },
  },
];

// Student profile metadata mapping for existing student accounts
const STUDENT_PROFILE_DATA: Record<string, { studentId: string; department: string; program: string; yearOfStudy: number; cgpa: number; researchInterests: string[]; bio: string }> = {
  'student@university.edu': {
    studentId: 'ACR-2024-CS-042',
    department: 'Computer Science & Engineering',
    program: 'Bachelor of Technology in CS',
    yearOfStudy: 4,
    cgpa: 8.92,
    researchInterests: ['Artificial Intelligence', 'Natural Language Processing', 'Healthcare Technology'],
    bio: 'Final year undergraduate exploring transformer architectures, federated edge learning, and automated campus systems.',
  },
  'priya.sharma@university.edu': {
    studentId: 'ACR-2024-CS-088',
    department: 'Computer Science & Engineering',
    program: 'Bachelor of Technology in CS',
    yearOfStudy: 4,
    cgpa: 9.15,
    researchInterests: ['Distributed Systems', 'Cloud Computing', 'Reinforcement Learning', 'IoT'],
    bio: 'Passionate about high-throughput distributed database engines, multi-agent reinforcement learning, and fault-tolerant mesh networks.',
  },
  'marcus.chen@university.edu': {
    studentId: 'ACR-2024-DS-015',
    department: 'Data Science & Artificial Intelligence',
    program: 'Bachelor of Science in Data Science',
    yearOfStudy: 3,
    cgpa: 8.65,
    researchInterests: ['Machine Learning', 'Predictive Analytics', 'Educational Technology', 'Renewable Energy'],
    bio: 'Working on deep cognitive skill modeling, acoustic spectrogram transformers, and automated educational analytics.',
  },
  'sofia.rodriguez@university.edu': {
    studentId: 'ACR-2024-EC-029',
    department: 'Electronics & Communication Engineering',
    program: 'Bachelor of Technology in ECE',
    yearOfStudy: 4,
    cgpa: 8.78,
    researchInterests: ['Internet of Things', 'Smart Agriculture', 'Embedded Systems', 'Sensor Networks'],
    bio: 'Specializing in edge telemetry, ultra-low-power RTOS kernels, micro-irrigation sensors, and wireless sensor networking.',
  },
  'liam.oconnor@university.edu': {
    studentId: 'ACR-2024-CY-011',
    department: 'Cybersecurity & Information Security',
    program: 'Bachelor of Technology in Cybersecurity',
    yearOfStudy: 3,
    cgpa: 8.45,
    researchInterests: ['Cybersecurity', 'Zero Trust', 'Smart Contract Auditing', 'Kernel Security'],
    bio: 'Enthusiastic about zero-trust security architectures, eBPF telemetry, and formal verification of EVM smart contracts.',
  },
  'varunkumard.ec24@bitsathy.ac.in': {
    studentId: 'ACR-2024-EC-024',
    department: 'Electronics & Communication Engineering',
    program: 'Bachelor of Technology in ECE',
    yearOfStudy: 4,
    cgpa: 9.05,
    researchInterests: ['Renewable Energy', 'Power Electronics', 'Smart Grids', 'Edge Computing'],
    bio: 'Dedicated researcher developing MPPT solar inverter hardware, microgrid islanding controllers, and industrial telemetry systems.',
  },
};

export async function seedProjects(): Promise<void> {
  console.log('[Seed Projects] Connecting to MongoDB...');
  await connectDB();
  console.log('[Seed Projects] Connected successfully.');

  // 1. Ensure Student Profiles for existing student accounts
  console.log('[Seed Projects] Verifying student profiles...');
  for (const [email, profileInfo] of Object.entries(STUDENT_PROFILE_DATA)) {
    const user = await User.findOne({ email }).lean();
    if (user) {
      const existingProfile = await StudentProfile.findOne({ userId: user._id });
      if (!existingProfile) {
        await StudentProfile.create({
          userId: user._id,
          studentId: profileInfo.studentId,
          department: profileInfo.department,
          program: profileInfo.program,
          yearOfStudy: profileInfo.yearOfStudy,
          cgpa: profileInfo.cgpa,
          researchInterests: profileInfo.researchInterests,
          bio: profileInfo.bio,
        });
        console.log(`  + Created StudentProfile for ${email} (${profileInfo.studentId})`);
      } else {
        console.log(`  ✓ StudentProfile already exists for ${email} (${existingProfile.studentId})`);
      }
    }
  }

  // 2. Cache Research Domains by slug
  const allDomains = await ResearchDomain.find({}).lean();
  const domainMap = new Map<string, any>();
  for (const d of allDomains) {
    domainMap.set(d.slug, d);
  }

  // 3. Cache Users by email
  const allUsers = await User.find({}).lean();
  const userMap = new Map<string, any>();
  for (const u of allUsers) {
    userMap.set(u.email.toLowerCase(), u);
  }

  console.log(`[Seed Projects] Seeding ${SAMPLE_PROJECTS.length} sample research projects...`);
  let createdCount = 0;
  let skippedCount = 0;

  for (const spec of SAMPLE_PROJECTS) {
    // Check if project already exists (idempotency key: code)
    let project = await Project.findOne({ code: spec.code });
    const isNew = !project;

    const ownerUser = userMap.get(spec.ownerEmail.toLowerCase());
    if (!ownerUser) {
      console.warn(`[Warning] Owner user with email ${spec.ownerEmail} not found in database. Skipping ${spec.code}.`);
      continue;
    }

    const domainDoc = domainMap.get(spec.domainSlug);
    if (!domainDoc) {
      console.warn(`[Warning] Research domain with slug ${spec.domainSlug} not found. Skipping ${spec.code}.`);
      continue;
    }

    const primaryGuideUser = userMap.get(spec.primaryGuideEmail.toLowerCase());
    if (!primaryGuideUser) {
      console.warn(`[Warning] Primary guide ${spec.primaryGuideEmail} not found. Skipping ${spec.code}.`);
      continue;
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - spec.startDaysAgo);

    const expectedCompletionDate = new Date(startDate);
    expectedCompletionDate.setDate(expectedCompletionDate.getDate() + spec.durationDays);

    let actualCompletionDate: Date | undefined = undefined;
    if (spec.status === ProjectStatus.COMPLETED) {
      actualCompletionDate = new Date(startDate);
      actualCompletionDate.setDate(actualCompletionDate.getDate() + spec.durationDays);
    }

    if (!project) {
      project = await Project.create({
        code: spec.code,
        title: spec.title,
        domainId: domainDoc._id,
        department: spec.department,
        problemStatement: spec.problemStatement,
        objectives: spec.objectives,
        technologies: spec.technologies,
        status: spec.status,
        progressPercentage: spec.progressPercentage,
        ownerId: ownerUser._id,
        startDate,
        expectedCompletionDate,
        actualCompletionDate,
        repositoryUrl: spec.repositoryUrl,
        isPublic: true,
      });
      createdCount++;
      console.log(`  + Created Project: [${project.code}] "${project.title}" (Status: ${project.status})`);
    } else {
      skippedCount++;
      console.log(`  ✓ Project already exists: [${project.code}] "${project.title}" (Idempotent: Preserving)`);
    }

    // 4. Ensure Project Members
    // Owner
    const existingOwnerMember = await ProjectMember.findOne({ projectId: project._id, studentId: ownerUser._id });
    if (!existingOwnerMember) {
      await ProjectMember.create({
        projectId: project._id,
        studentId: ownerUser._id,
        role: 'OWNER',
        status: 'ACCEPTED',
        joinedAt: startDate,
        invitedBy: ownerUser._id,
      });
    }

    // Collaborator
    if (spec.collaboratorEmail) {
      const collabUser = userMap.get(spec.collaboratorEmail.toLowerCase());
      if (collabUser) {
        const existingCollab = await ProjectMember.findOne({ projectId: project._id, studentId: collabUser._id });
        if (!existingCollab) {
          await ProjectMember.create({
            projectId: project._id,
            studentId: collabUser._id,
            role: 'MEMBER',
            status: 'ACCEPTED',
            joinedAt: new Date(startDate.getTime() + 2 * 24 * 60 * 60 * 1000),
            invitedBy: ownerUser._id,
          });
        }
      }
    }

    // 5. Ensure Project Guides
    // Primary Guide
    const existingPrimaryGuide = await ProjectGuide.findOne({ projectId: project._id, facultyId: primaryGuideUser._id });
    if (!existingPrimaryGuide) {
      await ProjectGuide.create({
        projectId: project._id,
        facultyId: primaryGuideUser._id,
        role: GuideRole.PRIMARY_GUIDE,
        status: spec.guideStatus,
        requestedAt: new Date(startDate.getTime() + 1 * 24 * 60 * 60 * 1000),
        respondedAt: spec.guideStatus === GuideRequestStatus.ACCEPTED ? new Date(startDate.getTime() + 2 * 24 * 60 * 60 * 1000) : undefined,
        notes: spec.guideStatus === GuideRequestStatus.ACCEPTED ? 'Faculty mentorship request formally approved.' : '',
      });
    }

    // Co-Guide
    if (spec.coGuideEmail) {
      const coGuideUser = userMap.get(spec.coGuideEmail.toLowerCase());
      if (coGuideUser) {
        const existingCoGuide = await ProjectGuide.findOne({ projectId: project._id, facultyId: coGuideUser._id });
        if (!existingCoGuide) {
          await ProjectGuide.create({
            projectId: project._id,
            facultyId: coGuideUser._id,
            role: GuideRole.CO_GUIDE,
            status: spec.guideStatus,
            requestedAt: new Date(startDate.getTime() + 1 * 24 * 60 * 60 * 1000),
            respondedAt: spec.guideStatus === GuideRequestStatus.ACCEPTED ? new Date(startDate.getTime() + 2 * 24 * 60 * 60 * 1000) : undefined,
            notes: spec.guideStatus === GuideRequestStatus.ACCEPTED ? 'Approved as faculty co-guide.' : '',
          });
        }
      }
    }

    // 6. Ensure Milestones
    const createdMilestones: any[] = [];
    for (const mSpec of spec.milestones) {
      let milestone = await Milestone.findOne({ projectId: project._id, orderIndex: mSpec.orderIndex });
      if (!milestone) {
        const dueDate = new Date(startDate);
        dueDate.setDate(dueDate.getDate() + mSpec.daysOffsetFromStart);

        let completionDate: Date | undefined = undefined;
        if (mSpec.status === MilestoneStatus.COMPLETED) {
          completionDate = new Date(dueDate);
          completionDate.setDate(completionDate.getDate() - 2);
        }

        milestone = await Milestone.create({
          projectId: project._id,
          title: mSpec.title,
          description: mSpec.description,
          orderIndex: mSpec.orderIndex,
          dueDate,
          completionDate,
          status: mSpec.status,
          assignedMemberIds: [ownerUser._id],
          weight: mSpec.weight,
        });
      }
      createdMilestones.push(milestone);
    }

    // 7. Ensure Documents
    for (const dSpec of spec.documents) {
      const existingDoc = await DocumentModel.findOne({ projectId: project._id, filename: dSpec.filename });
      if (!existingDoc) {
        const milestoneId =
          dSpec.milestoneIndex !== undefined && createdMilestones[dSpec.milestoneIndex]
            ? createdMilestones[dSpec.milestoneIndex]._id
            : undefined;

        await DocumentModel.create({
          projectId: project._id,
          milestoneId,
          filename: dSpec.filename,
          originalName: dSpec.originalName,
          type: dSpec.type,
          fileSize: dSpec.fileSize,
          mimeType: dSpec.mimeType,
          storagePath: dSpec.storagePath,
          version: dSpec.version,
          uploadedBy: ownerUser._id,
          status: dSpec.status,
          description: dSpec.description,
        });
      }
    }

    // 8. Ensure Feedback Comments
    if (spec.comments && spec.comments.length > 0) {
      for (const cSpec of spec.comments) {
        const authorId = cSpec.authorType === 'FACULTY' ? primaryGuideUser._id : ownerUser._id;
        const existingComment = await Comment.findOne({ projectId: project._id, authorId, content: cSpec.content });
        if (!existingComment) {
          await Comment.create({
            projectId: project._id,
            authorId,
            content: cSpec.content,
            status: cSpec.isResolved ? 'RESOLVED' : 'OPEN',
            resolvedBy: cSpec.isResolved ? primaryGuideUser._id : undefined,
            resolvedAt: cSpec.isResolved ? new Date() : undefined,
          });
        }
      }
    }

    // 9. Ensure Faculty Rubric Review
    if (spec.review) {
      const existingReview = await Review.findOne({ projectId: project._id, reviewerId: primaryGuideUser._id });
      if (!existingReview) {
        const milestoneId =
          spec.review.milestoneIndex !== undefined && createdMilestones[spec.review.milestoneIndex]
            ? createdMilestones[spec.review.milestoneIndex]._id
            : undefined;

        await Review.create({
          projectId: project._id,
          reviewerId: primaryGuideUser._id,
          milestoneId,
          rubricScores: spec.review.rubricScores,
          totalScore: spec.review.totalScore,
          maxPossibleScore: spec.review.maxPossibleScore,
          percentage: spec.review.percentage,
          comments: spec.review.comments,
          recommendations: spec.review.recommendations,
          decision: spec.review.decision,
          version: spec.review.version,
        });
      }
    }
  }

  console.log('\n======================================================');
  console.log(`[Seed Complete] 15 Sample Projects Processed!`);
  console.log(`  Newly Created: ${createdCount}`);
  console.log(`  Already Existed: ${skippedCount}`);
  console.log('======================================================\n');
}

// Allow direct CLI execution
if (process.env.NODE_ENV !== 'test') {
  seedProjects()
    .then(async () => {
      console.log('[Seed Projects] Operation completed successfully.');
      await disconnectDB();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('[Seed Projects] Operation failed:', err);
      await disconnectDB();
      process.exit(1);
    });
}
