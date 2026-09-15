import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { iprApi } from '../../services/api/iprApi';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { EmptyState } from '../../components/ui/EmptyState';
import { FileText, Download, ExternalLink, ShieldCheck } from 'lucide-react';
import { IIPRDisclosure } from '../../types';

export const IprDocumentsPage: React.FC = () => {
  const [disclosures, setDisclosures] = useState<IIPRDisclosure[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    iprApi
      .getDisclosures({ limit: 50 })
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
          { label: 'IPR Documents' },
        ]}
      />

      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
          Institutional IPR Documentation
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Centralized repository of patent specifications, copyright forms, claims sheets, and novelty screening reports.
        </p>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          Loading document index...
        </div>
      ) : disclosures.length === 0 ? (
        <EmptyState
          title="No IPR Documents Found"
          description="Documents uploaded as part of formal disclosures and novelty screenings will be cataloged here."
        />
      ) : (
        <div className="acr-card">
          <div className="acr-table-container">
            <table className="acr-table">
              <thead>
                <tr>
                  <th>IPR Reference</th>
                  <th>Innovation Title</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Files & Action</th>
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
                    <td>
                      <span className="acr-badge acr-badge-neutral">{d.status}</span>
                    </td>
                    <td>
                      <Link to={`/ipr/disclosures/${d._id}`} className="acr-btn acr-btn-ghost acr-btn-sm">
                        <span>Open Document Vault</span>
                        <ExternalLink size={14} />
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
