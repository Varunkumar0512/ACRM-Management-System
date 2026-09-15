import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { iprApi } from '../../services/api/iprApi';
import { useAuth } from '../../hooks/useAuth';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { FileText, Clock, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { IIPRDisclosure } from '../../types';

export const IprReviewsPage: React.FC = () => {
  const { user } = useAuth();
  const [disclosures, setDisclosures] = useState<IIPRDisclosure[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    iprApi
      .getDisclosures({ mineOnly: false })
      .then((data) => {
        // Disclosures that require attention or under assessment
        const reviewList = (data.disclosures || []).filter((d: IIPRDisclosure) =>
          ['SUBMITTED', 'INITIAL_REVIEW', 'ASSESSMENT', 'INFORMATION_REQUESTED'].includes(d.status)
        );
        setDisclosures(reviewList);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'IPR & Innovation', path: '/ipr/dashboard' },
          { label: 'IPR Reviews Queue' },
        ]}
      />

      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
          IPR Committee Review Queue
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Assess student and faculty intellectual property disclosures, examine AI preliminary novelty results, and render institutional recommendations.
        </p>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          Loading review queue...
        </div>
      ) : disclosures.length === 0 ? (
        <EmptyState
          title="No Pending Disclosures for Review"
          description="All submitted disclosures have been evaluated or no new items are waiting for committee action."
        />
      ) : (
        <div className="acr-card">
          <div className="acr-table-container">
            <table className="acr-table">
              <thead>
                <tr>
                  <th>Ref #</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Inventor</th>
                  <th>Status</th>
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
                    <td style={{ fontSize: '0.8125rem' }}>
                      {d.primaryInventorId?.fullName || 'Campus Inventor'}
                    </td>
                    <td>
                      <Badge variant="warning">{d.status.replace(/_/g, ' ')}</Badge>
                    </td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(d.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <Link to={`/ipr/disclosures/${d._id}`} className="acr-btn acr-btn-primary acr-btn-sm">
                        <span>Review</span>
                        <ArrowRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
