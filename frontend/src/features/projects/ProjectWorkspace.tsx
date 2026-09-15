import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectApi } from '../../services/api/projectApi';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Tabs } from '../../components/ui/Tabs';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  FolderGit2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileText,
  MessageSquare,
  Award,
  Users,
  Send,
  PlusCircle,
  Check,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { iprApi } from '../../services/api/iprApi';

export const ProjectWorkspace: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const toast = useToast();

  const [workspace, setWorkspace] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // IPR state
  const [projectScreenings, setProjectScreenings] = useState<any[]>([]);
  const [projectDisclosures, setProjectDisclosures] = useState<any[]>([]);

  // New Comment state
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Review Modal state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewDecision, setReviewDecision] = useState<'APPROVED' | 'CHANGES_REQUESTED' | 'REJECTED'>('APPROVED');
  const [reviewComments, setReviewComments] = useState('');
  const [reviewRecommendations, setReviewRecommendations] = useState('');
  const [rubricScores, setRubricScores] = useState([
    { criterion: 'Literature Comprehensiveness', score: 9, maxScore: 10, comments: 'Good citations' },
    { criterion: 'Methodological Rigor', score: 8, maxScore: 10, comments: 'Clear evaluation metrics' },
    { criterion: 'Implementation Quality', score: 9, maxScore: 10, comments: 'Well structured code' },
  ]);

  // New Milestone Modal state
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [milestoneDesc, setMilestoneDesc] = useState('');
  const [milestoneDate, setMilestoneDate] = useState('');

  // New Document Modal state
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [docType, setDocType] = useState('PROGRESS_REPORT');
  const [docTitle, setDocTitle] = useState('');

  // Discussion state
  const [discussionMsg, setDiscussionMsg] = useState('');

  const loadWorkspace = async () => {
    if (!id) return;
    try {
      const data = await projectApi.getWorkspace(id);
      setWorkspace(data);
      try {
        const screenings = await iprApi.getProjectScreenings(id);
        setProjectScreenings(screenings || []);
        const disclosuresRes = await iprApi.getDisclosures({ projectId: id });
        setProjectDisclosures(disclosuresRes.disclosures || []);
      } catch {
        // IPR data optional for workspace load
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to load project workspace.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspace();
  }, [id]);

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
        Loading project workspace...
      </div>
    );
  }

  if (!workspace) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Project Workspace Not Found</h2>
        <Link to="/projects" className="acr-btn acr-btn-primary" style={{ marginTop: '1rem' }}>
          Back to Projects
        </Link>
      </div>
    );
  }

  const { project, members, guides, milestones, documents, comments, reviews, discussions, userPermissions } =
    workspace;

  const handleStatusChange = async (newStatus: string) => {
    try {
      await projectApi.updateStatus(project._id, newStatus);
      toast.success(`Project status updated to ${newStatus}.`);
      loadWorkspace();
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Status transition rejected.');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setIsSubmittingComment(true);
    try {
      await projectApi.addComment(project._id, { content: newComment });
      setNewComment('');
      toast.success('Comment posted successfully.');
      loadWorkspace();
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to post comment.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleResolveComment = async (commentId: string) => {
    try {
      await projectApi.resolveComment(project._id, commentId);
      toast.success('Comment thread marked as resolved.');
      loadWorkspace();
    } catch {
      toast.error('Failed to resolve comment.');
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await projectApi.submitReview(project._id, {
        rubricScores,
        comments: reviewComments,
        recommendations: reviewRecommendations,
        decision: reviewDecision,
      });
      setIsReviewModalOpen(false);
      toast.success(`Evaluation recorded. Project marked as ${reviewDecision}.`);
      loadWorkspace();
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to submit review.');
    }
  };

  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await projectApi.addMilestone(project._id, {
        title: milestoneTitle,
        description: milestoneDesc,
        dueDate: new Date(milestoneDate || Date.now()).toISOString(),
        orderIndex: milestones.length + 1,
      });
      setIsMilestoneModalOpen(false);
      setMilestoneTitle('');
      setMilestoneDesc('');
      toast.success('Milestone added.');
      loadWorkspace();
    } catch {
      toast.error('Failed to add milestone.');
    }
  };

  const handleUpdateMilestoneStatus = async (milestoneId: string, status: string) => {
    try {
      await projectApi.updateMilestone(project._id, milestoneId, { status });
      toast.success(`Milestone updated to ${status}.`);
      loadWorkspace();
    } catch {
      toast.error('Failed to update milestone.');
    }
  };

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await projectApi.addDocument(project._id, {
        originalName: `${docTitle || 'Deliverable'}.pdf`,
        filename: `${docTitle || 'Deliverable'}.pdf`,
        type: docType,
        description: 'Uploaded via workspace document portal.',
      });
      setIsDocModalOpen(false);
      setDocTitle('');
      toast.success('Document deliverable recorded.');
      loadWorkspace();
    } catch {
      toast.error('Failed to upload document.');
    }
  };

  const handleSendDiscussion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!discussionMsg.trim()) return;
    try {
      await projectApi.sendDiscussion(project._id, discussionMsg);
      setDiscussionMsg('');
      loadWorkspace();
    } catch {
      toast.error('Failed to send message.');
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'COMPLETED':
        return 'success';
      case 'IN_PROGRESS':
      case 'UNDER_REVIEW':
        return 'info';
      case 'CHANGES_REQUESTED':
        return 'warning';
      case 'REJECTED':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Projects', path: '/projects?filter=my' },
          { label: project.code },
        ]}
      />

      {project.status === 'DRAFT' && (
        <div
          style={{
            padding: '1.25rem 1.5rem',
            backgroundColor: 'var(--warning-bg, #fffbeb)',
            border: '1px solid var(--warning-border, #fef3c7)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#92400e' }}>
              Draft Project Proposal
            </div>
            <div style={{ fontSize: '0.8125rem', color: '#b45309', marginTop: '0.2rem' }}>
              This project is currently saved as a draft and has not yet been submitted for institutional review.
            </div>
          </div>
          <Link
            to={`/projects/create?draftId=${project._id}`}
            className="acr-btn acr-btn-primary acr-btn-sm"
          >
            <span>Resume Proposal Wizard</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* Project Master Header */}
      <div className="acr-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ flex: 1, minWidth: '320px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                {project.code}
              </span>
              <Badge variant={getStatusBadgeVariant(project.status)}>
                {project.status.replace(/_/g, ' ')}
              </Badge>
              <span className="acr-badge acr-badge-info">{project.domainId?.name}</span>
            </div>

            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              {project.title}
            </h1>

            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <span>Department: <strong>{project.department}</strong></span>
              <span>Owner: <strong>{project.ownerId?.fullName}</strong></span>
              <span>Primary Guide: <strong>{guides.find((g: any) => g.role === 'PRIMARY_GUIDE')?.facultyId?.fullName || 'Pending'}</strong></span>
            </div>
          </div>

          {/* Progress and Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1rem', minWidth: '220px' }}>
            <div style={{ textAlign: 'right', width: '100%' }}>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Completion Progress: <strong style={{ fontSize: '1rem' }}>{project.progressPercentage}%</strong>
              </div>
              <div style={{ height: '8px', width: '220px', background: 'var(--bg-muted)', borderRadius: '9999px', overflow: 'hidden', marginLeft: 'auto' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${project.progressPercentage}%`,
                    background: 'var(--primary-600)',
                    borderRadius: '9999px',
                    transition: 'width 0.4s ease',
                  }}
                />
              </div>
            </div>

            {/* Role Actions */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {userPermissions.canReview && (
                <Button variant="primary" size="sm" onClick={() => setIsReviewModalOpen(true)} icon={<Award size={14} />}>
                  Evaluate Project (Rubric)
                </Button>
              )}

              {userPermissions.isOwner && project.status === 'DRAFT' && (
                <Button variant="primary" size="sm" onClick={() => handleStatusChange('SUBMITTED')}>
                  Submit for Review
                </Button>
              )}

              {userPermissions.isOwner && project.status === 'CHANGES_REQUESTED' && (
                <Button variant="primary" size="sm" onClick={() => handleStatusChange('SUBMITTED')}>
                  Resubmit Revision
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <Tabs
        tabs={[
          { id: 'overview', label: 'Workspace Overview' },
          { id: 'milestones', label: 'Milestones & Progress', count: milestones.length },
          { id: 'documents', label: 'Documents & Deliverables', count: documents.length },
          { id: 'comments', label: 'Faculty Feedback', count: comments.filter((c: any) => c.status === 'OPEN').length },
          { id: 'reviews', label: 'Rubric Evaluations', count: reviews.length },
          { id: 'team', label: 'Team & Mentors', count: members.length + guides.length },
          { id: 'discussions', label: 'Project Channel', count: discussions.length },
          { id: 'ipr', label: 'IPR & Innovation', count: projectDisclosures.length || (projectScreenings.length ? 'Screened' : undefined) },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* TAB 1: Overview */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="acr-card acr-card-body">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem' }}>Problem Statement</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {project.problemStatement}
              </p>
            </div>

            <div className="acr-card acr-card-body">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.75rem' }}>Research Objectives</h3>
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {project.objectives?.map((obj: string, i: number) => (
                  <li key={i} style={{ marginBottom: '0.35rem' }}>{obj}</li>
                ))}
              </ul>
            </div>

            <div className="acr-card acr-card-body">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.75rem' }}>Technology Architecture</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {project.technologies?.map((tech: string, i: number) => (
                  <span key={i} className="acr-badge acr-badge-info" style={{ fontSize: '0.8125rem', padding: '0.35rem 0.65rem' }}>
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="acr-card acr-card-body">
              <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                Project Metadata
              </h4>
              <div style={{ fontSize: '0.8125rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <div>Start Date: <strong>{new Date(project.createdAt).toLocaleDateString()}</strong></div>
                <div>Status: <Badge variant={getStatusBadgeVariant(project.status)}>{project.status}</Badge></div>
                {project.repositoryUrl && (
                  <div>
                    Repository:{' '}
                    <a href={project.repositoryUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-600)' }}>
                      GitHub Link ↗
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="acr-card acr-card-body">
              <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                Guidance Summary
              </h4>
              {guides.map((g: any) => (
                <div key={g._id} style={{ marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{g.facultyId?.fullName}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {g.role === 'PRIMARY_GUIDE' ? 'Primary Guide (Associate Professor)' : 'Co-Guide'} • Status: {g.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Milestones */}
      {activeTab === 'milestones' && (
        <div className="acr-card">
          <div className="acr-card-header">
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Project Milestones & Deliverables</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Progress is calculated deterministically from validated milestone weights
              </p>
            </div>

            {userPermissions.canEdit && (
              <Button variant="secondary" size="sm" onClick={() => setIsMilestoneModalOpen(true)} icon={<PlusCircle size={14} />}>
                Add Milestone
              </Button>
            )}
          </div>

          <div className="acr-card-body" style={{ padding: 0 }}>
            {milestones.map((m: any, idx: number) => (
              <div
                key={m._id}
                style={{
                  padding: '1.25rem 1.5rem',
                  borderBottom: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                      M{idx + 1} (Weight: {m.weight}x)
                    </span>
                    <Badge variant={m.status === 'COMPLETED' ? 'success' : m.status === 'IN_PROGRESS' ? 'info' : 'neutral'}>
                      {m.status.replace(/_/g, ' ')}
                    </Badge>
                  </div>

                  <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {m.title}
                  </h4>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    {m.description}
                  </p>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                    Target Due Date: {new Date(m.dueDate).toLocaleDateString()}
                  </div>
                </div>

                {/* Milestone status controls */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {m.status !== 'COMPLETED' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleUpdateMilestoneStatus(m._id, 'COMPLETED')}
                      icon={<Check size={14} />}
                    >
                      Mark Complete
                    </Button>
                  )}
                  {m.status === 'COMPLETED' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUpdateMilestoneStatus(m._id, 'IN_PROGRESS')}
                    >
                      Reopen
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Documents */}
      {activeTab === 'documents' && (
        <div className="acr-card">
          <div className="acr-card-header">
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Project Documents & Versioned Deliverables</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Problem statements, literature surveys, system designs, and final thesis papers
              </p>
            </div>

            <Button variant="primary" size="sm" onClick={() => setIsDocModalOpen(true)} icon={<PlusCircle size={14} />}>
              Submit Document Deliverable
            </Button>
          </div>

          <div className="acr-card-body" style={{ padding: 0 }}>
            {documents.length === 0 ? (
              <div style={{ padding: '2rem' }}>
                <EmptyState
                  title="No project documents uploaded yet"
                  description="Upload your literature survey or system design document for faculty review."
                  actionLabel="Upload First Deliverable"
                  onAction={() => setIsDocModalOpen(true)}
                />
              </div>
            ) : (
              documents.map((doc: any) => (
                <div
                  key={doc._id}
                  style={{
                    padding: '1.25rem 1.5rem',
                    borderBottom: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <FileText size={28} color="var(--primary-600)" />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.9375rem', fontWeight: 600 }}>{doc.originalName}</span>
                        <span className="acr-badge acr-badge-info" style={{ fontSize: '0.6875rem' }}>
                          v{doc.version}
                        </span>
                        <Badge variant="neutral">{doc.type}</Badge>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        Uploaded by {doc.uploadedBy?.fullName} on {new Date(doc.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <span className="acr-badge acr-badge-success">{doc.status}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: Faculty Comments */}
      {activeTab === 'comments' && (
        <div className="acr-card">
          <div className="acr-card-header">
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Faculty Academic Feedback</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Structured mentorship exchange between Faculty Guides and Student Researchers
              </p>
            </div>
          </div>

          <div className="acr-card-body">
            {/* Comment List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              {comments.map((c: any) => (
                <div
                  key={c._id}
                  style={{
                    padding: '1rem 1.25rem',
                    background: c.authorId?.role === 'FACULTY' ? 'var(--primary-50)' : 'var(--bg-subtle)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <strong style={{ fontSize: '0.875rem' }}>{c.authorId?.fullName}</strong>
                      <span className="acr-badge acr-badge-neutral" style={{ fontSize: '0.625rem' }}>
                        {c.authorId?.role}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                      {c.status === 'OPEN' && (
                        <button
                          onClick={() => handleResolveComment(c._id)}
                          className="acr-btn-ghost"
                          style={{ fontSize: '0.75rem', color: '#059669', cursor: 'pointer' }}
                        >
                          Mark Resolved
                        </button>
                      )}
                    </div>
                  </div>

                  <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                    {c.content}
                  </p>
                </div>
              ))}
            </div>

            {/* Post Comment Form */}
            <form onSubmit={handleAddComment}>
              <textarea
                className="acr-textarea"
                rows={3}
                placeholder="Write academic feedback or respond to your faculty mentor..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                style={{ marginBottom: '0.75rem' }}
              />
              <div style={{ textAlign: 'right' }}>
                <Button type="submit" variant="primary" size="sm" isLoading={isSubmittingComment} icon={<Send size={14} />}>
                  Post Feedback
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 5: Rubric Reviews */}
      {activeTab === 'reviews' && (
        <div className="acr-card">
          <div className="acr-card-header">
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Formal Rubric Evaluations & Audit Trail</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Evaluations conducted by assigned faculty mentors with rubric criteria scores
              </p>
            </div>

            {userPermissions.canReview && (
              <Button variant="primary" size="sm" onClick={() => setIsReviewModalOpen(true)} icon={<Award size={14} />}>
                Conduct Evaluation
              </Button>
            )}
          </div>

          <div className="acr-card-body">
            {reviews.length === 0 ? (
              <EmptyState
                title="No formal evaluations recorded"
                description="Once milestones or reports are submitted, faculty mentors conduct formal rubric reviews."
              />
            ) : (
              reviews.map((rev: any) => (
                <div
                  key={rev._id}
                  style={{
                    padding: '1.5rem',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-lg)',
                    marginBottom: '1.5rem',
                    background: 'var(--bg-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    <div>
                      <span className="acr-badge acr-badge-info">Review Version {rev.version}</span>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '0.25rem' }}>
                        Evaluated by {rev.reviewerId?.fullName}
                      </h4>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Date: {new Date(rev.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: rev.percentage >= 70 ? '#059669' : '#d97706' }}>
                        {rev.percentage}%
                      </div>
                      <Badge variant={rev.decision === 'APPROVED' ? 'success' : 'warning'}>
                        Decision: {rev.decision}
                      </Badge>
                    </div>
                  </div>

                  {/* Rubric Breakdown */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      Rubric Criteria Scoring
                    </div>
                    <div className="acr-table-container">
                      <table className="acr-table">
                        <thead>
                          <tr>
                            <th>Criterion</th>
                            <th>Score</th>
                            <th>Qualitative Remarks</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rev.rubricScores?.map((r: any, rIdx: number) => (
                            <tr key={rIdx}>
                              <td><strong>{r.criterion}</strong></td>
                              <td>{r.score} / {r.maxScore}</td>
                              <td>{r.comments}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div style={{ marginBottom: '0.75rem' }}>
                    <strong>Qualitative Feedback:</strong> {rev.comments}
                  </div>
                  {rev.recommendations && (
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      <strong>Recommendations:</strong> {rev.recommendations}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 6: Team & Mentors */}
      {activeTab === 'team' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="acr-card">
            <div className="acr-card-header">
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Faculty Mentors</h3>
            </div>
            <div className="acr-card-body">
              {guides.map((g: any) => (
                <div key={g._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{g.facultyId?.fullName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{g.role.replace(/_/g, ' ')}</div>
                  </div>
                  <Badge variant={g.status === 'ACCEPTED' ? 'success' : 'warning'}>{g.status}</Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="acr-card">
            <div className="acr-card-header">
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Student Researchers</h3>
            </div>
            <div className="acr-card-body">
              {members.map((m: any) => (
                <div key={m._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{m.studentId?.fullName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.studentId?.email}</div>
                  </div>
                  <span className="acr-badge acr-badge-info">{m.role}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: Discussions */}
      {activeTab === 'discussions' && (
        <div className="acr-card">
          <div className="acr-card-header">
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Academic Project Channel</h3>
          </div>
          <div className="acr-card-body" style={{ display: 'flex', flexDirection: 'column', height: '400px' }}>
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingRight: '0.5rem' }}>
              {discussions.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem', fontSize: '0.875rem' }}>
                  No messages yet in this project channel. Start the conversation below.
                </div>
              ) : (
                discussions.map((d: any) => (
                  <div key={d._id} style={{ background: 'var(--bg-subtle)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                      <strong style={{ fontSize: '0.8125rem' }}>{d.senderId?.fullName}</strong>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                        {new Date(d.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.875rem' }}>{d.message}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleSendDiscussion} style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <input
                type="text"
                className="acr-input"
                placeholder="Send a project message to team and guides..."
                value={discussionMsg}
                onChange={(e) => setDiscussionMsg(e.target.value)}
              />
              <Button type="submit" variant="primary" size="sm">
                Send
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 8: IPR & Innovation */}
      {activeTab === 'ipr' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* AI Novelty Screening Status Banner */}
          <div
            className="acr-card"
            style={{
              padding: '1.75rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1.25rem',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <span className="acr-badge acr-badge-info" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <ShieldCheck size={14} />
                  <span>Institutional IP Protection</span>
                </span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                IPR & Innovation Protection
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '600px', lineHeight: 1.5 }}>
                Does this project feature a novel algorithm, hardware architecture, unique dataset, or creative work? Protect your research through institutional patent disclosures or copyrights.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link
                to={`/ipr/novelty?projectId=${project._id}`}
                className="acr-btn acr-btn-primary"
              >
                <Sparkles size={16} />
                <span>Start Preliminary Novelty Screening</span>
              </Link>
              {projectScreenings.some((s: any) => s.studentAcknowledged) && (
                <Link
                  to={`/ipr/submit?screeningId=${projectScreenings.find((s: any) => s.studentAcknowledged)._id}`}
                  className="acr-btn acr-btn-secondary"
                >
                  <PlusCircle size={16} />
                  <span>Submit IPR Disclosure</span>
                </Link>
              )}
            </div>
          </div>

          {/* Screenings history for this project */}
          <div className="acr-card acr-card-body">
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>
              Preliminary AI Novelty Screenings ({projectScreenings.length})
            </h4>
            {projectScreenings.length === 0 ? (
              <EmptyState
                title="No Preliminary Novelty Screening Run"
                description="Before submitting an institutional IPR disclosure, campus researchers must complete an AI-assisted preliminary novelty screening against the campus database."
                actionLabel="Begin Novelty Screening"
                onAction={() => (window.location.href = `/ipr/novelty?projectId=${project._id}`)}
              />
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {projectScreenings.map((s: any) => (
                  <div
                    key={s._id}
                    style={{
                      padding: '1.25rem',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '1rem',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700 }}>
                          #{s.screeningNumber}
                        </span>
                        <span className="acr-badge acr-badge-info">{s.assessment?.replace(/_/g, ' ')}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Confidence: {s.confidence}
                        </span>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{s.innovationTitle}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        Completed {new Date(s.createdAt).toLocaleDateString()} • Student Acknowledged:{' '}
                        {s.studentAcknowledged ? 'Yes' : 'Pending'}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Link to={`/ipr/novelty/result/${s._id}`} className="acr-btn acr-btn-ghost acr-btn-sm">
                        <span>View Report</span>
                        <ArrowRight size={14} />
                      </Link>
                      {s.studentAcknowledged && (
                        <Link to={`/ipr/submit?screeningId=${s._id}`} className="acr-btn acr-btn-primary acr-btn-sm">
                          <span>Continue Disclosure</span>
                          <ArrowRight size={14} />
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Existing Disclosures for this project */}
          <div className="acr-card acr-card-body">
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>
              Project IPR Disclosures & Filings ({projectDisclosures.length})
            </h4>
            {projectDisclosures.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                No formal IPR disclosures have been submitted for this project yet.
              </p>
            ) : (
              <div className="acr-table-container">
                <table className="acr-table">
                  <thead>
                    <tr>
                      <th>Ref #</th>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projectDisclosures.map((d: any) => (
                      <tr key={d._id}>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700 }}>
                          {d.iprNumber}
                        </td>
                        <td style={{ fontWeight: 600 }}>{d.title}</td>
                        <td>
                          <span className="acr-badge acr-badge-info">{d.category}</span>
                        </td>
                        <td>
                          <Badge variant="info">{d.status.replace(/_/g, ' ')}</Badge>
                        </td>
                        <td>
                          <Link to={`/ipr/disclosures/${d._id}`} className="acr-btn acr-btn-ghost acr-btn-sm">
                            View File
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Review Modal */}
      <Modal isOpen={isReviewModalOpen} onClose={() => setIsReviewModalOpen(false)} title="Formal Faculty Evaluation">
        <form onSubmit={handleSubmitReview}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label className="acr-label">Formal Review Decision</label>
            <select
              className="acr-select"
              value={reviewDecision}
              onChange={(e) => setReviewDecision(e.target.value as any)}
            >
              <option value="APPROVED">APPROVED (Proceed to next stage)</option>
              <option value="CHANGES_REQUESTED">CHANGES REQUESTED (Revision needed)</option>
              <option value="REJECTED">REJECTED</option>
            </select>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <div className="acr-label">Rubric Criteria Scores (Out of 10)</div>
            {rubricScores.map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', gap: '1rem' }}>
                <span style={{ fontSize: '0.875rem', flex: 1 }}>{r.criterion}</span>
                <input
                  type="number"
                  min={0}
                  max={r.maxScore}
                  className="acr-input"
                  style={{ width: '80px' }}
                  value={r.score}
                  onChange={(e) => {
                    const newScores = [...rubricScores];
                    newScores[i].score = Number(e.target.value);
                    setRubricScores(newScores);
                  }}
                />
              </div>
            ))}
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label className="acr-label">Qualitative Comments</label>
            <textarea
              className="acr-textarea"
              rows={3}
              required
              value={reviewComments}
              onChange={(e) => setReviewComments(e.target.value)}
              placeholder="Detailed feedback and academic justification..."
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label className="acr-label">Recommendations for Next Milestone</label>
            <textarea
              className="acr-textarea"
              rows={2}
              value={reviewRecommendations}
              onChange={(e) => setReviewRecommendations(e.target.value)}
              placeholder="Actionable steps for student researchers..."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <Button variant="secondary" onClick={() => setIsReviewModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Submit Evaluation
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Milestone Modal */}
      <Modal isOpen={isMilestoneModalOpen} onClose={() => setIsMilestoneModalOpen(false)} title="Add Milestone Deliverable">
        <form onSubmit={handleAddMilestone}>
          <Input label="Milestone Title" value={milestoneTitle} onChange={(e) => setMilestoneTitle(e.target.value)} required />
          <Input label="Description" value={milestoneDesc} onChange={(e) => setMilestoneDesc(e.target.value)} />
          <Input label="Due Date" type="date" value={milestoneDate} onChange={(e) => setMilestoneDate(e.target.value)} required />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <Button variant="secondary" onClick={() => setIsMilestoneModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Add Milestone</Button>
          </div>
        </form>
      </Modal>

      {/* Add Document Modal */}
      <Modal isOpen={isDocModalOpen} onClose={() => setIsDocModalOpen(false)} title="Submit Project Document Deliverable">
        <form onSubmit={handleAddDocument}>
          <Input label="Deliverable Title" value={docTitle} onChange={(e) => setDocTitle(e.target.value)} placeholder="e.g. System Design v1.0" required />
          <div style={{ marginBottom: '1rem' }}>
            <label className="acr-label">Deliverable Type</label>
            <select className="acr-select" value={docType} onChange={(e) => setDocType(e.target.value)}>
              <option value="PROBLEM_STATEMENT">Problem Statement</option>
              <option value="LITERATURE_SURVEY">Literature Survey</option>
              <option value="SYSTEM_DESIGN">System Design Architecture</option>
              <option value="PROGRESS_REPORT">Progress Report</option>
              <option value="FINAL_REPORT">Final Report / Thesis</option>
              <option value="PRESENTATION">Presentation Slides</option>
            </select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <Button variant="secondary" onClick={() => setIsDocModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Submit Deliverable</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
