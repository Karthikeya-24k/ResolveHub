import { useEffect, useState } from 'react';
import { getAllIssuesUnfiltered, updateStatus } from '../services/api';
import { getRole } from '../services/auth';
import Layout from '../components/Layout';
import Badge from '../components/Badge';
import AlertMessage from '../components/AlertMessage';

const NEXT_STATUS = {
  OPEN:         'UNDER_REVIEW',
  UNDER_REVIEW: 'ASSIGNED',
  ASSIGNED:     'IN_PROGRESS',
  IN_PROGRESS:  'RESOLVED',
  RESOLVED:     'CLOSED',
  CLOSED:       'CLOSED',
};

const ALL_STATUSES = ['OPEN', 'UNDER_REVIEW', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

const fieldCls = 'field appearance-none';

const UpdateStatus = () => {
  const [issues, setIssues]       = useState([]);
  const [selected, setSelected]   = useState(null);
  const [form, setForm]           = useState({ issueId: '', status: 'IN_PROGRESS', resolutionNote: '' });
  const [success, setSuccess]     = useState('');
  const [error, setError]         = useState('');
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading]     = useState(false);
  const role    = getRole();
  const STATUSES = role === 'ADMIN' ? ALL_STATUSES : ALL_STATUSES.filter((s) => s !== 'CLOSED');

  useEffect(() => {
    getAllIssuesUnfiltered()
      .then((res) => setIssues(res.data))
      .catch(() => setLoadError('Failed to load issues. Please refresh.'));
  }, []);

  const handleIssueChange = (e) => {
    const id = e.target.value;
    const issue = issues.find((i) => String(i.id) === id);
    setSelected(issue || null);
    // Pre-select the next valid status so admin doesn't have to change it manually
    const nextStatus = issue ? (NEXT_STATUS[issue.status] || issue.status) : 'IN_PROGRESS';
    setForm({ issueId: id, status: nextStatus, resolutionNote: '' });
    setError(''); setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setLoading(true);
    try {
      await updateStatus({ issueId: Number(form.issueId), status: form.status, resolutionNote: form.resolutionNote || null });
      setSuccess('Status updated successfully!');
      setIssues((prev) => prev.map((i) => (i.id === Number(form.issueId) ? { ...i, status: form.status } : i)));
      setSelected((prev) => prev ? { ...prev, status: form.status } : prev);
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="mb-8">
        <p className="text-primary font-bold text-xs tracking-widest uppercase mb-1">{role === 'ADMIN' ? 'Admin Panel' : 'Staff Panel'}</p>
        <h2 className="text-3xl font-extrabold tracking-tight text-on-surface font-headline">Update Issue Status</h2>
        <p className="text-on-surface-variant mt-2">Move issues through the resolution workflow.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Form */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-surface-container-lowest rounded-xl p-6 ambient-shadow border border-outline-variant/10">
            <AlertMessage type="warning" message={loadError} />
            <AlertMessage type="error"   message={error} />
            <AlertMessage type="success" message={success} />

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Step 1 */}
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary-fixed text-primary flex items-center justify-center text-[11px] font-bold shrink-0">1</span>
                  <span className="label-muted">Select Issue</span>
                </label>
                <div className="relative">
                  <select
                    className={fieldCls + ' pr-10 truncate'}
                    value={form.issueId}
                    onChange={handleIssueChange}
                    required
                  >
                    <option value="">Choose an issue…</option>
                    {issues.map((i) => (
                      <option key={i.id} value={i.id}>#{i.id} — {i.title}</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none icon-chevron text-lg">expand_more</span>
                </div>
                {selected && (
                  <div className="flex items-center gap-2 px-1 pt-1">
                    <span className="text-[11px]" style={{ color: 'var(--text-faint)' }}>Current:</span>
                    <Badge value={selected.status || 'OPEN'} />
                    <Badge value={selected.priority || 'LOW'} />
                  </div>
                )}
              </div>

              {/* Step 2 */}
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary-fixed text-primary flex items-center justify-center text-[11px] font-bold shrink-0">2</span>
                  <span className="label-muted">New Status</span>
                </label>
                <div className="relative">
                  <select
                    className={fieldCls + ' pr-10'}
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none icon-chevron text-lg">expand_more</span>
                </div>
              </div>

              {/* Resolution note — only shown when RESOLVED is selected */}
              {form.status === 'RESOLVED' && (
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-[11px] font-bold shrink-0">3</span>
                    <span className="label-muted">Resolution Note <span style={{ color: 'var(--text-faint)' }}>(optional)</span></span>
                  </label>
                  <textarea
                    className={fieldCls + ' resize-none'}
                    rows={3}
                    placeholder="Briefly describe what was done to resolve this complaint..."
                    value={form.resolutionNote || ''}
                    onChange={(e) => setForm({ ...form, resolutionNote: e.target.value })}
                  />
                  <p className="text-[10px]" style={{ color: 'var(--text-faint)' }}>
                    This note will be included in the resolution email sent to the user.
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !!loadError || !form.issueId}
                className="w-full primary-gradient text-white py-3 px-6 rounded-lg font-bold shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-sm">sync_alt</span>
                {loading ? 'Updating…' : 'Update Status'}
              </button>
            </form>
          </div>
        </div>

        {/* Issues Table */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl ambient-shadow overflow-hidden border border-outline-variant/10">
          <div className="px-6 py-4 border-b border-surface-container-high flex items-center justify-between">
            <h3 className="font-headline font-bold text-on-surface">Issue Status Overview</h3>
            <span className="text-xs font-semibold" style={{ color: 'var(--text-faint)' }}>{issues.length} issues</span>
          </div>
          {loadError ? (
            <p className="p-6 text-sm text-amber-600">{loadError}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface-container text-on-surface-variant">
                    <th className="px-5 py-3 text-[11px] font-black uppercase tracking-widest w-16">ID</th>
                    <th className="px-5 py-3 text-[11px] font-black uppercase tracking-widest">Title</th>
                    <th className="px-5 py-3 text-[11px] font-black uppercase tracking-widest">Status</th>
                    <th className="px-5 py-3 text-[11px] font-black uppercase tracking-widest">Priority</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-low">
                  {issues.map((i) => (
                    <tr
                      key={i.id}
                      onClick={() => {
                        setSelected(i);
                        const nextStatus = NEXT_STATUS[i.status] || i.status;
                        setForm({ issueId: String(i.id), status: nextStatus, resolutionNote: '' });
                        setError(''); setSuccess('');
                      }}
                      className={`cursor-pointer transition-colors ${
                        String(form.issueId) === String(i.id)
                          ? 'bg-primary-fixed'
                          : 'hover:bg-surface-container-low'
                      }`}
                    >
                      <td className="px-5 py-3.5 text-xs font-bold" style={{ color: 'var(--text-faint)' }}>#{i.id}</td>
                      <td className="px-5 py-3.5 text-sm font-medium text-on-surface max-w-[180px] truncate">{i.title}</td>
                      <td className="px-5 py-3.5"><Badge value={i.status || 'OPEN'} /></td>
                      <td className="px-5 py-3.5"><Badge value={i.priority || 'LOW'} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default UpdateStatus;
