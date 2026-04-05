import { useEffect, useState } from 'react';
import { getAllIssues, getAllUsers, assignIssue } from '../services/api';
import Layout from '../components/Layout';

const AssignIssue = () => {
  const [issues, setIssues]   = useState([]);
  const [staff, setStaff]     = useState([]);
  const [form, setForm]       = useState({ issueId: '', staffId: '', priority: 'MEDIUM' });
  const [success, setSuccess] = useState('');
  const [error, setError]     = useState('');
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedIssue = issues.find((i) => String(i.id) === String(form.issueId));

  useEffect(() => {
    Promise.all([getAllIssues(), getAllUsers()])
      .then(([issuesRes, usersRes]) => {
        setIssues(issuesRes.data);
        const users = usersRes.data.data || [];
        setStaff(users.filter((u) => u.role === 'STAFF'));
      })
      .catch(() => setLoadError('Failed to load data. Please refresh the page.'));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setLoading(true);
    try {
      await assignIssue({ issueId: Number(form.issueId), staffId: Number(form.staffId), priority: form.priority });
      setSuccess('Issue assigned successfully!');
      setForm({ issueId: '', staffId: '', priority: 'MEDIUM' });
    } catch (err) {
      setError(err.response?.data?.message || 'Assignment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectClass = 'w-full appearance-none bg-surface-container-low border-0 border-b-2 border-transparent focus:border-primary focus:ring-0 outline-none rounded-t-lg px-4 py-4 text-on-surface transition-all';

  const Step = ({ n, label }) => (
    <div className="flex items-center gap-2">
      <span className="w-6 h-6 rounded-full bg-primary-fixed text-primary flex items-center justify-center text-xs font-bold">{n}</span>
      <h3 className="text-sm font-label uppercase tracking-widest text-primary font-bold">{label}</h3>
    </div>
  );

  return (
    <Layout>
      <div className="mb-8">
        <p className="text-primary font-bold text-xs tracking-widest uppercase mb-1">Admin Panel</p>
        <h2 className="text-3xl font-extrabold tracking-tight text-on-surface font-headline">Assign New Issue</h2>
        <p className="text-on-surface-variant mt-2">Delegate pending complaints to the most suitable staff members.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-surface-container-lowest rounded-xl p-8 ambient-shadow border border-outline-variant/10">
            {loadError && <div className="flex items-center gap-2 p-4 mb-6 rounded-lg bg-amber-50 text-amber-800 text-sm"><span className="material-symbols-outlined">warning</span>{loadError}</div>}
            {error     && <div className="flex items-center gap-2 p-4 mb-6 rounded-lg bg-error-container text-on-error-container text-sm"><span className="material-symbols-outlined">error</span>{error}</div>}
            {success   && <div className="flex items-center gap-2 p-4 mb-6 rounded-lg bg-green-50 text-green-800 text-sm"><span className="material-symbols-outlined">check_circle</span>{success}</div>}

            <form onSubmit={handleSubmit} className="space-y-10">
              {/* Step 1 */}
              <div className="space-y-4">
                <Step n="1" label="Select Issue" />
                <div className="relative">
                  <select className={selectClass} value={form.issueId} onChange={(e) => setForm({ ...form, issueId: e.target.value })} required>
                    <option value="">Choose from unassigned list...</option>
                    {issues.map((i) => <option key={i.id} value={i.id}>#{i.id} — {i.title}</option>)}
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-outline">expand_more</span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="space-y-4">
                <Step n="2" label="Assign Staff" />
                <div className="relative">
                  <select className={selectClass} value={form.staffId} onChange={(e) => setForm({ ...form, staffId: e.target.value })} required>
                    <option value="">Select staff member...</option>
                    {staff.length === 0
                      ? <option disabled>No staff members available</option>
                      : staff.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.email})</option>)
                    }
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-outline">expand_more</span>
                </div>
                {staff.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {staff.map((s) => (
                      <button
                        key={s.id} type="button"
                        onClick={() => setForm({ ...form, staffId: String(s.id) })}
                        className={`px-3 py-1.5 rounded-full text-xs transition-all flex items-center gap-1.5 ${String(form.staffId) === String(s.id) ? 'bg-primary text-white' : 'bg-surface-container-high text-on-surface-variant hover:bg-primary hover:text-white'}`}
                      >
                        <span className="material-symbols-outlined text-[16px]">person</span>
                        {s.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Step 3 */}
              <div className="space-y-4">
                <Step n="3" label="Set Priority" />
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { val: 'LOW',    dot: 'bg-blue-400',  label: 'Low'    },
                    { val: 'MEDIUM', dot: 'bg-amber-500', label: 'Medium' },
                    { val: 'HIGH',   dot: 'bg-red-500',   label: 'High'   },
                  ].map(({ val, dot, label }) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setForm({ ...form, priority: val })}
                      className={`flex items-center justify-center gap-2 p-4 rounded-lg border-2 font-medium text-sm transition-all ${
                        form.priority === val
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                          : 'border-gray-200 bg-white text-gray-500 hover:border-indigo-300 hover:bg-indigo-50/50'
                      }`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full ${dot}`} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="submit" disabled={loading || !!loadError}
                  className="w-full primary-gradient text-white py-4 px-8 rounded-lg font-bold tracking-tight shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined">send</span>
                  {loading ? 'Assigning...' : 'Assign to Staff Member'}
                </button>
                <p className="text-center text-xs text-on-surface-variant mt-4 font-label tracking-wide uppercase">
                  Once assigned, the staff member will be notified.
                </p>
              </div>
            </form>
          </section>
        </div>

        {/* Side Summary */}
        <aside className="space-y-6">
          <div className="bg-surface-container-low rounded-xl overflow-hidden border border-outline-variant/10">
            <div className="h-24 w-full bg-indigo-900 relative flex items-end p-4">
              <div>
                <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded">Live Insight</span>
                <h3 className="text-white font-bold mt-1 tracking-tight font-headline">Issue Overview</h3>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {selectedIssue ? (
                <>
                  <div>
                    <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest block mb-1">Current Selection</label>
                    <p className="text-lg font-bold tracking-tight text-on-surface leading-tight font-headline">#{selectedIssue.id}: {selectedIssue.title}</p>
                  </div>
                  <div className="p-4 bg-surface-container-lowest rounded-lg border border-outline-variant/15 text-sm text-on-surface-variant italic leading-relaxed">
                    "{selectedIssue.description}"
                  </div>
                  <div className="pt-4 border-t border-outline-variant/15 space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-on-surface-variant">Status</span>
                      <span className="font-bold">{selectedIssue.status || 'OPEN'}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-on-surface-variant">Priority</span>
                      <span className="font-bold">{selectedIssue.priority || 'Not set'}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center py-6 text-on-surface-variant">
                  <span className="material-symbols-outlined text-4xl mb-2 opacity-30">assignment</span>
                  <p className="text-sm">Select an issue to see details</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10">
            <h4 className="text-xs font-black uppercase tracking-widest text-on-surface-variant mb-4">Available Staff</h4>
            {staff.length === 0 ? (
              <p className="text-sm text-on-surface-variant">No staff members found. Promote users to STAFF role first.</p>
            ) : (
              <div className="space-y-3">
                {staff.map((s) => (
                  <div key={s.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-sm">person</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate">{s.name}</p>
                      <p className="text-[10px] text-on-surface-variant truncate">{s.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </Layout>
  );
};

export default AssignIssue;
