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
  ArrowRight,
  PlusCircle,
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

      {/* Enterprise Header Banner */}
      <div
        style={{
          padding: '1.75rem 2rem',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
          boxShadow: 'var(--shadow-xs)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
            <span className="acr-badge acr-badge-primary">
              <ShieldCheck size={13} />
              <span>Institutional IPR Office</span>
            </span>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
            IPR & Innovation Management
          </h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', maxWidth: '680px', lineHeight: 1.5 }}>
            Protect campus inventions, patents, copyrights, and industrial designs. All submissions undergo an AI-assisted preliminary novelty screening before formal institutional review.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/ipr/novelty" className="acr-btn acr-btn-primary">
            <Sparkles size={15} />
            <span>AI Novelty Screening</span>
          </Link>
          <Link to="/ipr/my" className="acr-btn acr-btn-secondary">
            <FileText size={15} />
            <span>My Disclosures</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        <div className="acr-kpi-card">
          <div className="acr-kpi-header">
            <span className="acr-kpi-title">Total Disclosures</span>
            <FileText size={16} color="var(--primary-600)" />
          </div>
          <div className="acr-kpi-value">{disclosures.length}</div>
          <div className="acr-kpi-sub">Institutional filings & drafts</div>
        </div>

        <div className="acr-kpi-card">
          <div className="acr-kpi-header">
            <span className="acr-kpi-title">Under Review</span>
            <Clock size={16} color="#d97706" />
          </div>
          <div className="acr-kpi-value">
            {disclosures.filter((d) => d.status === 'INITIAL_REVIEW' || d.status === 'ASSESSMENT' || d.status === 'SUBMITTED').length}
          </div>
          <div className="acr-kpi-sub">Active committee assessments</div>
        </div>

        <div className="acr-kpi-card">
          <div className="acr-kpi-header">
            <span className="acr-kpi-title">Patents Filed</span>
            <Award size={16} color="#059669" />
          </div>
          <div className="acr-kpi-value">
            {disclosures.filter((d) => d.status === 'FILED' || d.status === 'GRANTED').length}
          </div>
          <div className="acr-kpi-sub">Secured campus intellectual property</div>
        </div>

        <div className="acr-kpi-card">
          <div className="acr-kpi-header">
            <span className="acr-kpi-title">IPR Categories</span>
            <Scale size={16} color="#7c3aed" />
          </div>
          <div className="acr-kpi-value">4</div>
          <div className="acr-kpi-sub">Patents, Copyrights, Trademarks, Inventions</div>
        </div>
      </div>

      {/* Workflow Banner */}
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
          <Sparkles size={20} color="var(--primary-600)" />
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Preliminary AI Novelty Screening
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              All project innovations undergo automated novelty evaluation against international prior art before committee review.
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
            <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>Institutional IPR Disclosures</h2>
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
            <div className="acr-table-container" style={{ border: 'none', borderRadius: 0 }}>
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
