import { useState } from 'react';
import { Link } from 'react-router-dom';
import { submitOrgApplication } from '../services/api';
import useDarkMode from '../hooks/useDarkMode';

const ORG_TYPES = ['Company', 'College', 'Society', 'Clinic', 'Other'];

const Register = () => {
  const [dark, toggleDark] = useDarkMode();
  const [form, setForm] = useState({
    organizationName: '',
    organizationType: '',
    adminName: '',
    adminEmail: '',
    phone: '',
    approxUsers: '',
    message: '',
  });
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [submitted, setSubmitted] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await submitOrgApplication({
        ...form,
        approxUsers: form.approxUsers ? Number(form.approxUsers) : null,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
        <div className="flex items-center gap-2">
          <button onClick={toggleDark} className="p-2 rounded-lg text-token-secondary hover:bg-token-raised transition-colors"
            title={dark ? 'Light mode' : 'Dark mode'}>
            <span className="material-symbols-outlined">{dark ? 'light_mode' : 'dark_mode'}</span>
          </button>
          <Link to="/login"
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            style={{ backgroundColor: 'var(--surface-raised)', color: 'var(--text-primary)', border: '1px solid var(--surface-border)' }}>
            Sign In
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-start justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          {submitted ? (
            /* Success state */
            <div className="text-center py-16 rounded-2xl" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center mx-auto mb-5">
                <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-3xl">check_circle</span>
              </div>
              <h2 className="font-headline font-black text-2xl mb-2" style={{ color: 'var(--text-primary)' }}>
                Application Submitted!
              </h2>
              <p className="text-sm max-w-md mx-auto mb-6" style={{ color: 'var(--text-muted)' }}>
                Thank you, <strong>{form.adminName}</strong>. Your application for <strong>{form.organizationName}</strong> has been received.
                Our team will review it and get back to you at <strong>{form.adminEmail}</strong>.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold mb-4"
                style={{ backgroundColor: 'var(--accent-indigo-soft)', color: '#4f46e5' }}>
                <span className="material-symbols-outlined text-sm">schedule</span>
                Typical review time: 1–2 business days
              </div>
              <p className="text-xs mb-8" style={{ color: 'var(--text-faint)' }}>
                ⚠️ Confirmation email sent. If you don’t see it, check your <strong>spam or junk folder</strong>.
              </p>
              <div>
                <Link to="/login" className="text-sm font-bold text-indigo-600 hover:underline">
                  Already have an account? Sign in →
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl primary-gradient mb-4 ambient-shadow">
                  <span className="material-symbols-outlined text-white text-2xl">domain_add</span>
                </div>
                <h1 className="font-headline font-black text-3xl tracking-tight mb-2" style={{ color: 'var(--text-primary)' }}>
                  Request Organization Access
                </h1>
                <p className="text-sm max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>
                  Fill in your organization details. Once approved, you'll receive admin credentials to set up your helpdesk.
                </p>
              </div>

              {/* Form */}
              <div className="rounded-2xl p-8" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-lg mb-6 text-sm text-red-600 bg-red-50 dark:bg-red-900/20">
                    <span className="material-symbols-outlined text-sm">error</span>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Section: Organization */}
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: 'var(--text-faint)' }}>
                      Organization Details
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="label-muted">Organization Name *</label>
                        <input className="field text-sm" placeholder="e.g. Acme Corporation"
                          value={form.organizationName} onChange={set('organizationName')} required />
                      </div>
                      <div className="space-y-1.5">
                        <label className="label-muted">Organization Type</label>
                        <div className="relative">
                          <select className="field text-sm appearance-none pr-8"
                            value={form.organizationType} onChange={set('organizationType')}>
                            <option value="">Select type...</option>
                            {ORG_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                          </select>
                          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-sm"
                            style={{ color: 'var(--text-faint)' }}>expand_more</span>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="label-muted">Approx. Users</label>
                        <input type="number" min="1" className="field text-sm" placeholder="e.g. 200"
                          value={form.approxUsers} onChange={set('approxUsers')} />
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div style={{ borderTop: '1px solid var(--surface-border)' }} />

                  {/* Section: Admin */}
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: 'var(--text-faint)' }}>
                      Admin Contact
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="label-muted">Full Name *</label>
                        <div className="relative">
                          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] pointer-events-none"
                            style={{ color: 'var(--text-faint)' }}>person</span>
                          <input className="field text-sm" style={{ paddingLeft: '2.5rem' }}
                            placeholder="Jane Smith" value={form.adminName} onChange={set('adminName')} required />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="label-muted">Email Address *</label>
                        <div className="relative">
                          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] pointer-events-none"
                            style={{ color: 'var(--text-faint)' }}>mail</span>
                          <input type="email" className="field text-sm" style={{ paddingLeft: '2.5rem' }}
                            placeholder="jane@company.com" value={form.adminEmail} onChange={set('adminEmail')} required />
                        </div>
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="label-muted">Phone Number</label>
                        <div className="relative">
                          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] pointer-events-none"
                            style={{ color: 'var(--text-faint)' }}>phone</span>
                          <input className="field text-sm" style={{ paddingLeft: '2.5rem' }}
                            placeholder="+1 555 000 0000" value={form.phone} onChange={set('phone')} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div style={{ borderTop: '1px solid var(--surface-border)' }} />

                  {/* Optional message */}
                  <div className="space-y-1.5">
                    <label className="label-muted">Additional Message <span style={{ color: 'var(--text-faint)' }}>(optional)</span></label>
                    <textarea className="field text-sm resize-none" rows={3}
                      placeholder="Tell us about your use case or any specific requirements..."
                      value={form.message} onChange={set('message')} />
                  </div>

                  <button type="submit" disabled={loading}
                    className="w-full primary-gradient text-white py-3.5 rounded-xl font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 mt-2">
                    {loading && <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>}
                    {loading ? 'Submitting...' : 'Request Access'}
                    {!loading && <span className="material-symbols-outlined text-sm">send</span>}
                  </button>
                </form>

                <p className="text-center text-xs mt-6" style={{ color: 'var(--text-faint)' }}>
                  Already have an account?{' '}
                  <Link to="/login" className="text-indigo-600 font-semibold hover:underline">Sign in</Link>
                </p>
              </div>
            </>
          )}
        </div>
      </main>

      <footer className="px-6 py-6 text-center" style={{ borderTop: '1px solid var(--surface-border)' }}>
        <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
          Powered by <span className="font-bold text-indigo-600">ResolveHub</span> · Enterprise Complaint Management
        </p>
      </footer>
    </div>
  );
};

export default Register;
