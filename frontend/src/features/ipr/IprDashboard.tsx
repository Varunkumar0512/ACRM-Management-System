import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { iprApi } from '../../services/api/iprApi';
import { useAuth } from '../../hooks/useAuth';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  ShieldCheck,
  Sparkles,
  Award,
  FileText,
  Clock,
  CheckCircle2,
  ArrowRight,
  PlusCircle,
  Search,
  BookOpen,
  FolderGit2,
  Scale,
} from 'lucide-react';
import { IIPRDisclosure } from '../../types';

export const IprDashboard: React.FC = () => {
  const { user } = useAuth();
  const [disclosures, setDisclosures] = useState<IIPRDisclosure[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    iprApi
      .getDisclosures({ limit: 10 })
      .then((data) => {
        setDisclosures(data.disclosures || []);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'GRANTED':
      case 'APPROVED':
        return 'success';
      case 'SUBMITTED':
      case 'INITIAL_REVIEW':
      case 'ASSESSMENT':
      case 'APPLICATION_IN_PROGRESS':
      case 'FILED':
        return 'info';
      case 'INFORMATION_REQUESTED':
      case 'RECOMMENDED':
        return 'warning';
      case 'REJECTED':
      case 'WITHDRAWN':
      case 'CLOSED':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'IPR & Innovation' }]} />

      {/* Welcome & Action Banner */}
      <div
        style={{
          padding: '2rem',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
            <span className="acr-badge acr-badge-info" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <ShieldCheck size={14} />
              <span>Institutional IPR Protection</span>
            </span>
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
            IPR & Innovation Management
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '680px', lineHeight: 1.5 }}>
            Protect campus inventions, patents, copyrights, and industrial designs. All submissions undergo an AI-assisted preliminary novelty screening before formal institutional review.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/ipr/novelty" className="acr-btn acr-btn-primary">
            <Sparkles size={16} />
            <span>AI Novelty Screening</span>
          </Link>
          <Link to="/ipr/my" className="acr-btn acr-btn-secondary">
            <FileText size={16} />
            <span>My Disclosures</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        <div className="acr-card acr-card-body">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Total Disclosures
            </span>
            <FileText size={18} color="var(--primary-600)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--text-primary)' }}>
            {disclosures.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Institutional filings & drafts
          </div>
        </div>

        <div className="acr-card acr-card-body">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Under Review
            </span>
            <Clock size={18} color="#d97706" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--text-primary)' }}>
            {disclosures.filter((d) => d.status === 'INITIAL_REVIEW' || d.status === 'ASSESSMENT' || d.status === 'SUBMITTED').length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Active committee assessments
          </div>
        </div>

        <div className="acr-card acr-card-body">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Patents Filed / Granted
            </span>
            <Award size={18} color="#059669" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--text-primary)' }}>
            {disclosures.filter((d) => d.status === 'FILED' || d.status === 'GRANTED').length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Secured intellectual property
          </div>
        </div>

        <div className="acr-card acr-card-body">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Categories Supported
            </span>
            <Scale size={18} color="#7c3aed" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--text-primary)' }}>
            4
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Patents, Copyrights, Trademarks, Inventions
          </div>
        </div>
      </div>

      {/* Mandatory Workflow Banner */}
      <div
        style={{
          padding: '1.25rem 1.5rem',
          backgroundColor: 'var(--bg-subtle)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Sparkles size={22} color="var(--primary-600)" />
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Mandatory AI-Assisted Preliminary Novelty Screening
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Before final IPR disclosure submission, all campus innovations must complete preliminary screening and source comparison.
            </div>
          </div>
        </div>

        <Link to="/ipr/novelty" className="acr-btn acr-btn-primary acr-btn-sm">
          <span>Start Novelty Screening</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Recent Disclosures Table */}
      <div className="acr-card">
        <div className="acr-card-header">
          <div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Institutional IPR Disclosures</h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Disclosures under review, recommended for filing, or completed
            </p>
          </div>
          <Link to="/ipr/my" className="acr-btn acr-btn-ghost acr-btn-sm">
            View All Disclosures <ArrowRight size={14} />
          </Link>
        </div>

        <div className="acr-card-body" style={{ padding: 0 }}>
          {isLoading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading institutional IPR records...
            </div>
          ) : disclosures.length === 0 ? (
            <div style={{ padding: '2.5rem' }}>
              <EmptyState
                title="No IPR Disclosures Registered Yet"
                description="Have you built a novel research project? Run the AI-assisted preliminary novelty screening to evaluate protectability."
                actionLabel="Begin Novelty Screening"
                onAction={() => (window.location.href = '/ipr/novelty')}
              />
            </div>
          ) : (
            <div className="acr-table-container">
              <table className="acr-table">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Innovation Title</th>
                    <th>Category</th>
                    <th>Associated Project</th>
                    <th>Status</th>
                    <th>Confidentiality</th>
                    <th>Submitted</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {disclosures.map((d) => (
                    <tr key={d._id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700 }}>
                        {d.iprNumber}
                      </td>
                      <td>
                        <Link
                          to={`/ipr/disclosures/${d._id}`}
                          style={{ fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none' }}
                        >
                          {d.title}
                        </Link>
                      </td>
                      <td>
                        <span className="acr-badge acr-badge-info">{d.category}</span>
                      </td>
                      <td style={{ fontSize: '0.8125rem' }}>{d.projectId?.code || 'Campus Research'}</td>
                      <td>
                        <Badge variant={getStatusBadgeVariant(d.status)}>{d.status.replace(/_/g, ' ')}</Badge>
                      </td>
                      <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {d.confidentiality.replace(/_/g, ' ')}
                      </td>
                      <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(d.createdAt).toLocaleDateString()}
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
    </div>
  );
};
