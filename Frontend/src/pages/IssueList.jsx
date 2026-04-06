import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllIssues, filterIssues } from '../services/api';
import { getRole } from '../services/auth';
import Layout from '../components/Layout';
import Badge from '../components/Badge';
import AlertMessage from '../components/AlertMessage';

const STATUSES   = ['', 'OPEN', 'UNDER_REVIEW', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
const PRIORITIES = ['', 'LOW', 'MEDIUM', 'HIGH'];

const IssueList = () => {
  const [issues, setIssues]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters]       = useState({ status: '', priority: '' });
  const [applied, setApplied]       = useState({ status: '', priority: '' });
  const navigate = useNavigate();
  const role = getRole();

  const fetchIssues = (activeFilters) => {
    setLoading(true);
    setError('');
    const { status, priority } = activeFilters;
    const hasFilter = status || priority;
    const call = hasFilter
      ? filterIssues({ ...(status && { status }), ...(priority && { priority }) })
      : getAllIssues();
    call
      .then((res) => setIssues(res.data))
      .catch(() => setError('Failed to load issues.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchIssues(applied); }, []);

  const handleApply = () => {
    setApplied(filters);
    setShowFilter(false);
    fetchIssues(filters);
  };

  const handleClear = () => {
    const reset = { status: '', priority: '' };
    setFilters(reset);
    setApplied(reset);
    setShowFilter(false);
    fetchIssues(reset);
  };

  const isFiltered = applied.status || applied.priority;

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <p className="text-primary font-bold text-xs tracking-widest uppercase mb-1">Issue Tracker</p>
          <h2 className="text-3xl font-extrabold text-on-surface tracking-tight font-headline">All Issues</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilter((v) => !v)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${
              isFiltered
                ? 'bg-indigo-600 text-white'
                : 'bg-surface-container-high hover:bg-surface-container-highest'
            }`}
          >
            <span className="material-symbols-outlined text-sm">filter_list</span>
            Filter{isFiltered ? ` (${[applied.status, applied.priority].filter(Boolean).length})` : ''}
          </button>
          {(role === 'USER' || role === 'ADMIN') && (
            <button
              onClick={() => navigate('/issues/create')}
              className="primary-gradient text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              New Issue
            </button>
          )}
        </div>
      </div>

      {/* Filter Panel */}
      {showFilter && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Status</label>
              <select
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-900 transition-all appearance-none"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s ? s.replace(/_/g, ' ') : 'All Statuses'}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Priority</label>
              <select
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-900 transition-all appearance-none"
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>{p || 'All Priorities'}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleApply}
              className="primary-gradient text-white px-5 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-all"
            >
              Apply Filters
            </button>
            <button
              onClick={handleClear}
              className="px-5 py-2 rounded-lg text-sm font-semibold bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      <AlertMessage type="error" message={error} />

      <div className="bg-surface-container-lowest rounded-xl ambient-shadow overflow-hidden border border-outline-variant/10">
        <div className="px-6 py-5 flex justify-between items-center border-b border-surface-container-high">
          <h3 className="font-headline font-bold text-on-surface">Issue List</h3>
          <div className="flex items-center gap-3">
            {isFiltered && (
              <span className="text-xs text-indigo-600 font-semibold">Filtered results</span>
            )}
            <span className="text-xs font-bold bg-surface-container px-2 py-1 rounded-full text-on-surface-variant">
              {issues.length} total
            </span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12 gap-3 text-on-surface-variant">
            <span className="material-symbols-outlined animate-spin">progress_activity</span>
            Loading issues...
          </div>
        ) : issues.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-on-surface-variant">
            <span className="material-symbols-outlined text-5xl mb-3 opacity-30">inbox</span>
            <p className="text-sm font-medium">{isFiltered ? 'No issues match the selected filters.' : 'No issues found.'}</p>
            {isFiltered && (
              <button onClick={handleClear} className="mt-3 text-xs text-primary font-semibold hover:underline">Clear filters</button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container text-on-surface-variant">
                  {['ID', 'Title', 'Status', 'Priority', 'Actions'].map((h) => (
                    <th key={h} className="px-6 py-4 text-[11px] font-black uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-low">
                {issues.map((issue) => (
                  <tr key={issue.id} className="hover:bg-surface-container-low transition-colors group">
                    <td className="px-6 py-4 text-xs font-bold text-on-surface-variant">#{issue.id}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-on-surface">{issue.title}</p>
                      <p className="text-xs text-on-surface-variant mt-0.5 line-clamp-1">{issue.description}</p>
                    </td>
                    <td className="px-6 py-4"><Badge value={issue.status || 'OPEN'} /></td>
                    <td className="px-6 py-4"><Badge value={issue.priority || 'LOW'} /></td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/issues/${issue.id}`}
                        className="inline-flex items-center gap-1 text-primary text-xs font-bold hover:underline"
                      >
                        <span className="material-symbols-outlined text-sm">open_in_new</span>
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default IssueList;
