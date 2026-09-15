import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { iprApi } from '../../services/api/iprApi';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { Badge } from '../../components/ui/Badge';
import {
  FileText,
  ShieldCheck,
  Sparkles,
  Users,
  Clock,
  Send,
  Download,
  PlusCircle,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Scale,
  Award,
  ExternalLink,
} from 'lucide-react';
import { IIPRDisclosure } from '../../types';

export const IprDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const toast = useToast();

  const [disclosure, setDisclosure] = useState<IIPRDisclosure | null>(null);
  const [screening, setScreening] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'screening' | 'discussion' | 'documents' | 'filing'>('overview');

  // Comment input
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Status update modal / form for Faculty / Admin
  const [newStatus, setNewStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // New Application filing form for Admin
  const [appNumber, setAppNumber] = useState('');
  const [appAuthority, setAppAuthority] = useState('Indian Patent Office (IPO)');
  const [appType, setAppType] = useState('Provisional Patent Application');
  const [isSubmittingApp, setIsSubmittingApp] = useState(false);

  const loadData = async () => {
    if (!id) return;
    try {
      const data = await iprApi.getDisclosureById(id);
      setDisclosure(data.disclosure);
      setScreening(data.screening);
      setComments(data.comments || []);
      setDocuments(data.documents || []);
      setApplications(data.applications || []);
      setNewStatus(data.disclosure.status);
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to load IPR disclosure details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !id) return;
    setIsSubmittingComment(true);
    try {
      await iprApi.addComment(id, { message: newComment.trim() });
      setNewComment('');
      toast.success('Comment added.');
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to add comment.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newStatus) return;
    setIsUpdatingStatus(true);
    try {
      await iprApi.updateStatus(id, newStatus, statusNotes);
      toast.success(`Disclosure status transitioned to ${newStatus}.`);
      setStatusNotes('');
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to update status.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleRecordApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !appNumber) return;
    setIsSubmittingApp(true);
    try {
      await iprApi.recordApplication(id, {
        applicationNumber: appNumber,
        authority: appAuthority,
        applicationType: appType,
      });
      toast.success('Filing record registered successfully.');
      setAppNumber('');
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to record application.');
    } finally {
      setIsSubmittingApp(false);
    }
  };

  if (isLoading) {
    return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading disclosure file...</div>;
  }

  if (!disclosure) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <h2>IPR Disclosure Not Found</h2>
        <Link to="/ipr/dashboard" className="acr-btn acr-btn-primary" style={{ marginTop: '1rem' }}>
          Back to IPR Dashboard
        </Link>
      </div>
    );
  }

  const isReviewerOrAdmin = user?.role === 'FACULTY' || user?.role === 'ADMIN';

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'IPR & Innovation', path: '/ipr/dashboard' },
          { label: disclosure.iprNumber },
        ]}
      />

      {/* Header Banner */}
      <div
        className="acr-card"
        style={{
          padding: '1.5rem',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8125rem',
                fontWeight: 700,
                color: 'var(--primary-700)',
                backgroundColor: 'var(--primary-50)',
                padding: '0.2rem 0.6rem',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              {disclosure.iprNumber}
            </span>
            <span className="acr-badge acr-badge-info">{disclosure.category}</span>
            <Badge variant="info">{disclosure.status.replace(/_/g, ' ')}</Badge>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Confidentiality: <strong>{disclosure.confidentiality.replace(/_/g, ' ')}</strong>
            </span>
          </div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            {disclosure.title}
          </h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Associated Project: <strong>{disclosure.projectId?.title || 'Campus Research Project'}</strong>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {disclosure.screeningId && (
            <Link to={`/ipr/novelty/result/${disclosure.screeningId}`} className="acr-btn acr-btn-secondary acr-btn-sm">
              <Sparkles size={14} />
              <span>View Screening Report</span>
            </Link>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '1.5rem',
          gap: '0.5rem',
          overflowX: 'auto',
        }}
      >
        {[
          { id: 'overview', label: 'Disclosure Overview' },
          { id: 'screening', label: 'Novelty Screening Report' },
          { id: 'discussion', label: `Review & Discussion (${comments.length})` },
          { id: 'documents', label: `Documents (${documents.length})` },
          { id: 'filing', label: `Filing & Tracking (${applications.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: '0.65rem 1rem',
              border: 'none',
              background: 'none',
              fontWeight: activeTab === tab.id ? 700 : 500,
              color: activeTab === tab.id ? 'var(--primary-600)' : 'var(--text-secondary)',
              borderBottom: activeTab === tab.id ? '2px solid var(--primary-600)' : '2px solid transparent',
              cursor: 'pointer',
              fontSize: '0.875rem',
              whiteSpace: 'nowrap',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="acr-card acr-card-body">
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Executive Summary</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {disclosure.summary}
              </p>
            </div>

            <div className="acr-card acr-card-body">
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Stage of Development & Commercial Potential</h3>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '0.5rem' }}>
                <strong>Current Stage:</strong> {disclosure.stageOfDevelopment || 'Prototype / Validation'}
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                <strong>Commercial Application:</strong> {disclosure.commercialPotential || 'Campus & Industrial deployment'}
              </p>
            </div>

            {screening && (
              <>
                <div className="acr-card acr-card-body">
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Problem Solved (from Novelty Screening)</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {screening.problem}
                  </p>
                </div>

                <div className="acr-card acr-card-body">
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Proposed Technical Solution</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {screening.proposedSolution}
                  </p>
                </div>

                <div className="acr-card acr-card-body">
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Key Technical Features</h3>
                  <ul style={{ paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {screening.keyTechnicalFeatures?.map((f: string, idx: number) => (
                      <li key={idx}>{f}</li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>

          {/* Right sidebar info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="acr-card acr-card-body">
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Inventor Team
              </h3>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700 }}>Primary Inventor</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  {disclosure.primaryInventorId?.fullName || 'Campus Researcher'} ({disclosure.primaryInventorId?.email})
                </div>
              </div>

              {disclosure.coInventors && disclosure.coInventors.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>Co-Inventors</div>
                  {disclosure.coInventors.map((inv: any, idx: number) => (
                    <div key={idx} style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                      • {inv.name} ({inv.email}) - {inv.sharePercentage}%
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Status change actions for Reviewer / Admin */}
            {isReviewerOrAdmin && (
              <div className="acr-card acr-card-body">
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--primary-700)' }}>
                  IPR Committee Action
                </h3>
                <form onSubmit={handleUpdateStatus}>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                      Update Status:
                    </label>
                    <select
                      className="acr-input"
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      style={{ fontSize: '0.8125rem' }}
                    >
                      <option value="SUBMITTED">SUBMITTED</option>
                      <option value="INITIAL_REVIEW">INITIAL REVIEW</option>
                      <option value="INFORMATION_REQUESTED">INFORMATION REQUESTED</option>
                      <option value="ASSESSMENT">ASSESSMENT</option>
                      <option value="RECOMMENDED">RECOMMENDED</option>
                      <option value="APPROVED">APPROVED</option>
                      <option value="APPLICATION_IN_PROGRESS">APPLICATION IN PROGRESS</option>
                      <option value="FILED">FILED</option>
                      <option value="GRANTED">GRANTED</option>
                      <option value="REJECTED">REJECTED</option>
                    </select>
                  </div>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                      Committee Notes:
                    </label>
                    <textarea
                      className="acr-input"
                      rows={2}
                      placeholder="Add formal notes or instructions..."
                      value={statusNotes}
                      onChange={(e) => setStatusNotes(e.target.value)}
                      style={{ fontSize: '0.8125rem' }}
                    />
                  </div>
                  <button type="submit" className="acr-btn acr-btn-primary acr-btn-sm" disabled={isUpdatingStatus} style={{ width: '100%' }}>
                    {isUpdatingStatus ? 'Updating...' : 'Record Decision'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SCREENING REPORT */}
      {activeTab === 'screening' && (
        <div>
          {screening ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div
                style={{
                  padding: '1.25rem',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                      SCREENING REFERENCE #{screening.screeningNumber}
                    </span>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginTop: '0.25rem' }}>
                      Preliminary Assessment: {screening.assessment?.replace(/_/g, ' ')}
                    </h3>
                  </div>
                  <span className="acr-badge acr-badge-info">Confidence: {screening.confidence}</span>
                </div>
              </div>

              <div className="acr-card acr-card-body">
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem' }}>Distinguishing Features</h4>
                <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {screening.distinguishingFeatures?.map((f: string, i: number) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>

              <div className="acr-card acr-card-body">
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem' }}>Potential Prior Art Overlap</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{screening.potentialOverlap}</p>
              </div>

              <div className="acr-card acr-card-body">
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem' }}>Research Corpus Transparency</h4>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  Evaluated against {screening.sourcesConsulted?.papersCount || 0} campus papers and {screening.sourcesConsulted?.institutionalCount || 0} active projects.
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  {screening.sourcesConsulted?.message}
                </p>
              </div>
            </div>
          ) : (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No preliminary screening record linked.
            </div>
          )}
        </div>
      )}

      {/* TAB 3: DISCUSSION & COMMENTS */}
      {activeTab === 'discussion' && (
        <div className="acr-card acr-card-body">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Reviewer & Inventor Discussion</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {comments.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No messages yet. Use the message box below to ask questions or submit clarification.
              </div>
            ) : (
              comments.map((c) => (
                <div
                  key={c._id}
                  style={{
                    padding: '0.85rem 1rem',
                    backgroundColor: 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.75rem' }}>
                    <strong>{c.authorId?.fullName || 'User'} ({c.authorId?.role})</strong>
                    <span style={{ color: 'var(--text-muted)' }}>{new Date(c.createdAt).toLocaleString()}</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', margin: 0 }}>{c.message}</p>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '0.75rem' }}>
            <input
              type="text"
              className="acr-input"
              placeholder="Type your message, query, or clarification..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              style={{ flex: 1 }}
            />
            <button type="submit" className="acr-btn acr-btn-primary" disabled={isSubmittingComment}>
              <Send size={16} />
              <span>Send</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: DOCUMENTS */}
      {activeTab === 'documents' && (
        <div className="acr-card acr-card-body">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>IPR Supporting Documents</h3>
          {documents.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No supporting documents attached yet.
            </div>
          ) : (
            <div className="acr-table-container">
              <table className="acr-table">
                <thead>
                  <tr>
                    <th>File Name</th>
                    <th>Type</th>
                    <th>Uploaded Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr key={doc._id}>
                      <td style={{ fontWeight: 600 }}>{doc.originalName}</td>
                      <td><span className="acr-badge acr-badge-neutral">{doc.type}</span></td>
                      <td style={{ fontSize: '0.75rem' }}>{new Date(doc.createdAt).toLocaleDateString()}</td>
                      <td>
                        <a href={`/api/v1/ipr/documents/${doc._id}/download`} className="acr-btn acr-btn-ghost acr-btn-sm" download>
                          <Download size={14} /> Download
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: FILING & TRACKING */}
      {activeTab === 'filing' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="acr-card acr-card-body">
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Registered Official Applications</h3>
            {applications.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No formal patent or copyright applications have been recorded by the IPR cell yet.
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {applications.map((app) => (
                  <div key={app._id} style={{ padding: '1rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{app.applicationNumber}</span>
                      <span className="acr-badge acr-badge-success">{app.status}</span>
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      {app.applicationType} — {app.authority}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form to record official application (Admin / Faculty) */}
          {isReviewerOrAdmin && (
            <div className="acr-card acr-card-body">
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Record Official Application</h3>
              <form onSubmit={handleRecordApplication} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                    Application / Filing Number:
                  </label>
                  <input
                    type="text"
                    className="acr-input"
                    placeholder="e.g. 202641012345"
                    value={appNumber}
                    onChange={(e) => setAppNumber(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                    Filing Authority:
                  </label>
                  <input
                    type="text"
                    className="acr-input"
                    value={appAuthority}
                    onChange={(e) => setAppAuthority(e.target.value)}
                    required
                  />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                    Application Type:
                  </label>
                  <input
                    type="text"
                    className="acr-input"
                    value={appType}
                    onChange={(e) => setAppType(e.target.value)}
                    required
                  />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <button type="submit" className="acr-btn acr-btn-primary" disabled={isSubmittingApp}>
                    {isSubmittingApp ? 'Saving...' : 'Register Official Filing'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
