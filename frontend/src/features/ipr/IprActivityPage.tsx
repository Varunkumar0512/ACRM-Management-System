import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { iprApi } from '../../services/api/iprApi';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { EmptyState } from '../../components/ui/EmptyState';
import { History, FileText, CheckCircle2, MessageSquare, Clock } from 'lucide-react';
import { IIPRDisclosure } from '../../types';

export const IprActivityPage: React.FC = () => {
  const [disclosures, setDisclosures] = useState<IIPRDisclosure[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    iprApi
      .getDisclosures({ limit: 25 })
      .then((data) => setDisclosures(data.disclosures || []))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'IPR & Innovation', path: '/ipr/dashboard' },
          { label: 'IPR Activity' },
        ]}
      />

      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
          Institutional IPR Activity Feed
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Audit trail and recent actions across campus intellectual property disclosures, status updates, and committee reviews.
        </p>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          Loading activity feed...
        </div>
      ) : disclosures.length === 0 ? (
        <EmptyState
          title="No Recent IPR Activity"
          description="Recent submissions, reviews, and status changes will appear here."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {disclosures.map((d) => (
            <div key={d._id} className="acr-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary-50)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary-600)',
                  }}
                >
                  <History size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700 }}>
                    Disclosure Registered: <Link to={`/ipr/disclosures/${d._id}`}>{d.title}</Link>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(d.createdAt).toLocaleString()} • Ref: {d.iprNumber}
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', paddingLeft: '2.75rem' }}>
                Status current: <strong>{d.status.replace(/_/g, ' ')}</strong> | Category: <strong>{d.category}</strong>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
