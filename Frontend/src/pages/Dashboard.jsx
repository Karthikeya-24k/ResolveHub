import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllIssues } from '../services/api';
import { getRole } from '../services/auth';
import Layout from '../components/Layout';
import AlertMessage from '../components/AlertMessage';

const STATUS_COLOR = {
  OPEN:         'bg-blue-100 text-blue-700',
  UNDER_REVIEW: 'bg-purple-100 text-purple-700',
  ASSIGNED:     'bg-indigo-100 text-indigo-700',
  IN_PROGRESS:  'bg-amber-100 text-amber-700',
  RESOLVED:     'bg-green-100 text-green-700',
  CLOSED:       'bg-slate-100 text-slate-600',
};

const PRIORITY_COLOR = {
  HIGH:   'bg-red-100 text-red-700',
  MEDIUM: 'bg-orange-100 text-orange-700',
  LOW:    'bg-slate-100 text-slate-500',
};

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
  const role  = getRole();

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

      <AlertMessage type="error" message={error} />

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
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold tracking-tight font-headline">Recent Issues</h3>
            <button onClick={() => navigate('/issues')} className="text-primary text-sm font-semibold hover:underline">
              View All
            </button>
          </div>
          <div className="space-y-3">
            {issues.length === 0 ? (
              <p className="text-sm text-on-surface-variant">No issues found.</p>
            ) : (
              issues.slice(0, 5).map((issue) => (
                <div
                  key={issue.id}
                  onClick={() => navigate(`/issues/${issue.id}`)}
                  className="flex items-center gap-4 p-4 rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer border border-transparent hover:border-outline-variant/20"
                >
                  <div className="w-9 h-9 rounded-full bg-primary-fixed flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-sm">bug_report</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-on-surface truncate">{issue.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">#{issue.id}{issue.assignedTo ? ` · ${issue.assignedTo}` : ''}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLOR[issue.status] || 'bg-slate-100 text-slate-600'}`}>
                      {issue.status || 'OPEN'}
                    </span>
                    {issue.priority && (
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${PRIORITY_COLOR[issue.priority] || 'bg-slate-100 text-slate-500'}`}>
                        {issue.priority}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions + Activity */}
        <div className="lg:col-span-1 space-y-6">
          {/* Quick Actions */}
          <div className="bg-surface-container-lowest rounded-xl p-6 ambient-shadow">
            <h3 className="text-lg font-bold tracking-tight mb-4 font-headline">Quick Actions</h3>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => navigate('/issues/create')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg primary-gradient text-white font-semibold text-sm shadow shadow-primary/20 hover:opacity-90 transition-all"
              >
                <span className="material-symbols-outlined text-sm">add_circle</span>
                Create Issue
              </button>
              <button
                onClick={() => navigate('/issues')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm transition-colors"
              >
                <span className="material-symbols-outlined text-sm text-primary">list_alt</span>
                View My Issues
              </button>
              {role === 'STAFF' && (
                <button
                  onClick={() => navigate('/issues/status')}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm transition-colors"
                >
                  <span className="material-symbols-outlined text-sm text-amber-500">sync_alt</span>
                  Update Status
                </button>
              )}
              {role === 'ADMIN' && (
                <button
                  onClick={() => navigate('/issues/assign')}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm transition-colors"
                >
                  <span className="material-symbols-outlined text-sm text-indigo-500">assignment_ind</span>
                  Assign Issues
                </button>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-surface-container-lowest rounded-xl p-6 ambient-shadow">
            <h3 className="text-lg font-bold tracking-tight mb-4 font-headline">Recent Activity</h3>
            <div className="space-y-3">
              {issues.length === 0 ? (
                <p className="text-sm text-slate-400">No recent activity.</p>
              ) : (
                issues.slice(0, 4).map((issue) => (
                  <div key={issue.id} className="flex items-start gap-3">
                    <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                      issue.status === 'RESOLVED'    ? 'bg-green-500' :
                      issue.status === 'IN_PROGRESS' ? 'bg-amber-500' :
                      issue.status === 'OPEN'        ? 'bg-blue-500'  : 'bg-slate-400'
                    }`} />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">{issue.title}</p>
                      <p className="text-[11px] text-slate-400">{issue.status}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
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
