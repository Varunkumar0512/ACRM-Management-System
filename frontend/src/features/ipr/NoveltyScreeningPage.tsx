import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { iprApi } from '../../services/api/iprApi';
import { projectApi } from '../../services/api/projectApi';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Tabs } from '../../components/ui/Tabs';
import {
  Sparkles,
  ShieldCheck,
  AlertCircle,
  MessageSquare,
  FileText,
  Send,
  Plus,
  Trash2,
  HelpCircle,
  ArrowRight,
  Bot,
  User as UserIcon,
} from 'lucide-react';
import { IProject } from '../../types';

export const NoveltyScreeningPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const preselectedProjectId = searchParams.get('projectId') || '';
  const navigate = useNavigate();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'form' | 'chat'>('form');
  const [projects, setProjects] = useState<IProject[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Innovation Form State
  const [form, setForm] = useState({
    projectId: preselectedProjectId,
    innovationTitle: '',
    problem: '',
    proposedSolution: '',
    keyTechnicalFeatures: [''],
    differentiation: '',
    technologiesUsed: '',
    targetApplication: 'Campus Research & Higher Education',
    relatedResearch: '',
  });

  // Chatbot State ("ACRM IPR Research Assistant")
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'assistant' | 'user'; content: string }>>([
    {
      role: 'assistant',
      content:
        "Welcome to the ACRM IPR Research Assistant. Before you submit your preliminary screening, let's understand your innovation. What specific technical problem does your invention solve, and which underlying mechanism makes your solution technically distinct from existing systems?",
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isChatSending, setIsChatSending] = useState(false);

  useEffect(() => {
    projectApi
      .listProjects({ filterType: 'my' })
      .then((data) => {
        const list = data.projects || [];
        setProjects(list);
        if (!form.projectId && list.length > 0) {
          setForm((prev) => ({
            ...prev,
            projectId: preselectedProjectId || list[0]._id,
            innovationTitle: preselectedProjectId ? prev.innovationTitle : `Novelty Disclosure: ${list[0].title}`,
          }));
        }
      })
      .catch(() => {})
      .finally(() => setIsLoadingProjects(false));
  }, [preselectedProjectId]);

  const handleAddFeature = () => {
    setForm({ ...form, keyTechnicalFeatures: [...form.keyTechnicalFeatures, ''] });
  };

  const handleFeatureChange = (index: number, value: string) => {
    const updated = [...form.keyTechnicalFeatures];
    updated[index] = value;
    setForm({ ...form, keyTechnicalFeatures: updated });
  };

  const handleRemoveFeature = (index: number) => {
    if (form.keyTechnicalFeatures.length <= 1) return;
    const updated = form.keyTechnicalFeatures.filter((_, i) => i !== index);
    setForm({ ...form, keyTechnicalFeatures: updated });
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !form.projectId) {
      if (!form.projectId) toast.error('Please select an associated project first.');
      return;
    }

    const userText = inputMessage.trim();
    setInputMessage('');
    setChatMessages((prev) => [...prev, { role: 'user', content: userText }]);
    setIsChatSending(true);

    try {
      const res = await iprApi.sendChatMessage({
        projectId: form.projectId,
        message: userText,
        innovationContext: {
          innovationTitle: form.innovationTitle,
          problem: form.problem,
          proposedSolution: form.proposedSolution,
          differentiation: form.differentiation,
        },
      });

      setChatMessages((prev) => [...prev, { role: 'assistant', content: res.response }]);
    } catch {
      toast.error('Failed to communicate with ACRM IPR Assistant.');
    } finally {
      setIsChatSending(false);
    }
  };

  const handleSubmitScreening = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.projectId) {
      setErrorMessage('Please select an active student project.');
      return;
    }

    const cleanFeatures = form.keyTechnicalFeatures.map((f) => f.trim()).filter(Boolean);
    if (cleanFeatures.length === 0) {
      setErrorMessage('Please specify at least one key technical feature of your innovation.');
      return;
    }

    const cleanTech = form.technologiesUsed
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    if (cleanTech.length === 0) {
      setErrorMessage('Please list the key technologies used (comma-separated).');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await iprApi.runScreening({
        projectId: form.projectId,
        innovationTitle: form.innovationTitle.trim(),
        problem: form.problem.trim(),
        proposedSolution: form.proposedSolution.trim(),
        keyTechnicalFeatures: cleanFeatures,
        differentiation: form.differentiation.trim(),
        technologiesUsed: cleanTech,
        targetApplication: form.targetApplication.trim(),
        relatedResearch: form.relatedResearch.trim(),
      });

      toast.success('Preliminary Novelty Screening completed successfully.');
      navigate(`/ipr/novelty/result/${result.screening._id}`);
    } catch (err: any) {
      const msg =
        err.response?.data?.error?.message ||
        'Novelty screening is temporarily unavailable. Please verify your connection or try again later.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'IPR & Innovation', path: '/ipr/dashboard' },
          { label: 'Preliminary Novelty Screening' },
        ]}
      />

      {/* Mandatory Disclaimer Box */}
      <div
        style={{
          padding: '1.25rem 1.5rem',
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: 'var(--radius-md)',
          marginBottom: '2rem',
          display: 'flex',
          gap: '1rem',
          alignItems: 'flex-start',
        }}
      >
        <ShieldCheck size={24} color="#2563eb" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1e40af', marginBottom: '0.25rem' }}>
            AI-Assisted Preliminary Novelty Screening Disclaimer
          </div>
          <p style={{ fontSize: '0.8125rem', color: '#1e3a8a', lineHeight: 1.5 }}>
            "This screening provides an AI-assisted preliminary assessment based on the information and available research sources. It is not a legal opinion and does not determine patentability or guarantee novelty."
          </p>
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Preliminary Novelty Screening
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Submit your technical invention for systematic comparison against ACRM campus research data and prior art
        </p>
      </div>

      <Tabs
        tabs={[
          { id: 'form', label: '1. Structured Innovation Details' },
          { id: 'chat', label: '2. Consult ACRM IPR Assistant (Interactive)' },
        ]}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as any)}
      />

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

      {activeTab === 'form' && (
        <form onSubmit={handleSubmitScreening} className="acr-card" style={{ padding: '2rem' }}>
          {/* Associated Project */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="acr-label">Associated Student Research Project</label>
            <select
              className="acr-select"
              value={form.projectId}
              onChange={(e) => {
                const selId = e.target.value;
                const p = projects.find((x) => x._id === selId);
                setForm({
                  ...form,
                  projectId: selId,
                  innovationTitle: p ? `Novelty Disclosure: ${p.title}` : form.innovationTitle,
                  problem: p ? p.problemStatement : form.problem,
                  technologiesUsed: p ? p.technologies?.join(', ') : form.technologiesUsed,
                });
              }}
              required
            >
              <option value="">-- Select Project Workspace --</option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.code} — {p.title}
                </option>
              ))}
            </select>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              Preliminary novelty screening reports are indexed and attached directly to your project workspace.
            </div>
          </div>

          <Input
            label="Innovation Title"
            value={form.innovationTitle}
            onChange={(e) => setForm({ ...form, innovationTitle: e.target.value })}
            placeholder="e.g. AI-Based Campus Research Knowledge Assistant (ACR-Agent)"
            required
          />

          <div style={{ marginBottom: '1.5rem' }}>
            <label className="acr-label">Technical Problem Statement</label>
            <textarea
              className="acr-textarea"
              rows={3}
              value={form.problem}
              onChange={(e) => setForm({ ...form, problem: e.target.value })}
              placeholder="What unsolved problem or inefficiency does your invention solve?"
              required
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label className="acr-label">Proposed Technical Solution</label>
            <textarea
              className="acr-textarea"
              rows={3}
              value={form.proposedSolution}
              onChange={(e) => setForm({ ...form, proposedSolution: e.target.value })}
              placeholder="Describe your technical solution, algorithm, system architecture, or mechanism."
              required
            />
          </div>

          {/* Key Technical Features */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <label className="acr-label" style={{ marginBottom: 0 }}>
                Key Technical Features (Inventive Claims)
              </label>
              <Button type="button" variant="secondary" size="sm" onClick={handleAddFeature} icon={<Plus size={14} />}>
                Add Feature
              </Button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {form.keyTechnicalFeatures.map((feat, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', width: '20px' }}>
                    #{idx + 1}
                  </span>
                  <input
                    type="text"
                    className="acr-input"
                    value={feat}
                    onChange={(e) => handleFeatureChange(idx, e.target.value)}
                    placeholder="e.g. Localized neuro-symbolic vector indexing pipeline with zero external cloud dependencies"
                    required
                  />
                  {form.keyTechnicalFeatures.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(idx)}
                      className="acr-btn-ghost"
                      style={{ padding: '0.45rem', color: 'var(--danger-text)' }}
                      title="Remove feature"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label className="acr-label">How it Differs from Existing Solutions (Differentiation)</label>
            <textarea
              className="acr-textarea"
              rows={3}
              value={form.differentiation}
              onChange={(e) => setForm({ ...form, differentiation: e.target.value })}
              placeholder="What specifically differentiates your invention from existing systems, publications, or commercial software? Avoid merely cosmetic/UI differences."
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label="Technologies Used (Comma separated)"
              value={form.technologiesUsed}
              onChange={(e) => setForm({ ...form, technologiesUsed: e.target.value })}
              placeholder="Python, PyTorch, ESP32, React"
              required
            />
            <Input
              label="Target Application Domain"
              value={form.targetApplication}
              onChange={(e) => setForm({ ...form, targetApplication: e.target.value })}
              placeholder="Higher Education, Healthcare Diagnostics, Smart Grid"
              required
            />
          </div>

          <Input
            label="Related Research / Known Prior Art (Optional)"
            value={form.relatedResearch}
            onChange={(e) => setForm({ ...form, relatedResearch: e.target.value })}
            placeholder="Related IEEE/ACM publications, past capstone reports, or standards"
          />

          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setActiveTab('chat')}
              icon={<MessageSquare size={16} />}
            >
              Consult IPR Assistant First
            </Button>

            <Button type="submit" variant="primary" isLoading={isSubmitting} icon={<Sparkles size={16} />}>
              Run Preliminary Novelty Screening
            </Button>
          </div>
        </form>
      )}

      {activeTab === 'chat' && (
        <div className="acr-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '600px' }}>
          <div
            style={{
              paddingBottom: '1rem',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary-100)',
                  color: 'var(--primary-700)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Bot size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  ACRM IPR Research Assistant
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Challenging your technical claims before formal evaluation
                </div>
              </div>
            </div>

            <Button variant="secondary" size="sm" onClick={() => setActiveTab('form')} icon={<FileText size={14} />}>
              Switch to Screening Form
            </Button>
          </div>

          {/* Chat Messages */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1.25rem 0',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  alignItems: 'flex-start',
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                }}
              >
                {msg.role === 'assistant' && (
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      backgroundColor: 'var(--primary-50)',
                      color: 'var(--primary-600)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Bot size={16} />
                  </div>
                )}

                <div
                  style={{
                    padding: '0.85rem 1.15rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: msg.role === 'user' ? 'var(--primary-600)' : 'var(--bg-subtle)',
                    color: msg.role === 'user' ? '#ffffff' : 'var(--text-primary)',
                    fontSize: '0.875rem',
                    lineHeight: 1.5,
                    border: msg.role === 'user' ? 'none' : '1px solid var(--border-subtle)',
                  }}
                >
                  {msg.content}
                </div>

                {msg.role === 'user' && (
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      backgroundColor: 'var(--bg-muted)',
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <UserIcon size={16} />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendChat} style={{ display: 'flex', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
            <input
              type="text"
              className="acr-input"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Explain your technical mechanism, benchmark, or differentiation..."
              disabled={isChatSending}
              style={{ flex: 1 }}
            />
            <Button type="submit" variant="primary" isLoading={isChatSending} icon={<Send size={14} />}>
              Send
            </Button>
          </form>
        </div>
      )}
    </div>
  );
};
