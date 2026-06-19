import { useEffect, useState } from 'react';
import { getAllUsers, updateUserRole, deleteUser, getOrganizations } from '../services/api';
import { getEmail } from '../services/auth';
import Layout from '../components/Layout';
import Badge from '../components/Badge';
import AlertMessage from '../components/AlertMessage';

const ManageAdmins = () => {
  const currentEmail = getEmail();
  const [users, setUsers]     = useState([]);
  const [orgs, setOrgs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [search, setSearch]   = useState('');
  const [actionMsg, setActionMsg] = useState({});
  const [busy, setBusy]       = useState(null);

  useEffect(() => {
    Promise.all([getAllUsers(), getOrganizations()])
      .then(([usersRes, orgsRes]) => {
        setUsers(usersRes.data.data || []);
        setOrgs(orgsRes.data.data || []);
      })
      .catch(() => setError('Failed to load users.'))
      .finally(() => setLoading(false));
  }, []);

  const orgName = (orgId) => orgs.find((o) => o.id === orgId)?.name || '—';

  const setMsg = (id, type, text) =>
    setActionMsg((prev) => ({ ...prev, [id]: { type, text } }));

  const handlePromote = async (user) => {
    setBusy(user.id);
    try {
      const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
      const res = await updateUserRole(user.id, newRole);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? res.data.data : u)));
      setMsg(user.id, 'success', newRole === 'ADMIN' ? 'Promoted to Admin' : 'Demoted to User');
    } catch (err) {
      setMsg(user.id, 'error', err.response?.data?.message || 'Action failed');
    } finally {
      setBusy(null);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete ${user.name}? This cannot be undone.`)) return;
    setBusy(user.id);
    try {
      await deleteUser(user.id);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch (err) {
      setMsg(user.id, 'error', err.response?.data?.message || 'Delete failed');
      setBusy(null);
    }
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
  });

  const admins = users.filter((u) => u.role === 'ADMIN').length;
  const staff  = users.filter((u) => u.role === 'STAFF').length;
  const normal = users.filter((u) => u.role === 'USER').length;

  return (
    <Layout>
      <div className="mb-8">
        <p className="text-purple-600 font-bold text-xs tracking-widest uppercase mb-1">Super Admin</p>
        <h2 className="text-3xl font-extrabold tracking-tight font-headline" style={{ color: 'var(--text-primary)' }}>
          Manage Admins
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Promote users to Admin, demote existing Admins, or remove accounts.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Admins', value: admins, color: 'text-indigo-600' },
          { label: 'Staff',  value: staff,  color: 'text-amber-600'  },
          { label: 'Users',  value: normal, color: 'text-green-600'  },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-surface-container-lowest rounded-xl p-5 ambient-shadow text-center">
            <p className={`text-3xl font-black font-headline ${color}`}>{value}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: 'var(--text-faint)' }}>{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-surface-container-lowest rounded-xl ambient-shadow overflow-hidden" style={{ border: '1px solid var(--surface-border)' }}>
        {/* Search header */}
        <div className="px-6 py-4 flex items-center gap-3" style={{ borderBottom: '1px solid var(--surface-border)' }}>
          <div className="relative flex-1 max-w-sm">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] pointer-events-none" style={{ color: 'var(--text-faint)' }}>search</span>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="field text-sm"
              style={{ paddingLeft: '2.25rem' }}
            />
          </div>
          <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ backgroundColor: 'var(--surface-raised)', color: 'var(--text-muted)' }}>
            {filtered.length} users
          </span>
        </div>

        <AlertMessage type="error" message={error} />

        {loading ? (
          <div className="flex items-center justify-center p-12 gap-3" style={{ color: 'var(--text-muted)' }}>
            <span className="material-symbols-outlined animate-spin">progress_activity</span>
            Loading users...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-12" style={{ color: 'var(--text-muted)' }}>
            <span className="material-symbols-outlined text-5xl mb-3 opacity-30">group</span>
            <p className="text-sm">No users found.</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr style={{ backgroundColor: 'var(--surface-raised)', color: 'var(--text-muted)' }}>
                    {['User', 'Email', 'Organization', 'Role', 'Actions'].map((h) => (
                      <th key={h} className="px-6 py-4 text-[11px] font-black uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((user) => {
                    const isSelf    = user.email === currentEmail;
                    const isSeeded  = user.seededAdmin;
                    const locked    = isSelf || isSeeded;
                    return (
                      <tr key={user.id} className="transition-colors" style={{ borderTop: '1px solid var(--surface-border)' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-raised)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full primary-gradient flex items-center justify-center text-white font-bold text-sm shrink-0">
                              {(user.name || user.email)[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{user.name}</p>
                              <p className="text-xs" style={{ color: 'var(--text-faint)' }}>#{user.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{user.email}</td>
                        <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {user.organizationId ? (
                            <span className="text-xs font-semibold">{orgName(user.organizationId)}</span>
                          ) : (
                            <span className="text-xs italic" style={{ color: 'var(--text-faint)' }}>Unassigned</span>
                          )}
                        </td>
                        <td className="px-6 py-4"><Badge value={user.role} /></td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 flex-wrap">
                            {locked ? (
                              <span className="locked-badge">
                                <span className="material-symbols-outlined text-sm">lock</span>
                                {isSeeded ? 'Seeded' : 'You'}
                              </span>
                            ) : (
                              <>
                                <button
                                  onClick={() => handlePromote(user)}
                                  disabled={busy === user.id}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                                  style={{ backgroundColor: user.role === 'ADMIN' ? 'var(--surface-raised)' : 'var(--accent-indigo-soft)', color: user.role === 'ADMIN' ? 'var(--text-secondary)' : '#4f46e5', border: '1px solid var(--surface-border)' }}
                                >
                                  <span className="material-symbols-outlined text-sm">
                                    {busy === user.id ? 'progress_activity' : user.role === 'ADMIN' ? 'arrow_downward' : 'arrow_upward'}
                                  </span>
                                  {user.role === 'ADMIN' ? 'Demote' : 'Promote to Admin'}
                                </button>
                                <button
                                  onClick={() => handleDelete(user)}
                                  disabled={busy === user.id}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                  style={{ border: '1px solid var(--surface-border)' }}
                                >
                                  <span className="material-symbols-outlined text-sm">delete</span>
                                  Delete
                                </button>
                              </>
                            )}
                            {actionMsg[user.id] && (
                              <span className={`text-[10px] font-bold ${actionMsg[user.id].type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                {actionMsg[user.id].text}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y" style={{ borderColor: 'var(--surface-border)' }}>
              {filtered.map((user) => {
                const locked = user.email === currentEmail || user.seededAdmin;
                return (
                  <div key={user.id} className="p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full primary-gradient flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {(user.name || user.email)[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{user.name}</p>
                        <p className="text-xs truncate" style={{ color: 'var(--text-faint)' }}>{user.email}</p>
                      </div>
                      <Badge value={user.role} />
                    </div>
                    {!locked && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handlePromote(user)}
                          disabled={busy === user.id}
                          className="flex-1 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                          style={{ backgroundColor: 'var(--accent-indigo-soft)', color: '#4f46e5' }}
                        >
                          {user.role === 'ADMIN' ? 'Demote' : 'Promote'}
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          disabled={busy === user.id}
                          className="flex-1 py-2 rounded-lg text-xs font-bold text-red-600 transition-all disabled:opacity-50"
                          style={{ backgroundColor: 'var(--surface-raised)' }}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                    {actionMsg[user.id] && (
                      <p className={`text-[10px] font-bold ${actionMsg[user.id].type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                        {actionMsg[user.id].text}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default ManageAdmins;
