import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { getOrgIssues, getEscalatedOrgIssues } from '../services/api';
import { getOrganizations } from '../services/api';
import Layout from '../components/Layout';
import Badge from '../components/Badge';

const STATUS_COLOR = {
  OPEN:         'bg-blue-100  text-blue-700  dark:bg-blue-900/40  dark:text-blue-300',
  UNDER_REVIEW: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  ASSIGNED:     'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  IN_PROGRESS:  'bg-amber-100 text-amber-700  dark:bg-amber-900/40  dark:text-amber-300',
  RESOLVED:     'bg-green-100 text-green-700  dark:bg-green-900/40  dark:text-green-300',
  CLOSED:       'bg-slate-100 text-slate-600  dark:bg-slate-800     dark:text-slate-400',
};

const OrgAudit = () => {
  const { orgId }                   = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate                    = useNavigate();
  const isEscalated                 = searchParams.get('mode') === 'escalated';

  const [issues, setIssues]   = useState([]);
  const [orgName, setOrgName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [search, setSearch]   = useState('');

  useEffect(() => {
    // Fetch org name
    getOrganizations()
      .then((res) => {
        const org = (res.data.data || []).find((o) => String(o.id) === String(orgId));
        if (org) setOrgName(org.name);
      })
      .catch(() => {});
  }, [orgId]);

  useEffect(() => {
    setLoading(true);
    setError('');
    const call = isEscalated ? getEscalatedOrgIssues(orgId) : getOrgIssues(orgId);
    call
      .then((res) => setIssues(res.data.data || []))
      .catch(() => setError('Failed to load issues.'))
      .finally(() => setLoading(false));
  }, [orgId, isEscalated]);

  const filtered = issues.filter((i) => {
    const q = search.toLowerCase();
    return !q ||
      i.ticketNumber?.toLowerCase().includes(q) ||
      i.title?.toLowerCase().includes(q) ||
      i.createdBy?.toLowerCase().includes(q) ||
      i.status?.toLowerCase().includes(q);
  });

  const toggleMode = () => {
    setSearchParams(isEscalated ? {} : { mode: 'escalated' });
  };

  return (
    <Layout>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 mb-6 text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
        <button onClick={() => navigate('/superadmin/dashboard')} className="hover:text-indigo-600 transition-colors">
          Dashboard
        </button>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <span style={{ color: 'var(--text-primary)' }}>{orgName || `Org #${orgId}`}</span>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <span className={isEscalated ? 'text-red-600' : 'text-indigo-600'}>
          {isEscalated ? 'Escalated Cases' : 'All Issues'}
        </span>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          {/* Level badge */}
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-2 ${isEscalated ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'}`}>
            <span className="material-symbols-outlined text-xs">{isEscalated ? 'crisis_alert' : 'list_alt'}</span>
            {isEscalated ? 'Level 3 · Escalated Audit' : 'Level 2 · Org Issues'}
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight font-headline" style={{ color: 'var(--text-primary)' }}>
            {orgName || `Organization #${orgId}`}
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {isEscalated
              ? 'Showing HIGH priority and unresolved complaints only.'
              : 'All complaints submitted under this organization.'}
          </p>
        </div>

        <div className="flex gap-2 shrink-0">
          {/* Toggle between L2 and L3 */}
          <button
            onClick={toggleMode}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              isEscalated
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 hover:bg-indigo-200'
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200'
            }`}
          >
            <span className="material-symbols-outlined text-sm">
              {isEscalated ? 'list_alt' : 'crisis_alert'}
            </span>
            {isEscalated ? 'View All Issues' : 'Escalated Only'}
          </button>
          <button
            onClick={() => navigate('/superadmin/dashboard')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            style={{ backgroundColor: 'var(--surface-raised)', color: 'var(--text-primary)', border: '1px solid var(--surface-border)' }}
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back
          </button>
        </div>
      </div>

      {/* Search + count */}
      <div className="rounded-xl ambient-shadow overflow-hidden" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
        <div className="px-5 py-4 flex flex-col sm:flex-row gap-3" style={{ borderBottom: '1px solid var(--surface-border)' }}>
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] pointer-events-none" style={{ color: 'var(--text-faint)' }}>search</span>
            <input
              type="text"
              placeholder="Search by ticket, title, user, or status..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="field text-sm"
              style={{ paddingLeft: '2.25rem' }}
            />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isEscalated && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                <span className="material-symbols-outlined text-xs">warning</span>
                Audit Mode
              </span>
            )}
            <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: 'var(--surface-raised)', color: 'var(--text-muted)' }}>
              {filtered.length} / {issues.length}
            </span>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-4 text-sm text-red-600">
            <span className="material-symbols-outlined text-sm">error</span>
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center p-12 gap-3" style={{ color: 'var(--text-muted)' }}>
            <span className="material-symbols-outlined animate-spin">progress_activity</span>
            Loading issues...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-14 gap-3" style={{ color: 'var(--text-muted)' }}>
            <span className="material-symbols-outlined text-5xl opacity-25">
              {isEscalated ? 'crisis_alert' : 'inbox'}
            </span>
            <p className="text-sm font-medium">
              {issues.length === 0
                ? isEscalated
                  ? 'No escalated cases found for this organization.'
                  : 'No complaints found for this organization.'
                : 'No issues match your search.'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr style={{ backgroundColor: 'var(--surface-raised)' }}>
                    {['Ticket', 'Title', 'Submitted By', 'Status', 'Priority', 'Action'].map((h) => (
                      <th key={h} className="px-6 py-4 text-[11px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((issue) => (
                    <tr
                      key={issue.id}
                      style={{ borderTop: '1px solid var(--surface-border)' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-raised)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td className="px-6 py-4">
                        <code className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {issue.ticketNumber || `#${issue.id}`}
                        </code>
                      </td>
                      <td className="px-6 py-4 max-w-[220px]">
                        <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{issue.title}</p>
                        {issue.anonymous && (
                          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Anonymous</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {issue.createdBy || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLOR[issue.status] || 'bg-slate-100 text-slate-600'}`}>
                          {issue.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge value={issue.priority || 'LOW'} />
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          to={`/issues/${issue.id}`}
                          className="inline-flex items-center gap-1 text-indigo-600 text-xs font-bold hover:underline"
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

            {/* Mobile cards */}
            <div className="md:hidden divide-y" style={{ borderColor: 'var(--surface-border)' }}>
              {filtered.map((issue) => (
                <div key={issue.id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <code className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {issue.ticketNumber || `#${issue.id}`}
                      </code>
                      <p className="text-sm font-bold truncate mt-0.5" style={{ color: 'var(--text-primary)' }}>{issue.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>
                        {issue.anonymous ? 'Anonymous' : issue.createdBy || '—'}
                      </p>
                    </div>
                    <Link to={`/issues/${issue.id}`} className="text-indigo-600 shrink-0">
                      <span className="material-symbols-outlined text-sm">open_in_new</span>
                    </Link>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLOR[issue.status] || 'bg-slate-100 text-slate-600'}`}>
                      {issue.status}
                    </span>
                    <Badge value={issue.priority || 'LOW'} />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default OrgAudit;
