import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSuperAdminStats, getAllAdmins, getOrganizations, getApplicationStats } from '../services/api';
import Layout from '../components/Layout';
import AlertMessage from '../components/AlertMessage';

const StatCard = ({ icon, label, value, color }) => (
  <div className="rounded-2xl border overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg bg-white dark:bg-slate-900/40" style={{ borderColor: 'var(--surface-border)' }}>
    <div className={`h-1 w-full ${color}`} />
    <div className="p-6">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-5 ${color.replace('bg-', 'bg-').replace('-500', '-100')} dark:opacity-80`}>
        <span className={`material-symbols-outlined text-[20px] ${color.replace('bg-', 'text-')}`}>{icon}</span>
      </div>
      <p className="text-[11px] font-bold tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className="text-4xl font-black mt-1.5 leading-none tracking-tight" style={{ color: 'var(--text-primary)' }}>{value ?? '—'}</p>
    </div>
  </div>
);

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats]   = useState(null);
  const [admins, setAdmins] = useState([]);
  const [orgs, setOrgs]     = useState([]);
  const [appStats, setAppStats] = useState(null);
  const [error, setError]   = useState('');

  useEffect(() => {
    Promise.all([getSuperAdminStats(), getAllAdmins(), getOrganizations(), getApplicationStats()])
      .then(([s, a, o, as_]) => {
        setStats(s.data.data);
        setAdmins(a.data.data || []);
        setOrgs(o.data.data || []);
        setAppStats(as_.data.data);
      })
      .catch(() => setError('Failed to load dashboard data.'));
  }, []);

  return (
    <Layout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-purple-600 font-bold text-xs tracking-widest uppercase mb-1">Super Admin</p>
          <h2 className="text-3xl font-extrabold tracking-tight font-headline" style={{ color: 'var(--text-primary)' }}>
            Platform Overview
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            High-level platform health. Drill into an organization to view its complaints.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/superadmin/organizations')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            style={{ backgroundColor: 'var(--surface-raised)', color: 'var(--text-primary)', border: '1px solid var(--surface-border)' }}
          >
            <span className="material-symbols-outlined text-sm">domain</span>
            Organizations
          </button>
          <button
            onClick={() => navigate('/superadmin/admins')}
            className="primary-gradient text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">manage_accounts</span>
            Manage Admins
          </button>
        </div>
      </div>

      <AlertMessage type="error" message={error} />

      {/* Platform stats — counts only, no issue list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard icon="domain"           label="Organizations"  value={orgs.length}    color="bg-purple-500" />
        <StatCard icon="manage_accounts"  label="Total Admins"   value={stats?.admins}  color="bg-indigo-500" />
        <StatCard icon="support_agent"    label="Total Staff"    value={stats?.staff}   color="bg-amber-500"  />
        <StatCard icon="group"            label="Total Users"    value={stats?.users}   color="bg-green-500"  />
      </div>

      {/* Pending applications alert */}
      {appStats?.pending > 0 && (
        <div
          className="flex items-center justify-between gap-4 px-5 py-4 rounded-xl mb-6 cursor-pointer"
          style={{ backgroundColor: 'var(--accent-indigo-soft)', border: '1px solid #c7d2fe' }}
          onClick={() => navigate('/superadmin/applications')}
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-indigo-600">pending_actions</span>
            <div>
              <p className="text-sm font-bold text-indigo-700 dark:text-indigo-300">
                {appStats.pending} pending organization application{appStats.pending > 1 ? 's' : ''}
              </p>
              <p className="text-xs text-indigo-600 dark:text-indigo-400">Click to review and approve</p>
            </div>
          </div>
          <span className="material-symbols-outlined text-indigo-600">arrow_forward</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Organizations with drill-down */}
        <div className="lg:col-span-2 rounded-xl ambient-shadow overflow-hidden" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--surface-border)' }}>
            <h3 className="text-base font-bold font-headline" style={{ color: 'var(--text-primary)' }}>Organizations</h3>
            <button
              onClick={() => navigate('/superadmin/organizations')}
              className="text-indigo-600 text-xs font-semibold hover:underline"
            >
              Manage All
            </button>
          </div>

          {orgs.length === 0 ? (
            <div className="flex flex-col items-center py-10 gap-2" style={{ color: 'var(--text-muted)' }}>
              <span className="material-symbols-outlined text-4xl opacity-25">domain_disabled</span>
              <p className="text-sm">No organizations yet.</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--surface-border)' }}>
              {orgs.map((org) => (
                <div
                  key={org.id}
                  className="flex items-center gap-4 px-6 py-4"
                >
                  {/* Org avatar */}
                  <div className="w-10 h-10 rounded-xl primary-gradient flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {org.name[0].toUpperCase()}
                  </div>

                  {/* Org info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{org.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <code className="text-[10px] font-mono" style={{ color: 'var(--text-faint)' }}>{org.slug}</code>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${org.status === 'ACTIVE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                        {org.status}
                      </span>
                    </div>
                  </div>

                  {/* Drill-down buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => navigate(`/superadmin/audit/${org.id}`)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                      style={{ backgroundColor: 'var(--accent-indigo-soft)', color: '#4f46e5', border: '1px solid var(--surface-border)' }}
                      title="View all issues for this organization"
                    >
                      <span className="material-symbols-outlined text-sm">list_alt</span>
                      <span className="hidden sm:inline">View Issues</span>
                    </button>
                    <button
                      onClick={() => navigate(`/superadmin/audit/${org.id}?mode=escalated`)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      style={{ border: '1px solid var(--surface-border)' }}
                      title="Level 3 Audit — escalated and sensitive cases only"
                    >
                      <span className="material-symbols-outlined text-sm">crisis_alert</span>
                      <span className="hidden sm:inline">Escalated</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Admin accounts + quick actions */}
        <div className="space-y-5">
          {/* Recent admins */}
          <div className="rounded-xl p-5 ambient-shadow" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold font-headline" style={{ color: 'var(--text-primary)' }}>Admin Accounts</h3>
              <button onClick={() => navigate('/superadmin/admins')} className="text-indigo-600 text-xs font-semibold hover:underline">
                Manage
              </button>
            </div>
            {admins.length === 0 ? (
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No admin accounts found.</p>
            ) : (
              <div className="space-y-2">
                {admins.slice(0, 4).map((admin) => (
                  <div key={admin.id} className="flex items-center gap-3 p-2 rounded-lg" style={{ backgroundColor: 'var(--surface-raised)' }}>
                    <div className="w-7 h-7 rounded-full primary-gradient flex items-center justify-center text-white font-bold text-xs shrink-0">
                      {(admin.name || admin.email)[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate" style={{ color: 'var(--text-primary)' }}>{admin.name}</p>
                      <p className="text-[10px] truncate" style={{ color: 'var(--text-faint)' }}>{admin.email}</p>
                    </div>
                    {admin.seededAdmin && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 shrink-0">
                        Seeded
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Audit info card */}
          <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--surface-raised)', border: '1px solid var(--surface-border)' }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-purple-500 text-sm">policy</span>
              <h3 className="text-xs font-bold font-headline uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Audit Levels</h3>
            </div>
            <div className="space-y-2.5">
              {[
                { level: 'L1', label: 'Platform Overview', desc: 'This dashboard — org counts only', color: 'bg-slate-400' },
                { level: 'L2', label: 'Org Issues', desc: 'All complaints for one org', color: 'bg-indigo-500' },
                { level: 'L3', label: 'Escalated Cases', desc: 'HIGH priority or unresolved only', color: 'bg-red-500' },
              ].map(({ level, label, desc, color }) => (
                <div key={level} className="flex items-start gap-2.5">
                  <span className={`mt-1 w-2 h-2 rounded-full shrink-0 ${color}`} />
                  <div>
                    <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                      <span style={{ color: 'var(--text-faint)' }}>{level} · </span>{label}
                    </p>
                    <p className="text-[10px]" style={{ color: 'var(--text-faint)' }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SuperAdminDashboard;
