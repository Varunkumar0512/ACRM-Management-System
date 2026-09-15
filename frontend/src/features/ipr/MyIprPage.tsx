import React, { useState, useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { iprApi } from '../../services/api/iprApi';
import { useAuth } from '../../hooks/useAuth';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  FileText,
  PlusCircle,
  Sparkles,
  Filter,
  Search,
  ArrowRight,
  Clock,
  ShieldCheck,
  Award,
  Layers,
} from 'lucide-react';
import { IIPRDisclosure } from '../../types';

export const MyIprPage: React.FC = () => {
  const { user } = useAuth();
  const { category: routeCategory } = useParams<{ category?: string }>();
  const [searchParams] = useSearchParams();

  const [disclosures, setDisclosures] = useState<IIPRDisclosure[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>(routeCategory?.toUpperCase() || 'ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    if (routeCategory) {
      setSelectedCategory(routeCategory.toUpperCase());
    }
  }, [routeCategory]);

  const fetchDisclosures = async () => {
    setIsLoading(true);
    try {
      const params: any = { mineOnly: user?.role === 'STUDENT' };
      if (selectedCategory !== 'ALL') {
        params.category = selectedCategory;
      }
      if (selectedStatus !== 'ALL') {
        params.status = selectedStatus;
      }
      const data = await iprApi.getDisclosures(params);
      setDisclosures(data.disclosures || []);
    } catch (err) {
      console.error('Failed to load disclosures', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDisclosures();
  }, [selectedCategory, selectedStatus]);

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

  const filteredDisclosures = disclosures.filter((d) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      d.title.toLowerCase().includes(query) ||
      d.iprNumber.toLowerCase().includes(query) ||
      (d.summary && d.summary.toLowerCase().includes(query))
    );
  });

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'IPR & Innovation', path: '/ipr/dashboard' },
          { label: routeCategory ? `${selectedCategory} Disclosures` : 'My IPR Disclosures' },
        ]}
      />

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            {routeCategory ? `${selectedCategory} Portfolio` : 'Institutional IPR Disclosures'}
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Track campus patent disclosures, copyright declarations, trademark applications, and inventions.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/ipr/novelty" className="acr-btn acr-btn-secondary">
            <Sparkles size={16} />
            <span>AI Novelty Screening</span>
          </Link>
          <Link to="/ipr/submit" className="acr-btn acr-btn-primary">
            <PlusCircle size={16} />
            <span>Submit Disclosure</span>
          </Link>
        </div>
      </div>

      {/* Filters Bar */}
      <div
        className="acr-card"
        style={{
          padding: '1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }}
          />
          <input
            type="text"
            className="acr-input"
            placeholder="Search by title, reference #, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.25rem' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>Category:</span>
          {['ALL', 'PATENT', 'COPYRIGHT', 'TRADEMARK', 'INVENTION'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`acr-btn acr-btn-sm ${selectedCategory === cat ? 'acr-btn-primary' : 'acr-btn-ghost'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>Status:</span>
          <select
            className="acr-input"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.8125rem' }}
          >
            <option value="ALL">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="INITIAL_REVIEW">Initial Review</option>
            <option value="ASSESSMENT">Assessment</option>
            <option value="RECOMMENDED">Recommended</option>
            <option value="APPROVED">Approved</option>
            <option value="APPLICATION_IN_PROGRESS">Application in Progress</option>
            <option value="FILED">Filed</option>
            <option value="GRANTED">Granted</option>
          </select>
        </div>
      </div>

      {/* Disclosures Listing */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          Loading IPR disclosures...
        </div>
      ) : filteredDisclosures.length === 0 ? (
        <EmptyState
          title="No IPR Disclosures Found"
          description={
            searchQuery || selectedCategory !== 'ALL' || selectedStatus !== 'ALL'
              ? 'No disclosures match your selected criteria. Try adjusting your filters.'
              : 'You have not submitted any IPR disclosures yet. Complete an AI Novelty Screening to begin.'
          }
          actionLabel="Start Novelty Screening"
          onAction={() => (window.location.href = '/ipr/novelty')}
        />
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {filteredDisclosures.map((d) => (
            <div key={d._id} className="acr-card" style={{ padding: '1.25rem' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                  marginBottom: '0.75rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: 'var(--primary-700)',
                        backgroundColor: 'var(--primary-50)',
                        padding: '0.15rem 0.5rem',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      {d.iprNumber}
                    </span>
                    <span className="acr-badge acr-badge-info">{d.category}</span>
                    <Badge variant={getStatusBadgeVariant(d.status)}>{d.status.replace(/_/g, ' ')}</Badge>
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0.25rem 0' }}>
                    <Link
                      to={`/ipr/disclosures/${d._id}`}
                      style={{ color: 'var(--text-primary)', textDecoration: 'none' }}
                    >
                      {d.title}
                    </Link>
                  </h3>
                </div>

                <Link to={`/ipr/disclosures/${d._id}`} className="acr-btn acr-btn-secondary acr-btn-sm">
                  <span>View Details</span>
                  <ArrowRight size={14} />
                </Link>
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.5 }}>
                {d.summary}
              </p>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                  <span>
                    <strong>Project:</strong> {d.projectId?.title || 'Campus Innovation'}
                  </span>
                  <span>
                    <strong>Confidentiality:</strong> {d.confidentiality.replace(/_/g, ' ')}
                  </span>
                  <span>
                    <strong>Co-Inventors:</strong> {d.coInventors?.length || 0}
                  </span>
                </div>
                <span>Submitted on {new Date(d.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
