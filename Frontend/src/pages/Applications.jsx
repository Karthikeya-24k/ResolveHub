import { useEffect, useState } from 'react';
import { getApplications, approveApplication, rejectApplication } from '../services/api';
import Layout from '../components/Layout';
import Badge from '../components/Badge';

const STATUS_STYLE = {
  PENDING:  'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  APPROVED: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  REJECTED: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

/* Modal to show provisioned credentials after approval */
const CredentialsModal = ({ result, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
    <div className="rounded-2xl shadow-2xl w-full max-w-md p-8 relative" style={{ backgroundColor: 'var(--surface)' }}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
          <span className="material-symbols-outlined text-green-600 dark:text-green-400">check_circle</span>
        </div>
        <div>
          <h3 className="font-headline font-bold" style={{ color: 'var(--text-primary)' }}>Organization Approved!</h3>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Share these credentials with the admin</p>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        {[
          { label: 'Organization', value: result.organizationName },
          { label: 'Slug', value: result.organizationSlug },
          { label: 'Admin Email', value: result.adminEmail },
          { label: 'Temporary Password', value: result.temporaryPassword, mono: true, sensitive: true },
          { label: 'API Integration Key', value: result.apiKey, mono: true, sensitive: true },
        ].map(({ label, value, mono, sensitive }) => (
          <div key={label} className="rounded-lg p-3" style={{ backgroundColor: 'var(--surface-raised)' }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
            <div className="flex items-center justify-between gap-2">
              <code className={`text-sm ${mono ? 'font-mono' : 'font-semibold'} ${sensitive ? 'text-indigo-600 dark:text-indigo-400' : ''}`}
                style={{ color: sensitive ? undefined : 'var(--text-primary)' }}>
                {value}
              </code>
              <button
                onClick={() => navigator.clipboard.writeText(value)}
                className="p-1 rounded transition-colors shrink-0"
                style={{ color: 'var(--text-faint)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#4f46e5')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-faint)')}
                title="Copy"
              >
                <span className="material-symbols-outlined text-sm">content_copy</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 rounded-lg mb-5" style={{ backgroundColor: 'var(--accent-indigo-soft)' }}>
        <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
          ⚠️ Save these credentials now. The temporary password cannot be retrieved again.
        </p>
      </div>

      <button onClick={onClose}
        className="w-full py-2.5 rounded-lg primary-gradient text-white text-sm font-bold hover:opacity-90 transition-all">
        Done
      </button>
    </div>
  </div>
);

/* Reject modal */
const RejectModal = ({ app, onClose, onConfirm, busy }) => {
  const [reason, setReason] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="rounded-2xl shadow-2xl w-full max-w-md p-8 relative" style={{ backgroundColor: 'var(--surface)' }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-red-600 dark:text-red-400">cancel</span>
          </div>
          <div>
            <h3 className="font-headline font-bold" style={{ color: 'var(--text-primary)' }}>Reject Application</h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{app.organizationName}</p>
          </div>
        </div>
        <div className="space-y-1.5 mb-6">
          <label className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            Reason <span className="normal-case font-normal tracking-normal">(optional)</span>
          </label>
          <textarea
            className="field text-sm resize-none w-full"
            rows={4}
            placeholder="Explain why this application is being rejected..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            style={{ paddingTop: '0.75rem', paddingBottom: '0.75rem' }}
          />
          <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
            This reason will be included in the rejection email sent to the applicant.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} disabled={busy}
            className="flex-1 py-2.5 rounded-lg text-sm font-bold transition-all disabled:opacity-50"
            style={{ backgroundColor: 'var(--surface-raised)', color: 'var(--text-primary)', border: '1px solid var(--surface-border)' }}>
            Cancel
          </button>
          <button onClick={() => onConfirm(reason.trim())} disabled={busy}
            className="flex-1 py-2.5 rounded-lg text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-white"
            style={{ backgroundColor: '#ef4444' }}>
            {busy && <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>}
            Reject Application
          </button>
        </div>
      </div>
    </div>
  );
};

/* Detail drawer */
const DetailDrawer = ({ app, onClose, onApprove, onReject, busy }) => (
  <div className="fixed inset-0 z-50 flex justify-end">
    <div className="fixed inset-0 bg-black/30" onClick={onClose} />
    <div className="relative w-full max-w-md h-full overflow-y-auto shadow-2xl flex flex-col"
      style={{ backgroundColor: 'var(--surface)' }}>
      <div className="flex items-center justify-between px-6 py-4 sticky top-0 z-10"
        style={{ backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--surface-border)' }}>
        <h3 className="font-headline font-bold" style={{ color: 'var(--text-primary)' }}>Application Details</h3>
        <button onClick={onClose} className="p-1.5 rounded-lg transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface-raised)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}>
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      <div className="flex-1 px-6 py-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl primary-gradient flex items-center justify-center text-white font-bold text-lg shrink-0">
            {app.organizationName[0].toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>{app.organizationName}</p>
            <div className="flex items-center gap-2 mt-0.5">
              {app.organizationType && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--surface-raised)', color: 'var(--text-muted)' }}>
                  {app.organizationType}
                </span>
              )}
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLE[app.status]}`}>
                {app.status}
              </span>
            </div>
          </div>
        </div>

        {[
          { icon: 'person',  label: 'Admin Name',  value: app.adminName },
          { icon: 'mail',    label: 'Admin Email', value: app.adminEmail },
          { icon: 'phone',   label: 'Phone',       value: app.phone || '—' },
          { icon: 'group',   label: 'Approx Users', value: app.approxUsers ? `~${app.approxUsers}` : '—' },
          { icon: 'schedule', label: 'Submitted',  value: timeAgo(app.createdAt) },
        ].map(({ icon, label, value }) => (
          <div key={label} className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--surface-raised)' }}>
            <span className="material-symbols-outlined text-sm mt-0.5 shrink-0" style={{ color: 'var(--text-faint)' }}>{icon}</span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{label}</p>
              <p className="text-sm font-semibold mt-0.5" style={{ color: 'var(--text-primary)' }}>{value}</p>
            </div>
          </div>
        ))}

        {app.message && (
          <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--surface-raised)' }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>Message</p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{app.message}</p>
          </div>
        )}
      </div>

      {app.status === 'PENDING' && (
        <div className="px-6 py-4 flex gap-3" style={{ borderTop: '1px solid var(--surface-border)' }}>
          <button onClick={() => onReject(app)} disabled={busy}
            className="flex-1 py-2.5 rounded-lg text-sm font-bold transition-all disabled:opacity-50 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            style={{ border: '1px solid var(--surface-border)' }}>
            Reject
          </button>
          <button onClick={() => onApprove(app)} disabled={busy}
            className="flex-1 py-2.5 rounded-lg primary-gradient text-white text-sm font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {busy && <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>}
            Approve
          </button>
        </div>
      )}
    </div>
  </div>
);

const Applications = () => {
  const [apps, setApps]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [filter, setFilter]       = useState('ALL');
  const [search, setSearch]       = useState('');
  const [busy, setBusy]           = useState(null);
  const [selected, setSelected]   = useState(null);
  const [credentials, setCredentials] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);

  useEffect(() => {
    getApplications()
      .then((res) => setApps(res.data.data || []))
      .catch(() => setError('Failed to load applications.'))
      .finally(() => setLoading(false));
  }, []);

  const handleApprove = async (app) => {
    setBusy(app.id);
    try {
      const res = await approveApplication(app.id);
      setApps((prev) => prev.map((a) => a.id === app.id ? { ...a, status: 'APPROVED' } : a));
      setCredentials(res.data.data);
      setSelected(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Approval failed.');
    } finally {
      setBusy(null);
    }
  };

  const handleReject = (app) => {
    setSelected(null);
    setRejectTarget(app);
  };

  const confirmReject = async (reason) => {
    setBusy(rejectTarget.id);
    try {
      await rejectApplication(rejectTarget.id, reason || null);
      setApps((prev) => prev.map((a) => a.id === rejectTarget.id ? { ...a, status: 'REJECTED' } : a));
      setRejectTarget(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Rejection failed.');
    } finally {
      setBusy(null);
    }
  };

  const pending  = apps.filter((a) => a.status === 'PENDING').length;
  const approved = apps.filter((a) => a.status === 'APPROVED').length;
  const rejected = apps.filter((a) => a.status === 'REJECTED').length;

  const filtered = apps.filter((a) => {
    const matchFilter = filter === 'ALL' || a.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || a.organizationName?.toLowerCase().includes(q) ||
      a.adminEmail?.toLowerCase().includes(q) || a.adminName?.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-purple-600 font-bold text-xs tracking-widest uppercase mb-1">Super Admin</p>
          <h2 className="text-3xl font-extrabold tracking-tight font-headline" style={{ color: 'var(--text-primary)' }}>
            Organization Applications
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Review and approve incoming organization onboarding requests.
          </p>
        </div>
        {pending > 0 && (
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold"
            style={{ backgroundColor: 'var(--accent-indigo-soft)', color: '#4f46e5' }}>
            <span className="material-symbols-outlined text-sm">pending_actions</span>
            {pending} pending review
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Pending',  value: pending,  color: 'text-amber-600',  bg: 'bg-amber-50 dark:bg-amber-900/20'  },
          { label: 'Approved', value: approved, color: 'text-green-600',  bg: 'bg-green-50 dark:bg-green-900/20'  },
          { label: 'Rejected', value: rejected, color: 'text-red-600',    bg: 'bg-red-50 dark:bg-red-900/20'      },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className="rounded-xl p-4 text-center ambient-shadow"
            style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
            <p className={`text-2xl font-black font-headline ${color}`}>{value}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: 'var(--text-faint)' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Filter + Search */}
      <div className="rounded-xl ambient-shadow overflow-hidden" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
        <div className="px-5 py-4 flex flex-col sm:flex-row gap-3" style={{ borderBottom: '1px solid var(--surface-border)' }}>
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] pointer-events-none"
              style={{ color: 'var(--text-faint)' }}>search</span>
            <input type="text" placeholder="Search by org name, admin name or email..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="field text-sm" style={{ paddingLeft: '2.25rem' }} />
          </div>
          <div className="flex gap-1">
            {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className="px-3 py-2 rounded-lg text-xs font-bold transition-all"
                style={filter === f
                  ? { background: 'linear-gradient(135deg,#3525cd,#4f46e5)', color: '#fff' }
                  : { backgroundColor: 'var(--surface-raised)', color: 'var(--text-secondary)' }}>
                {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-4 text-sm text-red-600">
            <span className="material-symbols-outlined text-sm">error</span>{error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center p-12 gap-3" style={{ color: 'var(--text-muted)' }}>
            <span className="material-symbols-outlined animate-spin">progress_activity</span>
            Loading applications...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-14 gap-3" style={{ color: 'var(--text-muted)' }}>
            <span className="material-symbols-outlined text-5xl opacity-25">inbox</span>
            <p className="text-sm font-medium">
              {apps.length === 0 ? 'No applications yet.' : 'No applications match your filter.'}
            </p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--surface-border)' }}>
            {filtered.map((app) => (
              <div key={app.id} className="flex items-center gap-4 px-6 py-4 transition-colors cursor-pointer"
                onClick={() => setSelected(app)}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-raised)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                {/* Avatar */}
                <div className="w-10 h-10 rounded-xl primary-gradient flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {app.organizationName[0].toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{app.organizationName}</p>
                    {app.organizationType && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: 'var(--surface-soft)', color: 'var(--text-faint)' }}>
                        {app.organizationType}
                      </span>
                    )}
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>
                    {app.adminName} · {app.adminEmail}
                    {app.approxUsers ? ` · ~${app.approxUsers} users` : ''}
                  </p>
                </div>

                {/* Status + time + actions */}
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[10px]" style={{ color: 'var(--text-faint)' }}>{timeAgo(app.createdAt)}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLE[app.status]}`}>
                    {app.status}
                  </span>
                  {app.status === 'PENDING' && (
                    <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => handleApprove(app)} disabled={busy === app.id}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50 text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                        style={{ border: '1px solid var(--surface-border)' }}>
                        <span className="material-symbols-outlined text-sm">
                          {busy === app.id ? 'progress_activity' : 'check'}
                        </span>
                        Approve
                      </button>
                      <button onClick={() => handleReject(app)} disabled={busy === app.id}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        style={{ border: '1px solid var(--surface-border)' }}>
                        <span className="material-symbols-outlined text-sm">close</span>
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail drawer */}
      {selected && (
        <DetailDrawer
          app={selected}
          onClose={() => setSelected(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          busy={busy === selected.id}
        />
      )}

      {/* Credentials modal */}
      {credentials && (
        <CredentialsModal result={credentials} onClose={() => setCredentials(null)} />
      )}

      {/* Reject modal */}
      {rejectTarget && (
        <RejectModal
          app={rejectTarget}
          onClose={() => setRejectTarget(null)}
          onConfirm={confirmReject}
          busy={busy === rejectTarget.id}
        />
      )}
    </Layout>
  );
};

export default Applications;
