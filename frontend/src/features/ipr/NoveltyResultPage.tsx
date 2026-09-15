import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { iprApi } from '../../services/api/iprApi';
import { useToast } from '../../hooks/useToast';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  BookOpen,
  FileText,
  Search,
  Check,
  Award,
} from 'lucide-react';
import { INoveltyScreening } from '../../types';

export const NoveltyResultPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [screening, setScreening] = useState<INoveltyScreening | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [acknowledged, setAcknowledged] = useState<boolean>(false);
  const [isAcknowledging, setIsAcknowledging] = useState<boolean>(false);

  useEffect(() => {
    if (!id) return;
    iprApi
      .getScreeningById(id)
      .then((data) => {
        setScreening(data);
        setAcknowledged(!!data.studentAcknowledged);
      })
      .catch((err) => {
        toast.error(err.response?.data?.error?.message || 'Failed to load novelty screening report.');
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleAcknowledge = async () => {
    if (!id) return;
    setIsAcknowledging(true);
    try {
      await iprApi.acknowledgeScreening(id);
      setAcknowledged(true);
      toast.success('Preliminary assessment disclaimer acknowledged.');
    } catch {
      toast.error('Failed to record acknowledgment.');
    } finally {
      setIsAcknowledging(false);
    }
  };

  const getAssessmentColor = (assessment: string) => {
    switch (assessment) {
      case 'POTENTIALLY_DISTINCT':
        return { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' };
      case 'SOME_SIMILARITIES_FOUND':
        return { bg: '#fef3c7', text: '#b45309', border: '#fde68a' };
      case 'SIGNIFICANT_SIMILARITIES_FOUND':
        return { bg: '#fee2e2', text: '#b91c1c', border: '#fecaca' };
      case 'INSUFFICIENT_INFORMATION':
        return { bg: '#f3f4f6', text: '#4b5563', border: '#e5e7eb' };
      default:
        return { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' };
    }
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
        Loading preliminary novelty screening report...
      </div>
    );
  }

  if (!screening) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Novelty Screening Report Not Found</h2>
        <Link to="/ipr/dashboard" className="acr-btn acr-btn-primary" style={{ marginTop: '1rem' }}>
          Back to IPR Dashboard
        </Link>
      </div>
    );
  }

  const assessStyle = getAssessmentColor(screening.assessment);

  return (
    <div style={{ maxWidth: '920px', margin: '0 auto' }}>
      <Breadcrumbs
        items={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'IPR & Innovation', path: '/ipr/dashboard' },
          { label: screening.screeningNumber },
        ]}
      />

      {/* Mandatory Legal Disclaimer Banner */}
      <div
        style={{
          padding: '1rem 1.25rem',
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'center',
        }}
      >
        <ShieldCheck size={20} color="#2563eb" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: '0.8125rem', color: '#1e3a8a', lineHeight: 1.4 }}>
          <strong>Preliminary Research Assistance:</strong> This screening provides an AI-assisted preliminary assessment based on the information and available research sources. It is not a legal opinion and does not determine patentability or guarantee novelty.
        </div>
      </div>

      {/* Main Report Card */}
      <div className="acr-card" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
        <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 700 }}>
              PRELIMINARY NOVELTY SCREENING REPORT #{screening.version}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Screening Date: {new Date(screening.createdAt).toLocaleDateString()}
            </span>
          </div>

          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            {screening.innovationTitle}
          </h1>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Associated Project: <strong>{screening.projectId?.title || 'Campus Research'}</strong> ({screening.projectId?.code})
          </div>
        </div>

        {/* Assessment & Confidence Box */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1.5rem',
            padding: '1.5rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: assessStyle.bg,
            border: `1px solid ${assessStyle.border}`,
            marginBottom: '2rem',
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, color: assessStyle.text, letterSpacing: '0.05em' }}>
              Preliminary Assessment
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: assessStyle.text, marginTop: '0.25rem' }}>
              {screening.assessment.replace(/_/g, ' ')}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, color: assessStyle.text, letterSpacing: '0.05em' }}>
              Confidence Level
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: assessStyle.text, marginTop: '0.25rem' }}>
              {screening.confidence}
            </div>
          </div>
        </div>

        {/* Key Distinguishing Features */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
            Key Distinguishing Features Identified
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {screening.distinguishingFeatures.map((feat, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.65rem',
                  padding: '0.65rem 0.85rem',
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <Check size={16} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Similar Areas Identified */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
            Similar Areas Identified in Campus Research
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            The following campus publications or historical projects share underlying computational or domain concepts:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {screening.sourcesConsulted.sampleSources.length === 0 ? (
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                No direct keyword overlap found in local departmental repositories.
              </div>
            ) : (
              screening.sourcesConsulted.sampleSources.map((s, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '0.75rem 1rem',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-page)',
                  }}
                >
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {idx + 1}. {s.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Type: {s.type} {s.citationOrDoi ? `• DOI: ${s.citationOrDoi}` : ''}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Potential Overlap */}
        {screening.potentialOverlap && (
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              Potential Overlap & Analytical Observations
            </h3>
            <div
              style={{
                padding: '1rem',
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
              }}
            >
              {screening.potentialOverlap}
            </div>
          </div>
        )}

        {/* Recommended Next Steps */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
            Recommended Next Steps
          </h3>
          <ul style={{ paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {screening.recommendedNextSteps.map((step, idx) => (
              <li key={idx} style={{ marginBottom: '0.35rem' }}>
                {step}
              </li>
            ))}
          </ul>
        </div>

        {/* Source Transparency Breakdown */}
        <div
          style={{
            padding: '1.25rem',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-subtle)',
            marginBottom: '2rem',
            fontSize: '0.8125rem',
          }}
        >
          <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Sources Considered Transparency
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '0.75rem' }}>
            <div>
              <div style={{ color: 'var(--text-muted)' }}>Research Papers Checked:</div>
              <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>
                {screening.sourcesConsulted.papersCount}
              </strong>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)' }}>Patent Records Checked:</div>
              <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>
                {screening.sourcesConsulted.patentRecordsCount}
              </strong>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)' }}>Campus Project Records:</div>
              <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>
                {screening.sourcesConsulted.institutionalCount}
              </strong>
            </div>
          </div>
          <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.75rem' }}>
            {screening.sourcesConsulted.message}
          </div>
        </div>

        {/* Mandatory Student Acknowledgment Section */}
        <div
          style={{
            padding: '1.5rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: acknowledged ? '#f0fdf4' : '#fffbeb',
            border: `1px solid ${acknowledged ? '#bbf7d0' : '#fde68a'}`,
            marginBottom: '2rem',
          }}
        >
          <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: acknowledged ? '#15803d' : '#92400e', marginBottom: '0.5rem' }}>
            Student Inventor Acknowledgment
          </div>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: acknowledged ? 'default' : 'pointer' }}>
            <input
              type="checkbox"
              checked={acknowledged}
              disabled={acknowledged || isAcknowledging}
              onChange={handleAcknowledge}
              style={{ marginTop: '3px', width: '18px', height: '18px' }}
            />
            <span style={{ fontSize: '0.875rem', color: acknowledged ? '#166534' : '#78350f', lineHeight: 1.5 }}>
              "I understand that this AI-assisted screening is preliminary and does not constitute legal advice or a determination of patentability."
            </span>
          </label>
          {acknowledged && (
            <div style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <CheckCircle2 size={14} />
              <span>Acknowledged on {screening.acknowledgedAt ? new Date(screening.acknowledgedAt).toLocaleString() : 'Record'}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <Link to={`/projects/${screening.projectId?._id || screening.projectId}`} className="acr-btn acr-btn-ghost">
            Return to Project
          </Link>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link
              to={`/ipr/novelty?projectId=${screening.projectId?._id || screening.projectId}`}
              className="acr-btn acr-btn-secondary"
            >
              <RotateCcw size={14} />
              <span>Re-run Screening</span>
            </Link>

            <Button
              variant="primary"
              disabled={!acknowledged}
              onClick={() =>
                navigate(
                  `/ipr/submit?screeningId=${screening._id}&projectId=${screening.projectId?._id || screening.projectId}`
                )
              }
              icon={<ArrowRight size={16} />}
            >
              Continue to IPR Disclosure
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
