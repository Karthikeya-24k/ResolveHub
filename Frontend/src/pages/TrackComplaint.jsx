import { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { trackComplaint, publicReply, reopenComplaint } from '../services/api';
import useDarkMode from '../hooks/useDarkMode';

const STATUS_LABEL = {
  OPEN:         { label: 'Open',         color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',       icon: 'inbox' },
  UNDER_REVIEW: { label: 'Under Review', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300', icon: 'manage_search' },
  ASSIGNED:     { label: 'Assigned',     color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300', icon: 'assignment_ind' },
  IN_PROGRESS:  { label: 'In Progress',  color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',    icon: 'sync_alt' },
  RESOLVED:     { label: 'Resolved',     color: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',    icon: 'check_circle' },
  CLOSED:       { label: 'Closed',       color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',       icon: 'lock' },
};

const STEPS = ['OPEN', 'UNDER_REVIEW', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

const ROLE_LABEL = { STAFF: 'Support Staff', ADMIN: 'Admin', USER: 'You' };

const TrackComplaint = () => {
  const { ticketNumber }          = useParams();
  const [searchParams]            = useSearchParams();
  const token                     = searchParams.get('token');
  const [dark, toggleDark]        = useDarkMode();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [reply, setReply]         = useState('');
  const [sending, setSending]     = useState(false);
  const [replyError, setReplyError] = useState('');
  const [replySuccess, setReplySuccess] = useState('');
  const [reopening, setReopening] = useState(false);
  const [reopenMsg, setReopenMsg] = useState('');
  const [reopenReason, setReopenReason] = useState('');

  const fetchComplaint = () => {
    trackComplaint(ticketNumber, token)
      .then((res) => setComplaint(res.data.data))
      .catch((err) => setError(
        err.response?.status === 400
          ? 'Invalid or expired tracking link.'
          : 'Could not load complaint. Please try again.'
      ))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!token) {
      setError('Invalid tracking link. The token is missing.');
      setLoading(false);
      return;
    }
    fetchComplaint();
  }, [ticketNumber, token]);

  // Hours remaining in the 48h reopen window
  const hoursRemaining = (resolvedAt) => {
    if (!resolvedAt) return 0;
    const deadline = new Date(resolvedAt).getTime() + 48 * 60 * 60 * 1000;
    const diff = deadline - Date.now();
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60)));
  };

  const handleReopen = async () => {
    setReopening(true);
    setReopenMsg('');
    try {
      await reopenComplaint(ticketNumber, token, reopenReason.trim());
      setReopenMsg('Your complaint has been reopened. Our team will follow up shortly.');
      setReopenReason('');
      trackComplaint(ticketNumber, token)
        .then((res) => setComplaint(res.data.data))
        .catch(() => {});
    } catch (err) {
      setReopenMsg(err.response?.data?.message || 'Failed to reopen. Please try again.');
    } finally {
      setReopening(false);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!reply.trim()) return;
    setReplyError('');
    setReplySuccess('');
    setSending(true);
    try {
      await publicReply(ticketNumber, token, reply.trim());
      setReply('');
      setReplySuccess('Your reply has been sent.');
      // Refresh comments
      trackComplaint(ticketNumber, token)
        .then((res) => setComplaint(res.data.data))
        .catch(() => {});
    } catch (err) {
      setReplyError(err.response?.data?.message || 'Failed to send reply.');
    } finally {
      setSending(false);
    }
  };

  const currentStep = complaint ? STEPS.indexOf(complaint.status) : -1;
  const statusInfo  = complaint ? (STATUS_LABEL[complaint.status] || STATUS_LABEL.OPEN) : null;
  const comments    = complaint?.comments || [];
  const isClosed    = complaint?.status === 'CLOSED';

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg)', color: 'var(--text-primary)' }}>

      {/* Navbar */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4"
        style={{ backgroundColor: 'var(--navbar-bg)', borderBottom: '1px solid var(--surface-border)', backdropFilter: 'blur(20px)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg primary-gradient flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-white text-lg">shield_person</span>
          </div>
          <span className="font-headline font-black text-lg tracking-tight text-indigo-600">ResolveHub</span>
        </div>
        <button onClick={toggleDark}
          className="p-2 rounded-lg text-token-secondary hover:bg-token-raised transition-colors"
          title={dark ? 'Light mode' : 'Dark mode'}>
          <span className="material-symbols-outlined">{dark ? 'light_mode' : 'dark_mode'}</span>
        </button>
      </header>

      <main className="flex-1 flex items-start justify-center px-4 py-12">
        <div className="w-full max-w-lg">

          {loading ? (
            <div className="flex flex-col items-center py-20 gap-3" style={{ color: 'var(--text-muted)' }}>
              <span className="material-symbols-outlined text-4xl animate-spin">progress_activity</span>
              <p className="text-sm">Loading your complaint...</p>
            </div>

          ) : error ? (
            <div className="text-center py-16 rounded-2xl"
              style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
              <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-2xl">link_off</span>
              </div>
              <h2 className="font-headline font-bold text-xl mb-2" style={{ color: 'var(--text-primary)' }}>
                Tracking Link Invalid
              </h2>
              <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>{error}</p>
              <Link to="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold primary-gradient text-white hover:opacity-90 transition-all">
                <span className="material-symbols-outlined text-sm">home</span>
                Go to Homepage
              </Link>
            </div>

          ) : complaint && (
            <div className="space-y-5">

              {/* Ticket header */}
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-3"
                  style={{ backgroundColor: 'var(--accent-indigo-soft)', color: '#4f46e5' }}>
                  <span className="material-symbols-outlined text-sm">confirmation_number</span>
                  {complaint.ticketNumber}
                </div>
                <h1 className="font-headline font-black text-2xl tracking-tight mb-1"
                  style={{ color: 'var(--text-primary)' }}>
                  {complaint.title}
                </h1>
                {complaint.anonymous === 'true' && (
                  <p className="text-xs" style={{ color: 'var(--text-faint)' }}>Submitted anonymously</p>
                )}
              </div>

              {/* Status */}
              <div className="rounded-2xl p-5 ambient-shadow"
                style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
                <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
                  Current Status
                </p>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold ${statusInfo.color}`}>
                    <span className="material-symbols-outlined text-sm">{statusInfo.icon}</span>
                    {statusInfo.label}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-faint)' }}>Priority: {complaint.priority}</span>
                </div>
              </div>

              {/* Already reopened once — show notice instead of reopen button */}
              {complaint.status === 'RESOLVED' && complaint.reopenedAt && (
                <div className="rounded-2xl p-4 flex items-start gap-3"
                  style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
                  <span className="material-symbols-outlined text-slate-400 shrink-0 mt-0.5">info</span>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    This complaint was already reopened once. If you still need help, please contact support directly.
                  </p>
                </div>
              )}

              {/* Reopen window — only shown when RESOLVED, within 48h, and not already reopened */}
              {complaint.status === 'RESOLVED' && !complaint.reopenedAt && hoursRemaining(complaint.resolvedAt) > 0 && (
                <div className="rounded-2xl p-5"
                  style={{ backgroundColor: 'var(--surface)', border: '1px solid #fed7aa' }}>
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-orange-600 dark:text-orange-400">warning</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                        Not satisfied with the resolution?
                      </p>
                      <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
                        You have <strong>{hoursRemaining(complaint.resolvedAt)} hours</strong> remaining to reopen this complaint.
                        After that it will be automatically closed.
                      </p>
                      {reopenMsg ? (
                        <p className={`text-xs font-semibold ${
                          reopenMsg.includes('reopened') ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {reopenMsg}
                        </p>
                      ) : (
                        <div className="space-y-3">
                          <textarea
                            className="field text-sm resize-none w-full"
                            rows={3}
                            placeholder="Tell us why you're not satisfied with the resolution... (optional)"
                            value={reopenReason}
                            onChange={(e) => setReopenReason(e.target.value)}
                            style={{ paddingTop: '0.75rem', paddingBottom: '0.75rem' }}
                          />
                          <button
                            onClick={handleReopen}
                            disabled={reopening}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all disabled:opacity-50 text-white"
                            style={{ backgroundColor: '#ef4444' }}
                          >
                            {reopening
                              ? <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                              : <span className="material-symbols-outlined text-sm">undo</span>
                            }
                            {reopening ? 'Reopening...' : 'Mark as Unsatisfied / Reopen'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Progress timeline */}
              <div className="rounded-2xl p-5 ambient-shadow"
                style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
                <p className="text-[11px] font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>
                  Progress
                </p>
                <div className="space-y-0">
                  {STEPS.map((step, i) => {
                    const done   = i < currentStep;
                    const active = i === currentStep;
                    const info   = STATUS_LABEL[step];
                    const isLast = i === STEPS.length - 1;
                    return (
                      <div key={step} className="flex items-start gap-4">
                        <div className="flex flex-col items-center shrink-0">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                            active ? 'primary-gradient text-white shadow-md' :
                            done   ? 'bg-green-500 text-white' : ''
                          }`}
                            style={!active && !done ? { backgroundColor: 'var(--surface-raised)', border: '2px solid var(--surface-border)', color: 'var(--text-faint)' } : {}}>
                            <span className="material-symbols-outlined text-sm">{done ? 'check' : info.icon}</span>
                          </div>
                          {!isLast && (
                            <div className="w-0.5 h-6 mt-1"
                              style={{ backgroundColor: done ? '#22c55e' : 'var(--surface-border)' }} />
                          )}
                        </div>
                        <div className="pb-4">
                          <p className="text-sm font-bold"
                            style={{ color: active ? '#4f46e5' : done ? 'var(--text-primary)' : 'var(--text-faint)' }}>
                            {info.label}
                            {active && (
                              <span className="ml-2 text-[10px] font-black uppercase tracking-widest" style={{ color: '#4f46e5' }}>
                                ← Current
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Comments + replies */}
              <div className="rounded-2xl p-5 ambient-shadow"
                style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                    Conversation
                  </p>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: 'var(--surface-raised)', color: 'var(--text-muted)' }}>
                    {comments.length} {comments.length === 1 ? 'message' : 'messages'}
                  </span>
                </div>

                {comments.length === 0 ? (
                  <div className="flex flex-col items-center py-6 gap-2" style={{ color: 'var(--text-faint)' }}>
                    <span className="material-symbols-outlined text-3xl opacity-30">chat_bubble</span>
                    <p className="text-xs">No messages yet. Our team will respond here.</p>
                  </div>
                ) : (
                  <div className="space-y-3 mb-4">
                    {comments.map((c, i) => {
                      const isStaffOrAdmin = c.role === 'STAFF' || c.role === 'ADMIN';
                      return (
                        <div key={i} className={`flex gap-3 ${isStaffOrAdmin ? '' : 'flex-row-reverse'}`}>
                          {/* Avatar */}
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 ${
                            isStaffOrAdmin ? 'bg-indigo-500' : 'bg-green-500'
                          }`}>
                            {c.author[0].toUpperCase()}
                          </div>
                          {/* Bubble */}
                          <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                            isStaffOrAdmin
                              ? 'rounded-tl-sm'
                              : 'rounded-tr-sm'
                          }`}
                            style={{
                              backgroundColor: isStaffOrAdmin ? 'var(--accent-indigo-soft)' : 'var(--surface-raised)',
                            }}>
                            <p className="text-[10px] font-bold uppercase tracking-widest mb-1"
                              style={{ color: isStaffOrAdmin ? '#4f46e5' : 'var(--text-muted)' }}>
                              {ROLE_LABEL[c.role] || c.author}
                            </p>
                            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                              {c.message}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Reply box */}
                {!isClosed ? (
                  <form onSubmit={handleReply} className="mt-4 space-y-2">
                    {replyError && (
                      <p className="text-xs text-red-600 font-semibold">{replyError}</p>
                    )}
                    {replySuccess && (
                      <p className="text-xs text-green-600 font-semibold flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                        {replySuccess}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <textarea
                        className="field text-sm resize-none flex-1"
                        rows={2}
                        placeholder="Add a reply or provide more details..."
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        style={{ paddingTop: '0.75rem', paddingBottom: '0.75rem' }}
                      />
                      <button
                        type="submit"
                        disabled={sending || !reply.trim()}
                        className="px-4 rounded-xl primary-gradient text-white font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-1 shrink-0 self-end py-3"
                      >
                        {sending
                          ? <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                          : <span className="material-symbols-outlined text-sm">send</span>
                        }
                      </button>
                    </div>
                    <p className="text-[10px]" style={{ color: 'var(--text-faint)' }}>
                      Your reply will be visible to the support team handling your complaint.
                    </p>
                  </form>
                ) : (
                  <p className="text-xs text-center mt-3" style={{ color: 'var(--text-faint)' }}>
                    This complaint is closed. No further replies can be added.
                  </p>
                )}
              </div>

              <p className="text-xs text-center" style={{ color: 'var(--text-faint)' }}>
                You will receive an email when the status changes or staff replies.
              </p>
            </div>
          )}
        </div>
      </main>

      <footer className="px-6 py-6 text-center" style={{ borderTop: '1px solid var(--surface-border)' }}>
        <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
          Powered by <span className="font-bold text-indigo-600">ResolveHub</span> · Secure complaint tracking
        </p>
      </footer>
    </div>
  );
};

export default TrackComplaint;
