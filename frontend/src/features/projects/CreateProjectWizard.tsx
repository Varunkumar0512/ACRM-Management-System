import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { projectApi } from '../../services/api/projectApi';
import { researchApi } from '../../services/api/researchApi';
import { facultyApi } from '../../services/api/otherApis';
import { IResearchDomain, IFacultyProfile } from '../../types';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../hooks/useToast';
import {
  Check,
  ArrowRight,
  ArrowLeft,
  Save,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  Edit3,
  Users,
  GraduationCap,
  FileText,
  Calendar,
  Layers,
} from 'lucide-react';

const STEPS = [
  'Project Info',
  'Research Domain',
  'Problem Statement',
  'Objectives',
  'Technologies',
  'Team Members',
  'Faculty Guide',
  'Review & Finalize',
];

export const CreateProjectWizard: React.FC = () => {
  const [searchParams] = useSearchParams();
  const ideaId = searchParams.get('ideaId');
  const draftId = searchParams.get('draftId');
  const navigate = useNavigate();
  const toast = useToast();

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [domains, setDomains] = useState<IResearchDomain[]>([]);
  const [facultyGuides, setFacultyGuides] = useState<IFacultyProfile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [createdProject, setCreatedProject] = useState<any>(null);

  // Form State (persists throughout all wizard steps)
  const [formData, setFormData] = useState({
    draftId: draftId || '',
    title: '',
    department: 'Computer Science & Engineering',
    domainId: '',
    problemStatement: '',
    objectives: [
      'Establish baseline literature survey',
      'Develop algorithmic prototype',
      'Perform empirical validation',
    ],
    technologies: ['React', 'TypeScript', 'Node.js', 'Python'],
    expectedCompletionDate: '',
    repositoryUrl: '',
    isPublic: true,
    fromProjectIdeaId: ideaId || '',
    facultyGuideId: '',
    coGuideId: '',
    teamMemberEmails: '',
  });

  const [newObjective, setNewObjective] = useState('');
  const [newTech, setNewTech] = useState('');

  // Load research domains & available faculty guides
  useEffect(() => {
    researchApi
      .getDomains()
      .then(setDomains)
      .catch(() => {});
    facultyApi
      .listFaculty({ availableOnly: true })
      .then((data) => setFacultyGuides(data.profiles || []))
      .catch(() => {});

    // If resuming from a saved Draft
    if (draftId) {
      projectApi
        .getWorkspace(draftId)
        .then((workspace) => {
          const p = workspace.project;
          if (p) {
            const primaryG = (workspace.guides || []).find((g: any) => g.role === 'PRIMARY_GUIDE');
            const coG = (workspace.guides || []).find((g: any) => g.role === 'CO_GUIDE');
            const memberEmails = (workspace.members || [])
              .filter((m: any) => m.role !== 'OWNER')
              .map((m: any) => m.studentId?.email || m.studentId?.studentId || '')
              .filter(Boolean);

            setFormData((prev) => ({
              ...prev,
              draftId: p._id,
              title: p.title || '',
              department: p.department || prev.department,
              domainId: p.domainId?._id || p.domainId || '',
              problemStatement: p.problemStatement || '',
              objectives: p.objectives?.length ? p.objectives : prev.objectives,
              technologies: p.technologies?.length ? p.technologies : prev.technologies,
              expectedCompletionDate: p.expectedCompletionDate ? p.expectedCompletionDate.split('T')[0] : '',
              repositoryUrl: p.repositoryUrl || '',
              isPublic: p.isPublic ?? true,
              fromProjectIdeaId: p.fromProjectIdeaId?._id || p.fromProjectIdeaId || '',
              facultyGuideId: primaryG?.facultyId?._id || primaryG?.facultyId || '',
              coGuideId: coG?.facultyId?._id || coG?.facultyId || '',
              teamMemberEmails: memberEmails.join(', '),
            }));
            toast.info(`Loaded draft proposal for "${p.title}".`);
          }
        })
        .catch(() => {
          toast.error('Failed to load draft proposal workspace.');
        });
    }
    // If pre-populating from curated Idea
    else if (ideaId) {
      researchApi.getProjectIdeas().then((res) => {
        const match = (res.ideas || []).find((i: any) => i._id === ideaId);
        if (match) {
          setFormData((prev) => ({
            ...prev,
            title: match.title,
            domainId: match.domainId?._id || match.domainId,
            problemStatement: match.problemStatement,
            objectives: match.objectives?.length ? match.objectives : prev.objectives,
            technologies: match.technologies?.length ? match.technologies : prev.technologies,
            fromProjectIdeaId: match._id,
          }));
          toast.info('Project proposal pre-populated from curated idea catalog.');
        }
      });
    }
  }, [ideaId, draftId]);

  // Client-side Step Validation
  const validateStep = (stepIdx: number, isSubmittingFinal = false): boolean => {
    setErrorMessage(null);
    setFieldErrors({});

    if (stepIdx === 0) {
      if (!formData.title || formData.title.trim().length < 3) {
        setErrorMessage('Project title must be at least 3 characters long.');
        setFieldErrors({ title: 'Title must be at least 3 characters long.' });
        return false;
      }
      if (!formData.department) {
        setErrorMessage('Please select an Academic Department.');
        setFieldErrors({ department: 'Academic Department is required.' });
        return false;
      }
    } else if (stepIdx === 1) {
      if (!formData.domainId) {
        setErrorMessage('Please select a Research Domain from the institutional taxonomy.');
        setFieldErrors({ domainId: 'Research domain selection is required.' });
        return false;
      }
    } else if (stepIdx === 2) {
      if (!formData.problemStatement || formData.problemStatement.trim().length < 20) {
        setErrorMessage('Problem statement must be comprehensive (at least 20 characters).');
        setFieldErrors({
          problemStatement: 'Problem statement must be at least 20 characters long.',
        });
        return false;
      }
    } else if (stepIdx === 3) {
      const validObjs = formData.objectives.filter((o) => o.trim().length >= 3);
      if (validObjs.length === 0) {
        setErrorMessage('At least one concrete project objective (min 3 characters) is required.');
        setFieldErrors({ objectives: 'At least one objective is required.' });
        return false;
      }
    } else if (stepIdx === 4) {
      if (formData.technologies.length === 0) {
        setErrorMessage('At least one technology or architectural tool is required.');
        setFieldErrors({ technologies: 'At least one technology is required.' });
        return false;
      }
    } else if (stepIdx === 6 && isSubmittingFinal) {
      if (!formData.facultyGuideId) {
        setErrorMessage('Please select a Primary Faculty Guide from the faculty directory before final submission.');
        setFieldErrors({ facultyGuideId: 'Primary Faculty Guide is required for formal submission.' });
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep, false)) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    }
  };

  const handlePrevious = () => {
    setErrorMessage(null);
    setFieldErrors({});
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  // Helper to extract clean error feedback
  const handleApiError = (err: any, fallbackMessage: string) => {
    const errorData = err.response?.data?.error;
    if (errorData?.fields && Object.keys(errorData.fields).length > 0) {
      setFieldErrors(errorData.fields);
      const fieldList = Object.entries(errorData.fields)
        .map(([f, msg]) => `• ${f}: ${msg}`)
        .join('\n');
      setErrorMessage(`Please check the following fields before proceeding:\n${fieldList}`);
      toast.error('Validation error. Please review your entries.');
      return;
    }

    if (errorData?.details && typeof errorData.details === 'object') {
      const fieldEntries: Record<string, string> = {};
      const lines: string[] = [];
      for (const [k, v] of Object.entries(errorData.details)) {
        const msg = Array.isArray(v) ? v[0] : String(v);
        fieldEntries[k] = msg;
        lines.push(`• ${k}: ${msg}`);
      }
      setFieldErrors(fieldEntries);
      setErrorMessage(`Validation failed:\n${lines.join('\n')}`);
      toast.error('Validation error. Please check highlighted fields.');
      return;
    }

    setErrorMessage(errorData?.message || fallbackMessage);
    toast.error(errorData?.message || fallbackMessage);
  };

  const handleSaveDraft = async () => {
    if (!formData.title || formData.title.trim().length < 1) {
      setErrorMessage('Project Title is required to save a draft.');
      toast.error('Please enter a project title before saving draft.');
      setCurrentStep(0);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setFieldErrors({});

    try {
      const payload: any = {
        title: formData.title.trim(),
        department: formData.department,
        domainId: formData.domainId || undefined,
        problemStatement: formData.problemStatement || undefined,
        objectives: formData.objectives,
        technologies: formData.technologies,
        expectedCompletionDate: formData.expectedCompletionDate || undefined,
        repositoryUrl: formData.repositoryUrl || undefined,
        isPublic: formData.isPublic,
        fromProjectIdeaId: formData.fromProjectIdeaId || undefined,
        facultyGuideId: formData.facultyGuideId || undefined,
        coGuideId: formData.coGuideId || undefined,
        teamMemberEmails: formData.teamMemberEmails || undefined,
        asDraft: true,
      };

      if (formData.draftId) {
        payload.draftId = formData.draftId;
      }

      const project = await projectApi.createProject(payload);
      toast.success('Project proposal draft saved successfully.');
      navigate(`/projects/${project._id}`);
    } catch (err: any) {
      handleApiError(err, 'Failed to save project draft.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitFinal = async () => {
    // Run full client-side validation across all steps
    for (let i = 0; i < STEPS.length - 1; i++) {
      if (!validateStep(i, true)) {
        setCurrentStep(i);
        toast.error(`Step ${i + 1} (${STEPS[i]}) contains incomplete required specifications.`);
        return;
      }
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setFieldErrors({});

    try {
      const payload: any = {
        title: formData.title.trim(),
        department: formData.department.trim(),
        domainId: formData.domainId,
        problemStatement: formData.problemStatement.trim(),
        objectives: formData.objectives.filter((o) => o.trim().length >= 3),
        technologies: formData.technologies.filter((t) => t.trim().length >= 1),
        expectedCompletionDate: formData.expectedCompletionDate || undefined,
        repositoryUrl: formData.repositoryUrl ? formData.repositoryUrl.trim() : '',
        isPublic: formData.isPublic,
        fromProjectIdeaId: formData.fromProjectIdeaId || undefined,
        facultyGuideId: formData.facultyGuideId || undefined,
        coGuideId: formData.coGuideId || undefined,
        teamMemberEmails: formData.teamMemberEmails ? formData.teamMemberEmails.trim() : undefined,
        asDraft: false,
      };

      if (formData.draftId) {
        payload.draftId = formData.draftId;
      }

      const project = await projectApi.createProject(payload);
      setCreatedProject(project);
      setIsSubmitted(true);
      toast.success('Project proposal successfully submitted for institutional review!');
    } catch (err: any) {
      handleApiError(err, 'Project proposal submission failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addObjective = () => {
    if (newObjective.trim()) {
      setFormData({ ...formData, objectives: [...formData.objectives, newObjective.trim()] });
      setNewObjective('');
    }
  };

  const removeObjective = (idx: number) => {
    setFormData({ ...formData, objectives: formData.objectives.filter((_, i) => i !== idx) });
  };

  const addTech = () => {
    if (newTech.trim()) {
      setFormData({ ...formData, technologies: [...formData.technologies, newTech.trim()] });
      setNewTech('');
    }
  };

  const removeTech = (idx: number) => {
    setFormData({ ...formData, technologies: formData.technologies.filter((_, i) => i !== idx) });
  };

  // If successfully submitted, display final completion screen
  if (isSubmitted) {
    return (
      <div style={{ maxWidth: '720px', margin: '2rem auto', textAlign: 'center', padding: '3rem 1.5rem' }}>
        <div className="acr-card acr-card-body" style={{ padding: '3rem 2rem' }}>
          <CheckCircle2 size={56} color="#059669" style={{ margin: '0 auto 1.25rem' }} />
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Project Proposal Submitted Successfully!
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '520px', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
            Your research proposal for <strong>"{createdProject?.title}"</strong> has been registered with reference code{' '}
            <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary-700)' }}>
              {createdProject?.code}
            </strong>
            . Mentorship notifications have been dispatched to your faculty guide.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Button variant="primary" onClick={() => navigate(`/projects/${createdProject?._id}`)}>
              <span>Enter Project Workspace</span>
              <ArrowRight size={16} />
            </Button>
            <Button variant="secondary" onClick={() => navigate('/projects?filter=my')}>
              View My Projects
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '920px', margin: '0 auto', paddingBottom: '3rem' }}>
      <Breadcrumbs
        items={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Projects', path: '/projects?filter=my' },
          { label: formData.draftId ? 'Edit Project Draft' : 'Create Research Project' },
        ]}
      />

      {/* Header & Quick Action */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Project Proposal Wizard
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Structured 8-step academic proposal lifecycle adhering to institutional standards
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={handleSaveDraft}
          isLoading={isSubmitting}
          icon={<Save size={14} />}
        >
          Save as Draft
        </Button>
      </div>

      {/* Stepper Progress Bar (8 Formulation Steps) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '2rem',
          padding: '1rem 0',
          borderBottom: '1px solid var(--border-subtle)',
          overflowX: 'auto',
          gap: '0.5rem',
        }}
      >
        {STEPS.map((stepName, idx) => {
          const isDone = currentStep > idx;
          const isCurrent = currentStep === idx;
          return (
            <div
              key={idx}
              onClick={() => {
                // Allow direct step navigation to previously completed steps
                if (idx < currentStep) setCurrentStep(idx);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                opacity: isCurrent || isDone ? 1 : 0.45,
                whiteSpace: 'nowrap',
                cursor: idx < currentStep ? 'pointer' : 'default',
              }}
            >
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  background: isDone ? '#059669' : isCurrent ? 'var(--primary-600)' : 'var(--bg-muted)',
                  color: isDone || isCurrent ? '#ffffff' : 'var(--text-muted)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isDone ? <Check size={14} /> : idx + 1}
              </div>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: isCurrent ? 700 : 500,
                  color: isCurrent ? 'var(--text-primary)' : 'var(--text-muted)',
                }}
              >
                {stepName}
              </span>
              {idx < STEPS.length - 1 && <span style={{ color: 'var(--border-default)', margin: '0 0.15rem' }}>›</span>}
            </div>
          );
        })}
      </div>

      {/* Validation Error Banner */}
      {errorMessage && (
        <div
          style={{
            padding: '1rem 1.25rem',
            backgroundColor: 'var(--danger-bg)',
            border: '1px solid var(--danger-border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--danger-text)',
            fontSize: '0.8125rem',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>
            <AlertCircle size={18} />
            <span>Proposal Validation Message</span>
          </div>
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5, paddingLeft: '1.6rem' }}>
            {errorMessage}
          </div>
        </div>
      )}

      {/* Step Contents Card */}
      <div className="acr-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        {/* STEP 1: Project Information */}
        {currentStep === 0 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Step 1: Project Information</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Step 1 of 8</span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Define primary project identifiers, academic department, and projected completion targets.
            </p>

            <div style={{ marginBottom: '1rem' }}>
              <Input
                label="Project Title (Required)"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Autonomous Campus Research Knowledge Assistant"
                error={fieldErrors.title}
                required
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label className="acr-label">Academic Department (Required)</label>
              <select
                className="acr-select"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              >
                <option>Computer Science & Engineering</option>
                <option>Data Science & Artificial Intelligence</option>
                <option>Electronics & Communication Engineering</option>
                <option>Cybersecurity & Information Security</option>
                <option>Mechanical Engineering</option>
                <option>Biotechnology & Bioinformatics</option>
              </select>
              {fieldErrors.department && (
                <div style={{ color: 'var(--danger-text)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  {fieldErrors.department}
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <Input
                  label="Target Completion Date (Optional)"
                  type="date"
                  value={formData.expectedCompletionDate}
                  onChange={(e) => setFormData({ ...formData, expectedCompletionDate: e.target.value })}
                  helperText="Projected completion or defense semester"
                  error={fieldErrors.expectedCompletionDate}
                />
              </div>

              <div>
                <Input
                  label="Source Code Repository (Optional)"
                  value={formData.repositoryUrl}
                  onChange={(e) => setFormData({ ...formData, repositoryUrl: e.target.value })}
                  placeholder="https://github.com/organization/project-name"
                  error={fieldErrors.repositoryUrl}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Research Domain */}
        {currentStep === 1 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Step 2: Research Domain</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Step 2 of 8</span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Categorize your project under an institutional research taxonomy domain.
            </p>

            {fieldErrors.domainId && (
              <div style={{ color: 'var(--danger-text)', fontSize: '0.8125rem', marginBottom: '1rem' }}>
                {fieldErrors.domainId}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.75rem' }}>
              {domains.map((d) => {
                const isSelected = formData.domainId === d._id;
                return (
                  <div
                    key={d._id}
                    onClick={() => setFormData({ ...formData, domainId: d._id })}
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      border: isSelected ? '2px solid var(--primary-600)' : '1px solid var(--border-subtle)',
                      background: isSelected ? 'var(--primary-50)' : 'var(--bg-subtle)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: isSelected ? 'var(--primary-700)' : 'var(--text-primary)' }}>
                      {d.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', lineHeight: 1.4 }}>
                      {d.description?.slice(0, 80)}...
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: Problem Statement */}
        {currentStep === 2 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Step 3: Problem Statement</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Step 3 of 8</span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Clearly articulate the institutional or scientific challenge your investigation addresses (minimum 20 characters).
            </p>

            <div style={{ marginBottom: '1rem' }}>
              <label className="acr-label">Formal Problem Statement (Required)</label>
              <textarea
                className="acr-textarea"
                rows={6}
                value={formData.problemStatement}
                onChange={(e) => setFormData({ ...formData, problemStatement: e.target.value })}
                placeholder="Detail current limitations, inefficiencies, or research gaps in existing approaches..."
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                <span>Minimum 20 characters required</span>
                <span>{formData.problemStatement.length} characters</span>
              </div>
              {fieldErrors.problemStatement && (
                <div style={{ color: 'var(--danger-text)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  {fieldErrors.problemStatement}
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 4: Objectives */}
        {currentStep === 3 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Step 4: Research Objectives</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Step 4 of 8</span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Enumerate concrete milestone deliverables and empirical research targets.
            </p>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <input
                type="text"
                className="acr-input"
                placeholder="e.g. Implement dual-encoder neural dense retrieval"
                value={newObjective}
                onChange={(e) => setNewObjective(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addObjective())}
              />
              <Button variant="secondary" onClick={addObjective}>
                Add Objective
              </Button>
            </div>

            {fieldErrors.objectives && (
              <div style={{ color: 'var(--danger-text)', fontSize: '0.8125rem', marginBottom: '1rem' }}>
                {fieldErrors.objectives}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {formData.objectives.map((obj, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '0.65rem 1rem',
                    background: 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ fontSize: '0.875rem' }}>
                    <strong>{idx + 1}.</strong> {obj}
                  </span>
                  <button
                    onClick={() => removeObjective(idx)}
                    style={{ background: 'transparent', border: 'none', color: '#dc2626', cursor: 'pointer', padding: '0.2rem 0.5rem' }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 5: Technologies */}
        {currentStep === 4 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Step 5: Technology Stack</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Step 5 of 8</span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Specify frameworks, programming languages, libraries, and hardware platforms.
            </p>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <input
                type="text"
                className="acr-input"
                placeholder="e.g. PyTorch, FastAPI, MongoDB, Docker"
                value={newTech}
                onChange={(e) => setNewTech(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTech())}
              />
              <Button variant="secondary" onClick={addTech}>
                Add Tech
              </Button>
            </div>

            {fieldErrors.technologies && (
              <div style={{ color: 'var(--danger-text)', fontSize: '0.8125rem', marginBottom: '1rem' }}>
                {fieldErrors.technologies}
              </div>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {formData.technologies.map((t, idx) => (
                <span
                  key={idx}
                  className="acr-badge acr-badge-info"
                  style={{ fontSize: '0.8125rem', padding: '0.35rem 0.65rem' }}
                >
                  {t}
                  <button
                    onClick={() => removeTech(idx)}
                    style={{ marginLeft: '0.35rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit' }}
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* STEP 6: Team Formation */}
        {currentStep === 5 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Step 6: Team Formation</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Step 6 of 8</span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Optionally invite fellow enrolled students to collaborate on this research project.
            </p>

            <Input
              label="Student Collaborators (Emails or Student IDs, comma-separated)"
              value={formData.teamMemberEmails}
              onChange={(e) => setFormData({ ...formData, teamMemberEmails: e.target.value })}
              placeholder="e.g. priya.sharma@university.edu, ACR-2024-CS-088"
              helperText="Invitation notices will be dispatched to their institutional portals upon project submission."
              error={fieldErrors.teamMemberEmails}
            />
          </div>
        )}

        {/* STEP 7: Faculty Guidance */}
        {currentStep === 6 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Step 7: Faculty Mentorship Request</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Step 7 of 8</span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Select your Primary Faculty Guide respecting departmental mentorship capacity limits.
            </p>

            <div style={{ marginBottom: '1.5rem' }}>
              <label className="acr-label">Primary Faculty Guide (Required for submission)</label>
              <select
                className="acr-select"
                value={formData.facultyGuideId}
                onChange={(e) => setFormData({ ...formData, facultyGuideId: e.target.value })}
              >
                <option value="">Select a Faculty Member...</option>
                {facultyGuides.map((f) => {
                  const facultyUserId = f.userId?._id || f._id;
                  return (
                    <option key={facultyUserId} value={facultyUserId}>
                      {f.userId?.fullName || 'Faculty'} — {f.designation} ({f.department}) • [
                      {f.currentActiveProjectsCount || 0}/{f.maxActiveProjectsGuide} Projects]
                    </option>
                  );
                })}
              </select>
              {fieldErrors.facultyGuideId && (
                <div style={{ color: 'var(--danger-text)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  {fieldErrors.facultyGuideId}
                </div>
              )}
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label className="acr-label">Faculty Co-Guide (Optional)</label>
              <select
                className="acr-select"
                value={formData.coGuideId}
                onChange={(e) => setFormData({ ...formData, coGuideId: e.target.value })}
              >
                <option value="">None (Single Guide)</option>
                {facultyGuides
                  .filter((f) => (f.userId?._id || f._id) !== formData.facultyGuideId)
                  .map((f) => {
                    const facultyUserId = f.userId?._id || f._id;
                    return (
                      <option key={facultyUserId} value={facultyUserId}>
                        {f.userId?.fullName || 'Faculty'} — {f.designation} ({f.department})
                      </option>
                    );
                  })}
              </select>
            </div>
          </div>
        )}

        {/* STEP 8: Review & Finalize */}
        {currentStep === 7 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Step 8: Review Proposal Specifications</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Step 8 of 8</span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Verify all entered specifications prior to formal submission for departmental evaluation.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Section 1: Project Information */}
              <div style={{ background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Project Information
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(0)}
                    className="acr-btn acr-btn-ghost acr-btn-sm"
                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                  >
                    <Edit3 size={12} /> Edit
                  </button>
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.25rem' }}>{formData.title}</div>
                <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8125rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                  <span>Department: <strong>{formData.department}</strong></span>
                  {formData.expectedCompletionDate && (
                    <span>Target Date: <strong>{formData.expectedCompletionDate}</strong></span>
                  )}
                  {formData.repositoryUrl && (
                    <span>Repository: <strong>{formData.repositoryUrl}</strong></span>
                  )}
                </div>
              </div>

              {/* Section 2: Domain */}
              <div style={{ background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Research Domain
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="acr-btn acr-btn-ghost acr-btn-sm"
                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                  >
                    <Edit3 size={12} /> Edit
                  </button>
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                  {domains.find((d) => d._id === formData.domainId)?.name || 'Not selected'}
                </div>
              </div>

              {/* Section 3: Problem Statement */}
              <div style={{ background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Problem Statement
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="acr-btn acr-btn-ghost acr-btn-sm"
                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                  >
                    <Edit3 size={12} /> Edit
                  </button>
                </div>
                <div style={{ fontSize: '0.875rem', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
                  {formData.problemStatement}
                </div>
              </div>

              {/* Section 4: Objectives & Technologies */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Objectives ({formData.objectives.length})
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="acr-btn acr-btn-ghost acr-btn-sm"
                      style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                    >
                      <Edit3 size={12} /> Edit
                    </button>
                  </div>
                  <ul style={{ paddingLeft: '1.25rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    {formData.objectives.map((o, i) => (
                      <li key={i} style={{ marginBottom: '0.25rem' }}>{o}</li>
                    ))}
                  </ul>
                </div>

                <div style={{ background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Technologies ({formData.technologies.length})
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(4)}
                      className="acr-btn acr-btn-ghost acr-btn-sm"
                      style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                    >
                      <Edit3 size={12} /> Edit
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {formData.technologies.map((t, i) => (
                      <span key={i} className="acr-badge acr-badge-info">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Section 5: Faculty Guidance */}
              <div style={{ background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Faculty Mentorship
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(6)}
                    className="acr-btn acr-btn-ghost acr-btn-sm"
                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                  >
                    <Edit3 size={12} /> Edit
                  </button>
                </div>
                <div style={{ fontSize: '0.875rem' }}>
                  <strong>Primary Guide:</strong>{' '}
                  {facultyGuides.find((f) => (f.userId?._id || f._id) === formData.facultyGuideId)?.userId?.fullName ||
                    'Pending selection'}
                </div>
                {formData.coGuideId && (
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    <strong>Co-Guide:</strong>{' '}
                    {facultyGuides.find((f) => (f.userId?._id || f._id) === formData.coGuideId)?.userId?.fullName ||
                      'Selected'}
                  </div>
                )}
                {formData.teamMemberEmails && (
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                    <strong>Collaborators:</strong> {formData.teamMemberEmails}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Stepper Navigation Buttons */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '2rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <Button
            variant="secondary"
            onClick={handlePrevious}
            disabled={currentStep === 0 || isSubmitting}
            icon={<ArrowLeft size={16} />}
          >
            Previous
          </Button>

          {currentStep < STEPS.length - 1 ? (
            <Button variant="primary" onClick={handleNext}>
              <span>Continue</span>
              <ArrowRight size={16} />
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleSubmitFinal}
              isLoading={isSubmitting}
              icon={<Check size={16} />}
            >
              Submit Proposal for Review
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
