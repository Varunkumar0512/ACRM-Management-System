import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { iprApi } from '../../services/api/iprApi';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import {
  ShieldCheck,
  Award,
  AlertCircle,
  Plus,
  Trash2,
  CheckCircle2,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { INoveltyScreening } from '../../types';

export const IprSubmitPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const screeningId = searchParams.get('screeningId') || '';
  const projectId = searchParams.get('projectId') || '';
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  const [screening, setScreening] = useState<INoveltyScreening | null>(null);
  const [isLoadingScreening, setIsLoadingScreening] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '',
    category: 'PATENT',
    confidentiality: 'INSTITUTION_ONLY',
    summary: '',
    commercialPotential: '',
    stageOfDevelopment: 'LAB_PROTOTYPE',
    acknowledgementAccepted: false,
    coInventors: [
      { name: '', email: '', department: '', sharePercentage: 0 },
    ],
  });

  useEffect(() => {
    if (!screeningId) {
      setIsLoadingScreening(false);
      return;
    }

    iprApi
      .getScreeningById(screeningId)
      .then((data) => {
        setScreening(data);
        setForm((prev) => ({
          ...prev,
          title: data.innovationTitle,
          summary: `${data.problem}\n\nProposed Technical Solution:\n${data.proposedSolution}`,
        }));
      })
      .catch(() => {
        toast.error('Failed to load novelty screening data.');
      })
      .finally(() => setIsLoadingScreening(false));
  }, [screeningId]);

  const handleAddCoInventor = () => {
    setForm({
      ...form,
      coInventors: [...form.coInventors, { name: '', email: '', department: '', sharePercentage: 0 }],
    });
  };

  const handleCoInventorChange = (index: number, field: string, value: any) => {
    const updated = [...form.coInventors];
    (updated[index] as any)[field] = value;
    setForm({ ...form, coInventors: updated });
  };

  const handleRemoveCoInventor = (index: number) => {
    setForm({
      ...form,
      coInventors: form.coInventors.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!screeningId || !projectId) {
      setErrorMessage('A completed AI Novelty Screening is required before submitting an IPR disclosure.');
      return;
    }

    if (!form.acknowledgementAccepted) {
      setErrorMessage('You must acknowledge that this submission does not constitute a guaranteed patent or legal certificate.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const cleanInventors = form.coInventors.filter((c) => c.name.trim() && c.email.trim());

      const res = await iprApi.submitDisclosure({
        title: form.title.trim(),
        category: form.category,
        projectId,
        screeningId,
        confidentiality: form.confidentiality,
        summary: form.summary.trim(),
        commercialPotential: form.commercialPotential.trim(),
        stageOfDevelopment: form.stageOfDevelopment,
        coInventors: cleanInventors,
        acknowledgementAccepted: true,
      });

      toast.success('IPR disclosure successfully registered for institutional review.');
      navigate(`/ipr/disclosures/${res._id}`);
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.error?.message || 'Failed to submit IPR disclosure. Please check your information.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingScreening) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
        Verifying preliminary novelty screening status...
      </div>
    );
  }

  // Enforce workflow: Must have completed screening!
  if (!screeningId || !screening) {
    return (
      <div style={{ maxWidth: '640px', margin: '3rem auto', textAlign: 'center' }}>
        <div className="acr-card" style={{ padding: '3rem 2rem' }}>
          <ShieldCheck size={48} color="#d97706" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.75rem' }}>
            Preliminary Novelty Screening Required
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2rem' }}>
            In accordance with ACRM institutional governance, students cannot submit an IPR disclosure directly. Inventions must first complete an AI-assisted preliminary novelty screening to identify prior art and technical differentiation.
          </p>
          <Link to="/ipr/novelty" className="acr-btn acr-btn-primary" style={{ display: 'inline-flex' }}>
            <span>Start AI Novelty Screening</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto' }}>
      <Breadcrumbs
        items={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'IPR & Innovation', path: '/ipr/dashboard' },
          { label: 'Submit IPR Disclosure' },
        ]}
      />

      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Institutional IPR Disclosure Submission
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Formal disclosure for campus patent, copyright, trademark, or invention review
        </p>
      </div>

      {/* Validated Screening Summary Card */}
      <div
        style={{
          padding: '1.25rem 1.5rem',
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
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
          <CheckCircle2 size={24} color="#16a34a" />
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#15803d' }}>
              Preliminary Novelty Screening Verified: #{screening.screeningNumber}
            </div>
            <div style={{ fontSize: '0.8125rem', color: '#166534' }}>
              Assessment: <strong>{screening.assessment.replace(/_/g, ' ')}</strong> • Confidence: {screening.confidence}
            </div>
          </div>
        </div>

        <Link
          to={`/ipr/novelty/result/${screening._id}`}
          target="_blank"
          className="acr-btn acr-btn-secondary acr-btn-sm"
        >
          View Screening Report ↗
        </Link>
      </div>

      {errorMessage && (
        <div
          style={{
            padding: '0.85rem 1rem',
            backgroundColor: 'var(--danger-bg)',
            border: '1px solid var(--danger-border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--danger-text)',
            fontSize: '0.8125rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1.5rem',
          }}
        >
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="acr-card" style={{ padding: '2.5rem' }}>
        <Input
          label="Invention / Disclosure Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="acr-label">IPR Protection Category</label>
            <select
              className="acr-select"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              <option value="PATENT">Patent (Utility / Mechanism)</option>
              <option value="COPYRIGHT">Copyright (Software / Media / Thesis)</option>
              <option value="TRADEMARK">Trademark (Brand / Project Emblem)</option>
              <option value="INVENTION">Invention / Industrial Design</option>
              <option value="OTHER">Other Intellectual Property</option>
            </select>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label className="acr-label">Institutional Confidentiality Classification</label>
            <select
              className="acr-select"
              value={form.confidentiality}
              onChange={(e) => setForm({ ...form, confidentiality: e.target.value })}
            >
              <option value="INSTITUTION_ONLY">Institution Only (Campus Staff & Faculty)</option>
              <option value="AUTHORIZED_FACULTY">Authorized Faculty Guides Only</option>
              <option value="AUTHORIZED_IPR_REVIEWERS">Authorized IPR Review Committee Only</option>
              <option value="PRIVATE">Strictly Private (Lead Inventor & Guides)</option>
              <option value="APPROVED_PUBLIC">Approved Public Disclosure</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label className="acr-label">Comprehensive Innovation Summary</label>
          <textarea
            className="acr-textarea"
            rows={4}
            value={form.summary}
            onChange={(e) => setForm({ ...form, summary: e.target.value })}
            placeholder="Detailed technical summary of the invention, operational principles, and technical novelty."
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="acr-label">Stage of Development</label>
            <select
              className="acr-select"
              value={form.stageOfDevelopment}
              onChange={(e) => setForm({ ...form, stageOfDevelopment: e.target.value })}
            >
              <option value="CONCEPT">Conceptual Design / Theoretical</option>
              <option value="LAB_PROTOTYPE">Laboratory Prototype Tested</option>
              <option value="TESTED_VALIDATED">Empirically Validated Benchmark</option>
              <option value="READY_FOR_DEPLOYMENT">Field Tested / Production Ready</option>
            </select>
          </div>

          <Input
            label="Commercial / Market Potential (Optional)"
            value={form.commercialPotential}
            onChange={(e) => setForm({ ...form, commercialPotential: e.target.value })}
            placeholder="Target industry, spin-off potential, licensing"
          />
        </div>

        {/* Co-Inventors List */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div>
              <label className="acr-label" style={{ marginBottom: 0 }}>
                Co-Inventors & Student Contributors
              </label>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Primary Inventor: <strong>{user?.fullName}</strong> ({user?.email})
              </div>
            </div>
            <Button type="button" variant="secondary" size="sm" onClick={handleAddCoInventor} icon={<Plus size={14} />}>
              Add Co-Inventor
            </Button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {form.coInventors.map((inv, idx) => (
              <div
                key={idx}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.2fr 1.5fr 1fr 80px 36px',
                  gap: '0.5rem',
                  alignItems: 'center',
                }}
              >
                <input
                  type="text"
                  className="acr-input"
                  placeholder="Full Name"
                  value={inv.name}
                  onChange={(e) => handleCoInventorChange(idx, 'name', e.target.value)}
                />
                <input
                  type="email"
                  className="acr-input"
                  placeholder="Institutional Email"
                  value={inv.email}
                  onChange={(e) => handleCoInventorChange(idx, 'email', e.target.value)}
                />
                <input
                  type="text"
                  className="acr-input"
                  placeholder="Department"
                  value={inv.department}
                  onChange={(e) => handleCoInventorChange(idx, 'department', e.target.value)}
                />
                <input
                  type="number"
                  className="acr-input"
                  placeholder="Share %"
                  value={inv.sharePercentage || ''}
                  onChange={(e) => handleCoInventorChange(idx, 'sharePercentage', Number(e.target.value))}
                  min={0}
                  max={100}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveCoInventor(idx)}
                  className="acr-btn-ghost"
                  style={{ color: 'var(--danger-text)', padding: '0.4rem' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Mandatory Submission Acknowledgment */}
        <div
          style={{
            padding: '1.25rem',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '2rem',
          }}
        >
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={form.acknowledgementAccepted}
              onChange={(e) => setForm({ ...form, acknowledgementAccepted: e.target.checked })}
              style={{ marginTop: '3px', width: '18px', height: '18px' }}
              required
            />
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
              I hereby submit this intellectual property disclosure to the institutional IPR committee. I certify that all declared technical features represent original work and that this AI-assisted screening is preliminary and does not constitute a guaranteed patent or legal certificate.
            </span>
          </label>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <Link to="/ipr/dashboard" className="acr-btn acr-btn-ghost">
            Cancel
          </Link>
          <Button type="submit" variant="primary" isLoading={isSubmitting} icon={<Award size={16} />}>
            Submit IPR Disclosure
          </Button>
        </div>
      </form>
    </div>
  );
};
