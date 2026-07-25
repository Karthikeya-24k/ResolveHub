import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPublicOrgInfo, submitPublicComplaint } from '../services/api';
import useDarkMode from '../hooks/useDarkMode';
import FileUpload from '../components/FileUpload';

const PublicPortal = () => {
  const { slug } = useParams();
  const [dark, toggleDark] = useDarkMode();
  const [org, setOrg]           = useState(null);
  const [loadError, setLoadError] = useState('');
  const [form, setForm]         = useState({ title: '', description: '', submitterName: '', submitterEmail: '', anonymous: false });
  const [files, setFiles]       = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null); // ticket number on success
  const [emailSent, setEmailSent]   = useState(false);
  const [error, setError]       = useState('');

  useEffect(() => {
    getPublicOrgInfo(slug)
      .then((res) => setOrg(res.data.data))
      .catch(() => setLoadError('This organization portal does not exist or is inactive.'));
  }, [slug]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await submitPublicComplaint(slug, form, files);
      setSubmitted(res.data.data.ticketNumber);
      setEmailSent(res.data.data.emailSent === 'true');
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg)', color: 'var(--text-primary)' }}>
      {/* Navbar */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-6 py-4"
        style={{ backgroundColor: 'var(--navbar-bg)', borderBottom: '1px solid var(--surface-border)', backdropFilter: 'blur(20px)' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg primary-gradient flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-white text-lg">shield_person</span>
          </div>
          <div>
            <span className="font-headline font-black text-base tracking-tight text-indigo-600">ResolveHub</span>
            {org && <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>· {org.name}</span>}
          </div>
        </div>
        <button
          onClick={toggleDark}
          className="p-2 rounded-lg text-token-secondary hover:bg-token-raised transition-colors"
          title={dark ? 'Light mode' : 'Dark mode'}
        >
          <span className="material-symbols-outlined">{dark ? 'light_mode' : 'dark_mode'}</span>
        </button>
      </header>

      <main className="flex-1 flex items-start justify-center px-4 py-12">
        <div className="w-full max-w-xl">
          {loadError ? (
            <div className="text-center py-20">
              <span className="material-symbols-outlined text-5xl mb-4 opacity-30" style={{ color: 'var(--text-faint)' }}>domain_disabled</span>
              <p className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Portal Not Found</p>
              <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>{loadError}</p>
            </div>
          ) : submitted ? (
            <div className="text-center py-16 rounded-2xl" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center mx-auto mb-5">
                <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-3xl">check_circle</span>
              </div>
              <h2 className="font-headline font-black text-2xl mb-2" style={{ color: 'var(--text-primary)' }}>Complaint Submitted!</h2>
              <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Your ticket has been created successfully.</p>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold text-indigo-600" style={{ backgroundColor: 'var(--accent-indigo-soft)' }}>
                <span className="material-symbols-outlined text-sm">confirmation_number</span>
                {submitted}
              </div>
              {emailSent ? (
                <div className="space-y-2 mt-4">
                  <div className="flex items-center justify-center gap-2 text-sm font-semibold text-green-700 dark:text-green-400">
                    <span className="material-symbols-outlined text-sm">mark_email_read</span>
                    A secure tracking link has been sent to your email.
                  </div>
                  <p className="text-xs text-center" style={{ color: 'var(--text-faint)' }}>
                    ⚠️ If you don't see it, please check your <strong>spam or junk folder</strong>.
                  </p>
                </div>
              ) : (
                <p className="text-xs mt-4" style={{ color: 'var(--text-faint)' }}>Save this ticket number to track your complaint.</p>
              )}
              <button
                onClick={() => { setSubmitted(null); setForm({ title: '', description: '', submitterName: '', submitterEmail: '', anonymous: false }); setFiles([]); }}
                className="mt-6 px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                style={{ backgroundColor: 'var(--surface-raised)', color: 'var(--text-primary)', border: '1px solid var(--surface-border)' }}
              >
                Submit Another
              </button>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4" style={{ backgroundColor: 'var(--accent-indigo-soft)', color: '#4f46e5' }}>
                  <span className="material-symbols-outlined text-sm">domain</span>
                  {org ? org.name : 'Loading...'}
                </div>
                <h1 className="font-headline font-black text-3xl tracking-tight mb-2" style={{ color: 'var(--text-primary)' }}>
                  Submit a Complaint
                </h1>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Your complaint will be reviewed by the {org?.name || 'organization'} team.
                </p>
              </div>

              {/* Form */}
              <div className="rounded-2xl p-8" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-lg mb-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20">
                    <span className="material-symbols-outlined text-sm">error</span>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="label-muted">Complaint Title *</label>
                    <input
                      className="field text-sm"
                      placeholder="Brief summary of your complaint"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="label-muted">Description *</label>
                    <textarea
                      className="field text-sm resize-none"
                      rows={4}
                      placeholder="Describe your complaint in detail..."
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      required
                    />
                  </div>

                  {!form.anonymous && (
                    <div className="space-y-1.5">
                      <label className="label-muted">Your Name</label>
                      <input
                        className="field text-sm"
                        placeholder="Full name"
                        value={form.submitterName}
                        onChange={(e) => setForm({ ...form, submitterName: e.target.value })}
                      />
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="label-muted">
                      Email {form.anonymous ? <span className="text-on-surface-variant font-normal normal-case tracking-normal">(optional — for tracking only)</span> : ''}
                    </label>
                    <input
                      type="email"
                      className="field text-sm"
                      placeholder={form.anonymous ? 'your@email.com — we won\'t reveal this to anyone' : 'your@email.com'}
                      value={form.submitterEmail}
                      onChange={(e) => setForm({ ...form, submitterEmail: e.target.value })}
                    />
                    <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
                      {form.anonymous
                        ? 'Your email stays private. We only use it to send you a tracking link — your identity remains hidden.'
                        : 'Your email is used to track this complaint and receive status updates.'}
                    </p>
                  </div>

                  {/* Anonymous toggle */}
                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg transition-colors" style={{ backgroundColor: 'var(--surface-raised)' }}>
                    <div
                      className={`w-10 h-6 rounded-full transition-colors relative shrink-0 ${form.anonymous ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}
                      onClick={() => setForm({ ...form, anonymous: !form.anonymous, submitterName: form.anonymous ? form.submitterName : '' })}
                    >
                      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.anonymous ? 'translate-x-5' : 'translate-x-1'}`} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Submit Anonymously</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Your identity will be hidden from the admin. Stored securely for audit only.</p>
                    </div>
                  </label>

                  <div className="space-y-1.5">
                    <label className="label-muted">Attachments <span className="font-normal normal-case tracking-normal" style={{ color: 'var(--text-muted)' }}>(optional)</span></label>
                    <FileUpload files={files} onChange={setFiles} />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || !org}
                    className="w-full primary-gradient text-white py-3.5 rounded-xl font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
                  >
                    {submitting && <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>}
                    {submitting ? 'Submitting...' : 'Submit Complaint'}
                    {!submitting && <span className="material-symbols-outlined text-sm">send</span>}
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </main>

      <footer className="px-6 py-6 text-center" style={{ borderTop: '1px solid var(--surface-border)' }}>
        <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
          Powered by <span className="font-bold text-indigo-600">ResolveHub</span> · Secure complaint management
        </p>
      </footer>
    </div>
  );
};

export default PublicPortal;
