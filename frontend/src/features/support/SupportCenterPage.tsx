import React, { useState, useEffect } from 'react';
import { supportApi } from '../../services/api/otherApis';
import { ISupportTicket } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { EmptyState } from '../../components/ui/EmptyState';
import { useToast } from '../../hooks/useToast';
import { LifeBuoy, PlusCircle, MessageSquare, ArrowRight, Send } from 'lucide-react';

export const SupportCenterPage: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [tickets, setTickets] = useState<ISupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<ISupportTicket | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // New Ticket Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [category, setCategory] = useState('PROJECTS');
  const [priority, setPriority] = useState('MEDIUM');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadTickets = () => {
    setIsLoading(true);
    supportApi
      .listTickets()
      .then((data) => setTickets(data.tickets || []))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await supportApi.createTicket({
        category,
        priority,
        subject,
        description,
      });
      toast.success('Support query submitted to campus administrators.');
      setIsModalOpen(false);
      setSubject('');
      setDescription('');
      loadTickets();
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to submit ticket.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenTicket = async (ticketId: string) => {
    try {
      const ticket = await supportApi.getTicket(ticketId);
      setSelectedTicket(ticket);
    } catch {
      toast.error('Failed to load ticket conversation.');
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || !selectedTicket) return;
    try {
      const updated = await supportApi.replyTicket(selectedTicket._id, replyMessage);
      setSelectedTicket(updated);
      setReplyMessage('');
      toast.success('Reply submitted.');
      loadTickets();
    } catch {
      toast.error('Failed to post reply.');
    }
  };

  const handleStatusUpdate = async (ticketId: string, status: string) => {
    try {
      await supportApi.updateStatus(ticketId, status);
      toast.success(`Ticket marked as ${status}.`);
      if (selectedTicket && selectedTicket._id === ticketId) {
        setSelectedTicket({ ...selectedTicket, status: status as any });
      }
      loadTickets();
    } catch {
      toast.error('Failed to update status.');
    }
  };

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Campus Support & Helpdesk' },
        ]}
      />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Academic Support & Campus Helpdesk
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Submit queries regarding project approval, faculty guidance requests, compute quotas, or institutional documentation
          </p>
        </div>

        <Button variant="primary" onClick={() => setIsModalOpen(true)} icon={<PlusCircle size={16} />}>
          Submit Support Ticket
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedTicket ? '1fr 1fr' : '1fr', gap: '1.5rem' }}>
        {/* Ticket List Table */}
        <div className="acr-card">
          <div className="acr-card-header">
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Active Queries & Tickets</h3>
          </div>

          <div className="acr-card-body" style={{ padding: 0 }}>
            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                Loading support tickets...
              </div>
            ) : tickets.length === 0 ? (
              <div style={{ padding: '2rem' }}>
                <EmptyState
                  title="No support tickets opened"
                  description="Have a question about faculty assignment, high performance compute quotas, or project reviews?"
                  actionLabel="Open a Ticket"
                  onAction={() => setIsModalOpen(true)}
                />
              </div>
            ) : (
              tickets.map((t) => (
                <div
                  key={t._id}
                  onClick={() => handleOpenTicket(t._id)}
                  style={{
                    padding: '1.25rem',
                    borderBottom: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    background: selectedTicket?._id === t._id ? 'var(--primary-50)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                        {t.ticketNumber}
                      </span>
                      <Badge variant={t.status === 'RESOLVED' || t.status === 'CLOSED' ? 'success' : 'warning'}>
                        {t.status.replace(/_/g, ' ')}
                      </Badge>
                      <span className="acr-badge acr-badge-neutral" style={{ fontSize: '0.6875rem' }}>
                        {t.category}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {t.subject}
                    </div>

                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      By {t.userId?.fullName} • Updated {new Date(t.updatedAt).toLocaleDateString()}
                    </div>
                  </div>

                  <ArrowRight size={16} color="var(--text-muted)" />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Selected Ticket Conversation Panel */}
        {selectedTicket && (
          <div className="acr-card" style={{ display: 'flex', flexDirection: 'column', height: '600px' }}>
            <div className="acr-card-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.8125rem' }}>
                    {selectedTicket.ticketNumber}
                  </span>
                  <Badge variant={selectedTicket.status === 'RESOLVED' ? 'success' : 'warning'}>
                    {selectedTicket.status}
                  </Badge>
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: '0.25rem' }}>
                  {selectedTicket.subject}
                </h3>
              </div>

              {user?.role === 'ADMIN' && (
                <select
                  className="acr-select"
                  style={{ width: '140px', fontSize: '0.75rem' }}
                  value={selectedTicket.status}
                  onChange={(e) => handleStatusUpdate(selectedTicket._id, e.target.value)}
                >
                  <option value="OPEN">OPEN</option>
                  <option value="IN_PROGRESS">IN PROGRESS</option>
                  <option value="WAITING_FOR_USER">WAITING FOR USER</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              )}
            </div>

            {/* Conversation Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {selectedTicket.messages?.map((msg, mIdx) => (
                <div
                  key={mIdx}
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    background: msg.senderId?.role === 'ADMIN' ? 'var(--primary-50)' : 'var(--bg-subtle)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <strong style={{ fontSize: '0.8125rem' }}>{msg.senderId?.fullName}</strong>
                      <span className="acr-badge acr-badge-neutral" style={{ fontSize: '0.625rem' }}>
                        {msg.senderId?.role}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                      {new Date(msg.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                    {msg.message}
                  </p>
                </div>
              ))}
            </div>

            {/* Reply Input */}
            <form onSubmit={handleSendReply} style={{ padding: '1rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                className="acr-input"
                placeholder="Write response message..."
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
              />
              <Button type="submit" variant="primary" size="sm" icon={<Send size={14} />}>
                Reply
              </Button>
            </form>
          </div>
        )}
      </div>

      {/* New Ticket Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Submit Academic Support Ticket">
        <form onSubmit={handleCreateTicket}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label className="acr-label">Category</label>
              <select className="acr-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="PROJECTS">Projects & Submissions</option>
                <option value="FACULTY">Faculty Mentorship</option>
                <option value="AUTHENTICATION">Authentication / Access</option>
                <option value="TECHNICAL_ISSUE">Technical Platform Issue</option>
                <option value="DOCUMENTS">Documents & File Quotas</option>
                <option value="OTHER">Other Query</option>
              </select>
            </div>

            <div>
              <label className="acr-label">Priority</label>
              <select className="acr-select" value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          <Input
            label="Subject"
            placeholder="Brief summary of query..."
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />

          <div style={{ marginBottom: '1.5rem' }}>
            <label className="acr-label">Detailed Description</label>
            <textarea
              className="acr-textarea"
              rows={4}
              placeholder="Provide comprehensive details, error messages, or request context..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>Submit Ticket</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
