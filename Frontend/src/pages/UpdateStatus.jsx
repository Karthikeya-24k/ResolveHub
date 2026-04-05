import { useEffect, useState } from 'react';
import { getAllIssues, updateStatus } from '../services/api';
import Layout from '../components/Layout';
import Badge from '../components/Badge';

const STATUSES = ['OPEN', 'UNDER_REVIEW', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

const UpdateStatus = () => {
  const [issues, setIssues]   = useState([]);
  const [form, setForm]       = useState({ issueId: '', status: 'IN_PROGRESS' });
  const [success, setSuccess] = useState('');
  const [error, setError]     = useState('');
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getAllIssues()
      .then((res) => setIssues(res.data))
      .catch(() => setLoadError('Failed to load issues. Please refresh.'));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setLoading(true);
    try {
      await updateStatus({ issueId: Number(form.issueId), status: form.status });
      setSuccess('Status updated successfully!');
      setIssues((prev) => prev.map((i) => (i.id === Number(form.issueId) ? { ...i, status: form.status } : i)));
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectClass = 'w-full appearance-none bg-surface-container-low border-0 border-b-2 border-transparent focus:border-primary focus:ring-0 outline-none rounded-t-lg px-4 py-4 text-on-surface transition-all';

  return (
    <Layout>
      <div className="mb-8">
        <p className="text-primary font-bold text-xs tracking-widest uppercase mb-1">Staff Panel</p>
        <h2 className="text-3xl font-extrabold tracking-tight text-on-surface font-headline">Update Issue Status</h2>
        <p className="text-on-surface-variant mt-2">Move issues through the resolution workflow.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Form */}
        <div className="lg:col-span-1">
          <div className="bg-surface-container-lowest rounded-xl p-8 ambient-shadow border border-outline-variant/10">
            {loadError && <div className="flex items-center gap-2 p-4 mb-6 rounded-lg bg-amber-50 text-amber-800 text-sm"><span className="material-symbols-outlined">warning</span>{loadError}</div>}
            {error     && <div className="flex items-center gap-2 p-4 mb-6 rounded-lg bg-error-container text-on-error-container text-sm"><span className="material-symbols-outlined">error</span>{error}</div>}
            {success   && <div className="flex items-center gap-2 p-4 mb-6 rounded-lg bg-green-50 text-green-800 text-sm"><span className="material-symbols-outlined">check_circle</span>{success}</div>}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary-fixed text-primary flex items-center justify-center text-xs font-bold">1</span>
                  <h3 className="text-sm font-label uppercase tracking-widest text-primary font-bold">Select Issue</h3>
                </div>
                <div className="relative">
                  <select className={selectClass} value={form.issueId} onChange={(e) => setForm({ ...form, issueId: e.target.value })} required>
                    <option value="">Choose an issue...</option>
                    {issues.map((i) => <option key={i.id} value={i.id}>#{i.id} — {i.title} [{i.status}]</option>)}
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-outline">expand_more</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary-fixed text-primary flex items-center justify-center text-xs font-bold">2</span>
                  <h3 className="text-sm font-label uppercase tracking-widest text-primary font-bold">New Status</h3>
                </div>
                <div className="relative">
                  <select className={selectClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-outline">expand_more</span>
                </div>
              </div>

              <button
                type="submit" disabled={loading || !!loadError}
                className="w-full primary-gradient text-white py-4 px-8 rounded-lg font-bold shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span className="material-symbols-outlined">sync_alt</span>
                {loading ? 'Updating...' : 'Update Status'}
              </button>
            </form>
          </div>
        </div>

        {/* Issues Table */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl ambient-shadow overflow-hidden border border-outline-variant/10">
          <div className="px-6 py-5 border-b border-surface-container-high">
            <h3 className="font-headline font-bold text-on-surface">Issue Status Overview</h3>
          </div>
          {loadError ? (
            <p className="p-6 text-sm text-amber-600">{loadError}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface-container text-on-surface-variant">
                    <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest">ID</th>
                    <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest">Title</th>
                    <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest">Priority</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-low">
                  {issues.map((i) => (
                    <tr key={i.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="px-6 py-4 text-xs font-bold text-on-surface-variant">#{i.id}</td>
                      <td className="px-6 py-4 text-sm font-medium text-on-surface">{i.title}</td>
                      <td className="px-6 py-4"><Badge value={i.status || 'OPEN'} /></td>
                      <td className="px-6 py-4"><Badge value={i.priority || 'LOW'} /></td>
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
