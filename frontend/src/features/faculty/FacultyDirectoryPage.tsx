import React, { useState, useEffect } from 'react';
import { facultyApi } from '../../services/api/otherApis';
import { IFacultyProfile } from '../../types';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Search, GraduationCap, Mail, MapPin, ExternalLink, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import { PageHeader } from '../../components/dashboard';

export const FacultyDirectoryPage: React.FC = () => {
  const [facultyList, setFacultyList] = useState<IFacultyProfile[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    facultyApi
      .listFaculty({
        department: selectedDepartment || undefined,
        availableOnly: availableOnly || undefined,
      })
      .then((data) => setFacultyList(data.profiles || []))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [selectedDepartment, availableOnly]);

  return (
    <div>
      <PageHeader
        title="Faculty Mentors & Research Guides"
        subtitle="Verified institutional faculty profiles, academic designations, areas of expertise, and guidance capacities"
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Mentorship' },
          { label: 'Faculty Directory' },
        ]}
      />

      {/* Filters */}
      <div className="acr-card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            className="acr-select"
            style={{ flex: 1, minWidth: '220px' }}
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
          >
            <option value="">All Academic Departments</option>
            <option>Computer Science & Engineering</option>
            <option>Data Science & Artificial Intelligence</option>
            <option>Electronics & Communication Engineering</option>
            <option>Cybersecurity & Information Security</option>
          </select>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(e) => setAvailableOnly(e.target.checked)}
            />
            <span>Available for Guidance Only</span>
          </label>
        </div>
      </div>

      {/* Faculty Cards */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Loading faculty mentor profiles...
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
          {facultyList.map((f) => {
            const isFull = (f.currentActiveProjectsCount || 0) >= f.maxActiveProjectsGuide;
            return (
              <div key={f._id} className="acr-card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="acr-card-body" style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {f.userId?.fullName}
                      </h3>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--primary-600)', fontWeight: 600 }}>
                        {f.designation}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {f.department}
                      </div>
                    </div>

                    <Badge variant={isFull ? 'danger' : 'success'}>
                      {isFull ? 'At Capacity' : 'Available'}
                    </Badge>
                  </div>

                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.5 }}>
                    {f.currentResearchSummary || 'Conducting research across advanced computing and engineering domains.'}
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                      Areas of Expertise
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {f.areasOfExpertise?.map((area, i) => (
                        <span key={i} className="acr-badge acr-badge-neutral" style={{ fontSize: '0.6875rem' }}>
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div>Experience: <strong>{f.experienceYears} Years</strong></div>
                    <div>Active Mentorship: <strong>{f.currentActiveProjectsCount || 0} / {f.maxActiveProjectsGuide} Projects</strong></div>
                    {f.cabinLocation && <div>Location: <strong>{f.cabinLocation}</strong></div>}
                  </div>
                </div>

                <div className="acr-card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {f.employeeId}
                  </span>

                  <Link to="/projects/create" className="acr-btn acr-btn-secondary acr-btn-sm">
                    <span>Request as Guide</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
