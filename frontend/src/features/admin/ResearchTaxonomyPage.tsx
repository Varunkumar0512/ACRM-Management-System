import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api/otherApis';
import { researchApi } from '../../services/api/researchApi';
import { IResearchDomain, IResearchTopic, IResearchPaper } from '../../types';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Tabs } from '../../components/ui/Tabs';
import { useToast } from '../../hooks/useToast';
import { PlusCircle, Layers, BookOpen, FileText, Lightbulb } from 'lucide-react';

export const ResearchTaxonomyPage: React.FC = () => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'DOMAINS' | 'TOPICS' | 'PAPERS' | 'IDEAS'>('DOMAINS');
  const [domains, setDomains] = useState<IResearchDomain[]>([]);
  const [topics, setTopics] = useState<IResearchTopic[]>([]);
  const [papers, setPapers] = useState<IResearchPaper[]>([]);
  const [ideas, setIdeas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isDomainModalOpen, setIsDomainModalOpen] = useState(false);
  const [domainName, setDomainName] = useState('');
  const [domainDesc, setDomainDesc] = useState('');

  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [topicTitle, setTopicTitle] = useState('');
  const [topicDomainId, setTopicDomainId] = useState('');
  const [topicDesc, setTopicDesc] = useState('');
  const [topicKeywords, setTopicKeywords] = useState('');

  const [isPaperModalOpen, setIsPaperModalOpen] = useState(false);
  const [paperTitle, setPaperTitle] = useState('');
  const [paperAuthors, setPaperAuthors] = useState('');
  const [paperAbstract, setPaperAbstract] = useState('');
  const [paperDomainId, setPaperDomainId] = useState('');
  const [paperDepartment, setPaperDepartment] = useState('Computer Science & Engineering');
  const [paperVenue, setPaperVenue] = useState('');
  const [paperDoi, setPaperDoi] = useState('');

  const loadData = () => {
    setIsLoading(true);
    Promise.all([
      researchApi.getDomains().catch(() => []),
      researchApi.getTopics({ limit: 50 }).catch(() => ({ topics: [] })),
      researchApi.getPapers({ limit: 50 }).catch(() => ({ papers: [] })),
      researchApi.getProjectIdeas({ limit: 50 }).catch(() => ({ ideas: [] })),
    ])
      .then(([doms, tops, paps, ids]) => {
        setDomains(doms || []);
        setTopics(tops.topics || []);
        setPapers(paps.papers || []);
        setIdeas(ids.ideas || []);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminApi.createDomain({ name: domainName, description: domainDesc });
      toast.success('Research domain created successfully.');
      setIsDomainModalOpen(false);
      setDomainName('');
      setDomainDesc('');
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to create domain.');
    }
  };

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminApi.createTopic({
        title: topicTitle,
        domainId: topicDomainId,
        description: topicDesc,
        keywords: topicKeywords.split(',').map((k) => k.trim()).filter(Boolean),
      });
      toast.success('Research topic added.');
      setIsTopicModalOpen(false);
      setTopicTitle('');
      setTopicDesc('');
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to add topic.');
    }
  };

  const handleCreatePaper = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminApi.createPaper({
        title: paperTitle,
        authors: paperAuthors.split(',').map((a) => a.trim()).filter(Boolean),
        abstract: paperAbstract,
        domainId: paperDomainId,
        department: paperDepartment,
        venue: paperVenue,
        doi: paperDoi,
        publicationDate: new Date().toISOString(),
      });
      toast.success('Research paper archived in repository.');
      setIsPaperModalOpen(false);
      setPaperTitle('');
      setPaperAuthors('');
      setPaperAbstract('');
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to add paper.');
    }
  };

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Admin', path: '/admin/dashboard' },
          { label: 'Research Taxonomy & Knowledge Base' },
        ]}
      />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Research Taxonomy Management
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Dynamically curate research domains, topics, peer-reviewed publications, and approved capstone ideas
          </p>
        </div>

        <div>
          {activeTab === 'DOMAINS' && (
            <Button variant="primary" onClick={() => setIsDomainModalOpen(true)} icon={<PlusCircle size={14} />}>
              Add Research Domain
            </Button>
          )}
          {activeTab === 'TOPICS' && (
            <Button variant="primary" onClick={() => setIsTopicModalOpen(true)} icon={<PlusCircle size={14} />}>
              Add Research Topic
            </Button>
          )}
          {activeTab === 'PAPERS' && (
            <Button variant="primary" onClick={() => setIsPaperModalOpen(true)} icon={<PlusCircle size={14} />}>
              Archive Research Paper
            </Button>
          )}
        </div>
      </div>

      <Tabs
        tabs={[
          { id: 'DOMAINS', label: 'Research Domains', count: domains.length },
          { id: 'TOPICS', label: 'Taxonomy Topics', count: topics.length },
          { id: 'PAPERS', label: 'Research Papers', count: papers.length },
          { id: 'IDEAS', label: 'Curated Project Ideas', count: ideas.length },
        ]}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as any)}
      />

      {/* Tab 1: Domains */}
      {activeTab === 'DOMAINS' && (
        <div className="acr-table-container">
          <table className="acr-table">
            <thead>
              <tr>
                <th>Domain Name</th>
                <th>Slug Identifier</th>
                <th>Description</th>
                <th>Papers Count</th>
              </tr>
            </thead>
            <tbody>
              {domains.map((d) => (
                <tr key={d._id}>
                  <td style={{ fontWeight: 600 }}>{d.name}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>{d.slug}</td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{d.description}</td>
                  <td>{d.paperCount || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Topics */}
      {activeTab === 'TOPICS' && (
        <div className="acr-table-container">
          <table className="acr-table">
            <thead>
              <tr>
                <th>Topic Title</th>
                <th>Domain</th>
                <th>Trending Score</th>
                <th>Keywords</th>
              </tr>
            </thead>
            <tbody>
              {topics.map((t) => (
                <tr key={t._id}>
                  <td style={{ fontWeight: 600 }}>{t.title}</td>
                  <td>{t.domainId?.name}</td>
                  <td>{t.trendingScore} / 100</td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                      {t.keywords?.slice(0, 3).map((k, i) => (
                        <span key={i} className="acr-badge acr-badge-neutral" style={{ fontSize: '0.6875rem' }}>
                          {k}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Papers */}
      {activeTab === 'PAPERS' && (
        <div className="acr-table-container">
          <table className="acr-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Authors</th>
                <th>Venue / DOI</th>
                <th>Citations</th>
              </tr>
            </thead>
            <tbody>
              {papers.map((p) => (
                <tr key={p._id}>
                  <td style={{ fontWeight: 600, maxWidth: '300px' }}>{p.title}</td>
                  <td style={{ fontSize: '0.8125rem' }}>{p.authors?.join(', ')}</td>
                  <td style={{ fontSize: '0.8125rem' }}>{p.venue}</td>
                  <td>{p.citationsCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 4: Ideas */}
      {activeTab === 'IDEAS' && (
        <div className="acr-table-container">
          <table className="acr-table">
            <thead>
              <tr>
                <th>Problem Statement Title</th>
                <th>Domain</th>
                <th>Difficulty</th>
                <th>Technologies</th>
              </tr>
            </thead>
            <tbody>
              {ideas.map((idea) => (
                <tr key={idea._id}>
                  <td style={{ fontWeight: 600 }}>{idea.title}</td>
                  <td>{idea.domainId?.name}</td>
                  <td>
                    <span className="acr-badge acr-badge-warning">{idea.difficulty}</span>
                  </td>
                  <td style={{ fontSize: '0.8125rem' }}>{idea.technologies?.slice(0, 3).join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Domain Modal */}
      <Modal isOpen={isDomainModalOpen} onClose={() => setIsDomainModalOpen(false)} title="Create Research Domain">
        <form onSubmit={handleCreateDomain}>
          <Input label="Domain Name" value={domainName} onChange={(e) => setDomainName(e.target.value)} required />
          <div style={{ marginBottom: '1rem' }}>
            <label className="acr-label">Description</label>
            <textarea className="acr-textarea" rows={3} value={domainDesc} onChange={(e) => setDomainDesc(e.target.value)} required />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <Button variant="secondary" onClick={() => setIsDomainModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Create Domain</Button>
          </div>
        </form>
      </Modal>

      {/* Add Topic Modal */}
      <Modal isOpen={isTopicModalOpen} onClose={() => setIsTopicModalOpen(false)} title="Create Research Topic">
        <form onSubmit={handleCreateTopic}>
          <Input label="Topic Title" value={topicTitle} onChange={(e) => setTopicTitle(e.target.value)} required />
          <div style={{ marginBottom: '1rem' }}>
            <label className="acr-label">Parent Domain</label>
            <select className="acr-select" value={topicDomainId} onChange={(e) => setTopicDomainId(e.target.value)} required>
              <option value="">Select Domain...</option>
              {domains.map((d) => (
                <option key={d._id} value={d._id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label className="acr-label">Description</label>
            <textarea className="acr-textarea" rows={3} value={topicDesc} onChange={(e) => setTopicDesc(e.target.value)} required />
          </div>
          <Input label="Keywords (comma separated)" value={topicKeywords} onChange={(e) => setTopicKeywords(e.target.value)} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <Button variant="secondary" onClick={() => setIsTopicModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Add Topic</Button>
          </div>
        </form>
      </Modal>

      {/* Add Paper Modal */}
      <Modal isOpen={isPaperModalOpen} onClose={() => setIsPaperModalOpen(false)} title="Archive Research Paper">
        <form onSubmit={handleCreatePaper}>
          <Input label="Paper Title" value={paperTitle} onChange={(e) => setPaperTitle(e.target.value)} required />
          <Input label="Authors (comma separated)" value={paperAuthors} onChange={(e) => setPaperAuthors(e.target.value)} required />
          <div style={{ marginBottom: '1rem' }}>
            <label className="acr-label">Research Domain</label>
            <select className="acr-select" value={paperDomainId} onChange={(e) => setPaperDomainId(e.target.value)} required>
              <option value="">Select Domain...</option>
              {domains.map((d) => (
                <option key={d._id} value={d._id}>{d.name}</option>
              ))}
            </select>
          </div>
          <Input label="Publication Venue" value={paperVenue} onChange={(e) => setPaperVenue(e.target.value)} placeholder="IEEE / ACM / Nature..." required />
          <Input label="DOI (Optional)" value={paperDoi} onChange={(e) => setPaperDoi(e.target.value)} placeholder="10.1109/..." />
          <div style={{ marginBottom: '1rem' }}>
            <label className="acr-label">Abstract</label>
            <textarea className="acr-textarea" rows={4} value={paperAbstract} onChange={(e) => setPaperAbstract(e.target.value)} required />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <Button variant="secondary" onClick={() => setIsPaperModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Archive Paper</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
