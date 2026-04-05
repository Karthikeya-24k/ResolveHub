import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllIssues } from '../services/api';
import { getRole } from '../services/auth';
import Layout from '../components/Layout';

const MetricCard = ({ icon, iconBg, label, value, valueColor, badge }) => (
  <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 ambient-shadow">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 ${iconBg} rounded-lg`}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      {badge && (
        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">trending_up</span>
          {badge}
        </span>
      )}
    </div>
    <h3 className="text-slate-500 text-xs font-bold tracking-widest uppercase">{label}</h3>
    <p className={`text-3xl font-black mt-1 ${valueColor}`}>{value}</p>
  </div>
);

const Dashboard = () => {
  const [issues, setIssues] = useState([]);
  const [error, setError]   = useState('');
  const navigate = useNavigate();
  const role = getRole();

  useEffect(() => {
    getAllIssues()
      .then((res) => setIssues(res.data))
      .catch(() => setError('Failed to load issues.'));
  }, []);

  const count = (key, val) => issues.filter((i) => i[key] === val).length;

  return (
    <Layout>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-primary font-bold text-xs tracking-widest uppercase mb-1">System Overview</p>
          <h2 className="text-3xl font-extrabold text-on-surface tracking-tight font-headline">Dashboard</h2>
        </div>
        <div className="flex gap-2">
          <button className="bg-surface-container-high px-4 py-2 rounded-lg text-sm font-semibold hover:bg-surface-container-highest transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">download</span>
            Export Report
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

      {error && (
        <div className="flex items-center gap-3 p-4 mb-6 rounded-lg bg-error-container text-on-error-container text-sm">
          <span className="material-symbols-outlined">error</span>
          {error}
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard icon="analytics"    iconBg="bg-indigo-50 text-primary"  label="Total Issues"  value={issues.length}                    valueColor="text-on-surface" badge="+12%" />
        <MetricCard icon="drafts"       iconBg="bg-blue-50 text-blue-600"   label="Open Issues"   value={count('status','OPEN')}            valueColor="text-blue-600" />
        <MetricCard icon="sync_alt"     iconBg="bg-amber-50 text-amber-600" label="In Progress"   value={count('status','IN_PROGRESS')}     valueColor="text-amber-600" />
        <MetricCard icon="check_circle" iconBg="bg-green-50 text-green-600" label="Resolved"      value={count('status','RESOLVED')}        valueColor="text-green-600" />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Issues */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl p-8 ambient-shadow">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold tracking-tight font-headline">Recent Issues</h3>
            <button onClick={() => navigate('/issues')} className="text-primary text-sm font-semibold hover:underline">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {issues.length === 0 ? (
              <p className="text-sm text-on-surface-variant">No issues found.</p>
            ) : (
              issues.slice(0, 5).map((issue) => (
                <div
                  key={issue.id}
                  onClick={() => navigate(`/issues/${issue.id}`)}
                  className="flex items-center gap-4 p-4 rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-sm">bug_report</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-on-surface truncate">{issue.title}</p>
                    <p className="text-xs text-on-surface-variant">#{issue.id}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container">
                      {issue.status || 'OPEN'}
                    </span>
                    {issue.priority && (
                      <span className="text-xs text-on-surface-variant">{issue.priority}</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions + Status */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-surface-container-lowest rounded-xl p-6 ambient-shadow">
            <h3 className="text-lg font-bold tracking-tight mb-6 font-headline">Quick Actions</h3>
            <div className="space-y-3">
              {[
                { icon: 'list_alt',       label: 'View Issues',    sub: 'Issue Tracking',    to: '/issues'         },
                { icon: 'add_circle',     label: 'Create Issue',   sub: 'Submit Complaint',  to: '/issues/create'  },
                { icon: 'assignment_ind', label: 'Assign Issues',  sub: 'Admin Only',        to: '/issues/assign'  },
                { icon: 'sync_alt',       label: 'Update Status',  sub: 'Staff Action',      to: '/issues/status'  },
              ].map(({ icon, label, sub, to }) => (
                <button
                  key={to}
                  onClick={() => navigate(to)}
                  className="w-full flex items-center gap-4 p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors group text-left"
                >
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                    <span className="material-symbols-outlined text-primary">{icon}</span>
                  </div>
                  <div>
                    <span className="block text-sm font-bold text-slate-900">{label}</span>
                    <span className="text-[11px] text-slate-500 uppercase tracking-widest font-bold">{sub}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* System Status */}
          <div className="bg-indigo-600 rounded-xl p-6 text-white overflow-hidden relative shadow-lg shadow-indigo-200">
            <div className="relative z-10">
              <h3 className="font-bold text-lg mb-2 font-headline">System Status</h3>
              <div className="flex items-center gap-2 text-indigo-100 text-sm mb-4">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                All services operational
              </div>
              <p className="text-xs text-indigo-200/80 leading-relaxed">
                The complaint intake engine and database clusters are performing optimally.
              </p>
            </div>
            <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-white/10 text-[120px] pointer-events-none">auto_awesome</span>
          </div>
        </div>
      </div>

      {/* Bottom Bento */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        <div className="md:col-span-2 lg:col-span-3 bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/10 ambient-shadow flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold tracking-tight font-headline">Need technical assistance?</h3>
            <p className="text-slate-500 text-sm mt-1">Our support team is available 24/7 for internal system emergencies.</p>
          </div>
          <button className="bg-slate-900 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-slate-800 transition-all shrink-0 ml-4">
            Contact Support
          </button>
        </div>
        <div className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/10 ambient-shadow flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-black text-indigo-600">98%</span>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-2">SLA Compliance</p>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
