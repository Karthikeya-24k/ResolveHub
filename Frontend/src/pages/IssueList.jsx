import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllIssues } from '../services/api';
import Layout from '../components/Layout';
import Badge from '../components/Badge';

const IssueList = () => {
  const [issues, setIssues]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getAllIssues()
      .then((res) => setIssues(res.data))
      .catch(() => setError('Failed to load issues.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-primary font-bold text-xs tracking-widest uppercase mb-1">Issue Tracker</p>
          <h2 className="text-3xl font-extrabold text-on-surface tracking-tight font-headline">All Issues</h2>
        </div>
        <div className="flex gap-2">
          <button className="bg-surface-container-high px-4 py-2 rounded-lg text-sm font-semibold hover:bg-surface-container-highest transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">filter_list</span>
            Filter
          </button>
          <button
            onClick={() => navigate('/issues/create')}
            className="primary-gradient text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            New Issue
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 mb-6 rounded-lg bg-error-container text-on-error-container text-sm">
          <span className="material-symbols-outlined">error</span>
          {error}
        </div>
      )}

      <div className="bg-surface-container-lowest rounded-xl ambient-shadow overflow-hidden border border-outline-variant/10">
        <div className="px-6 py-5 flex justify-between items-center border-b border-surface-container-high">
          <h3 className="font-headline font-bold text-on-surface">Issue List</h3>
          <span className="text-xs font-bold bg-surface-container px-2 py-1 rounded-full text-on-surface-variant">
            {issues.length} total
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12 gap-3 text-on-surface-variant">
            <span className="material-symbols-outlined animate-spin">progress_activity</span>
            Loading issues...
          </div>
        ) : issues.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-on-surface-variant">
            <span className="material-symbols-outlined text-5xl mb-3 opacity-30">inbox</span>
            <p className="text-sm font-medium">No issues found.</p>
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
