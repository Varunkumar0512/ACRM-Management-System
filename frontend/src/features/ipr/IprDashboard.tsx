import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { iprApi } from '../../services/api/iprApi';
import { useAuth } from '../../hooks/useAuth';
import {
  ShieldCheck,
  Sparkles,
  Award,
  FileText,
  Clock,
  ArrowRight,
  PlusCircle,
  Scale,
  AlertCircle,
  FileCheck2,
  CheckCircle2,
  Search,
  Filter,
  Info,
} from 'lucide-react';
import { IIPRDisclosure, IprCategory } from '../../types';
import {
  PageHeader,
  StatCard,
  DashboardSection,
  QuickActionCard,
  DashboardSkeleton,
  ErrorState,
} from '../../components/dashboard';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';

export const IprDashboard: React.FC = () => {
  const { user } = useAuth();
  const [disclosures, setDisclosures] = useState<IIPRDisclosure[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);

  const fetchDisclosures = useCallback(async () => {
    try {
      setHasError(false);
      const data = await iprApi.getDisclosures({ limit: 50 });
      setDisclosures(data.disclosures || []);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
      setIsRetrying(false);
    }
  }, []);

  useEffect(() => {
    fetchDisclosures();
  }, [fetchDisclosures]);

  const handleRetry = () => {
    setIsRetrying(true);
    fetchDisclosures();
  };

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

  if (isLoading) {
    return <DashboardSkeleton kpiCount={4} />;
  }

  if (hasError) {
    return (
      <ErrorState
        title="Institutional IPR Repository Unavailable"
        message="Could not connect to the campus Intellectual Property management service. Please retry."
        onRetry={handleRetry}
        isRetrying={isRetrying}
      />
    );
  }

  // Filtered disclosures
  const filteredDisclosures = disclosures.filter((d) => {
    const matchesCategory =
      selectedCategory === 'ALL' || d.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.iprNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Calculate lifecycle stages
  const stageCounts = {
    submitted: disclosures.filter((d) => d.status === 'SUBMITTED').length,
    review: disclosures.filter(
      (d) => d.status === 'INITIAL_REVIEW' || d.status === 'INFORMATION_REQUESTED'
    ).length,
    assessment: disclosures.filter((d) => d.status === 'ASSESSMENT').length,
    recommended: disclosures.filter((d) => d.status === 'RECOMMENDED' || d.status === 'APPROVED').length,
    filed: disclosures.filter(
      (d) => d.status === 'APPLICATION_IN_PROGRESS' || d.status === 'FILED'
    ).length,
    granted: disclosures.filter((d) => d.status === 'GRANTED').length,
  };

  const underReviewCount =
    stageCounts.submitted + stageCounts.review + stageCounts.assessment;
  const filedOrGrantedCount = stageCounts.filed + stageCounts.granted;

  return (
    <div>
      {/* 1. Header Banner */}
      <PageHeader
        title="Intellectual Property & Innovation Management"
        subtitle="Centralized institutional governance for campus inventions, patents, utility models, copyrights, and industrial designs."
        badge={
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '0.2rem 0.6rem',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: '#EEF2FF',
              color: '#4169E1',
              letterSpacing: '0.04em',
            }}
          >
            Institutional IPR Office
          </span>
        }
        actions={
          <>
            <Link to="/ipr/novelty" className="acr-btn acr-btn-primary">
              <Sparkles size={15} />
              <span>Novelty Screening</span>
            </Link>
            <Link to="/ipr/submit" className="acr-btn acr-btn-secondary">
              <PlusCircle size={15} />
              <span>New Disclosure</span>
            </Link>
            <Link to="/ipr/my" className="acr-btn acr-btn-ghost">
              <FileText size={15} />
              <span>My Disclosures</span>
            </Link>
          </>
        }
      />

      {/* 2. Institutional Advisory / Safety Notice */}
      <div
        style={{
          padding: '1rem 1.25rem',
          backgroundColor: '#EFF6FF',
          border: '1px solid #BFDBFE',
          borderRadius: 'var(--radius-md)',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem',
        }}
      >
        <Info size={18} color="#4169E1" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: '0.78rem', color: '#1E40AF', lineHeight: 1.45 }}>
          <strong>Institutional Policy Notice:</strong> All AI-assisted novelty assessments provide preliminary prior-art heuristics and differentiation guidance only. They do not constitute formal patentability guarantees or official legal patent office opinions.
        </div>
      </div>

      {/* 3. KPI Metrics Grid */}
      <div className="acr-kpi-grid">
        <StatCard
          title="TOTAL DISCLOSURES"
          value={disclosures.length < 10 ? `0${disclosures.length}` : disclosures.length}
          subtitle="All recorded institutional filings"
          icon={<FileText size={18} />}
          accent="blue"
        />
        <StatCard
          title="IN ACTIVE REVIEW"
          value={underReviewCount < 10 ? `0${underReviewCount}` : underReviewCount}
          subtitle="Screening & committee assessment"
          icon={<Clock size={18} />}
          accent="amber"
          badge={underReviewCount > 0 ? 'Under Evaluation' : undefined}
        />
        <StatCard
          title="FILED & GRANTED"
          value={filedOrGrantedCount < 10 ? `0${filedOrGrantedCount}` : filedOrGrantedCount}
          subtitle="Official patent office filings"
          icon={<Award size={18} />}
          accent="emerald"
        />
        <StatCard
          title="IPR CATEGORIES"
          value="04"
          subtitle="Patents, Copyrights, Trademarks, Designs"
          icon={<Scale size={18} />}
          accent="purple"
        />
      </div>

      {/* 4. Visual Filing Lifecycle Pipeline */}
      <div
        className="acr-card"
        style={{
          padding: '1.5rem',
          marginBottom: '2rem',
          backgroundColor: 'var(--bg-surface)',
        }}
      >
        <div style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Institutional Filing Lifecycle Pipeline
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Real-time status tracking of campus disclosures across each formal evaluation stage
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gap: '0.75rem',
          }}
          className="acr-pipeline-grid"
        >
          {[
            { label: 'Submitted', count: stageCounts.submitted, color: '#38BDF8' },
            { label: 'Committee Review', count: stageCounts.review, color: '#F59E0B' },
            { label: 'Novelty Assessment', count: stageCounts.assessment, color: '#8B5CF6' },
            { label: 'Recommended', count: stageCounts.recommended, color: '#2457D6' },
            { label: 'Office Filed', count: stageCounts.filed, color: '#059669' },
            { label: 'Patent Granted', count: stageCounts.granted, color: '#10B981' },
          ].map((stage, idx) => (
            <div
              key={idx}
              style={{
                padding: '0.85rem 1rem',
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                borderTop: `3px solid ${stage.color}`,
              }}
            >
              <div style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
                {stage.label}
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem', fontFamily: 'var(--font-display)' }}>
                {stage.count}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Institutional Disclosures Table with Filters */}
      <DashboardSection
        title="Campus Intellectual Property Disclosures"
        subtitle="Comprehensive register of inventions, student projects, and patent documentation"
        icon={<ShieldCheck size={18} />}
        action={
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Search filter input */}
            <div style={{ position: 'relative', width: '220px' }}>
              <Search
                size={14}
                color="var(--text-muted)"
                style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '0.65rem' }}
              />
              <input
                type="text"
                placeholder="Filter disclosures..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.4rem 0.65rem 0.4rem 2rem',
                  fontSize: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-default)',
                  backgroundColor: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                }}
              />
            </div>
          </div>
        }
        noPadding
      >
        {/* Category filter pills */}
        <div
          style={{
            padding: '0.75rem 1.25rem',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'var(--bg-subtle)',
            overflowX: 'auto',
          }}
        >
          {['ALL', 'PATENT', 'COPYRIGHT', 'TRADEMARK', 'INVENTION'].map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '0.3rem 0.75rem',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  border: '1px solid',
                  borderColor: isActive ? 'var(--color-royal-blue)' : 'var(--border-default)',
                  backgroundColor: isActive ? 'var(--color-royal-blue)' : 'var(--bg-surface)',
                  color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                {cat.charAt(0) + cat.slice(1).toLowerCase()}
              </button>
            );
          })}
        </div>

        {filteredDisclosures.length === 0 ? (
          <div style={{ padding: '2.5rem' }}>
            <EmptyState
              title="No matching IPR disclosures found"
              description="Have you built a novel research project? Run an AI-assisted novelty screening or submit a new disclosure."
              actionLabel="Submit Disclosure"
              onAction={() => (window.location.href = '/ipr/submit')}
            />
          </div>
        ) : (
          <div className="acr-table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="acr-table">
              <thead>
                <tr>
                  <th>Reference Code</th>
                  <th>Innovation Title</th>
                  <th>Category</th>
                  <th>Associated Project</th>
                  <th>Workflow Status</th>
                  <th>Confidentiality</th>
                  <th>Submission Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredDisclosures.map((d) => (
                  <tr key={d._id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700 }}>
                      {d.iprNumber}
                    </td>
                    <td>
                      <Link
                        to={`/ipr/disclosures/${d._id}`}
                        style={{ fontWeight: 700, color: 'var(--text-primary)', textDecoration: 'none' }}
                      >
                        {d.title}
                      </Link>
                    </td>
                    <td>
                      <span className="acr-badge acr-badge-info">{d.category}</span>
                    </td>
                    <td style={{ fontSize: '0.78rem' }}>{d.projectId?.code || 'Campus Project'}</td>
                    <td>
                      <Badge variant={getStatusBadgeVariant(d.status)}>
                        {d.status.replace(/_/g, ' ')}
                      </Badge>
                    </td>
                    <td style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {d.confidentiality?.replace(/_/g, ' ')}
                    </td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {new Date(d.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <Link to={`/ipr/disclosures/${d._id}`} className="acr-btn acr-btn-ghost acr-btn-sm">
                        View Dossier
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DashboardSection>

      <style>{`
        @media (max-width: 1024px) {
          .acr-pipeline-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
        @media (max-width: 640px) {
          .acr-pipeline-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </div>
  );
};
