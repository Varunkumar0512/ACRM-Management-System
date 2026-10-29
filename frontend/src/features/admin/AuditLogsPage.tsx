import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api/otherApis';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { History, Shield, Search } from 'lucide-react';
import { PageHeader } from '../../components/dashboard';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [actionFilter, setActionFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadLogs = () => {
    setIsLoading(true);
    adminApi
      .getAuditLogs({ action: actionFilter || undefined, limit: 100 })
      .then((data) => setLogs(data.logs || []))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadLogs();
  }, [actionFilter]);

  return (
    <div>
      <PageHeader
        title="System Audit & Security Logs"
        subtitle="Immutable event records tracking authentication events, status updates, reviews, and administrative changes"
        breadcrumbs={[
          { label: 'Admin', path: '/admin/dashboard' },
          { label: 'Audit Logs' },
        ]}
      />

      {/* Filter Bar */}
      <div className="acr-card" style={{ padding: '0.85rem 1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <select
            className="acr-select"
            style={{ maxWidth: '300px' }}
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
          >
            <option value="">All Security Events & Actions</option>
            <option value="LOGIN_SUCCESS">LOGIN_SUCCESS</option>
            <option value="LOGIN_FAILED">LOGIN_FAILED</option>
            <option value="PROJECT_CREATED">PROJECT_CREATED</option>
            <option value="PROJECT_STATUS_CHANGED">PROJECT_STATUS_CHANGED</option>
            <option value="REVIEW_SUBMITTED">REVIEW_SUBMITTED</option>
            <option value="USER_STATUS_CHANGED">USER_STATUS_CHANGED</option>
          </select>

          <Button variant="secondary" onClick={loadLogs}>
            Refresh Logs
          </Button>
        </div>
      </div>

      {/* Audit Log Table */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Retrieving audit records...
        </div>
      ) : (
        <div className="acr-table-container">
          <table className="acr-table">
            <thead>
              <tr>
                <th>Action Event</th>
                <th>Resource</th>
                <th>User / Operator</th>
                <th>Context Details</th>
                <th>IP Address</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id}>
                  <td>
                    <span
                      className="acr-badge acr-badge-neutral"
                      style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td>
                    <strong>{log.resourceType}</strong>
                    {log.resourceId && (
                      <span style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {log.resourceId}
                      </span>
                    )}
                  </td>
                  <td>
                    {log.userId ? (
                      <div>
                        <div style={{ fontWeight: 600 }}>{log.userId.fullName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{log.userId.email}</div>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Anonymous / Gateway</span>
                    )}
                  </td>
                  <td style={{ fontSize: '0.75rem', maxWidth: '280px', wordBreak: 'break-word', fontFamily: 'var(--font-mono)' }}>
                    {log.details ? JSON.stringify(log.details) : '—'}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                    {log.ipAddress || '127.0.0.1'}
                  </td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
