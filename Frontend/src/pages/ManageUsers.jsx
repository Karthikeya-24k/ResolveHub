import { useEffect, useState } from 'react';
import { getAllUsers, updateUserRole } from '../services/api';
import Layout from '../components/Layout';
import Badge from '../components/Badge';
import AlertMessage from '../components/AlertMessage';

const ROLES = ['USER', 'STAFF', 'ADMIN'];

const ManageUsers = () => {
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [updating, setUpdating]   = useState(null);
  const [selected, setSelected]   = useState({});
  const [updateMsg, setUpdateMsg] = useState({});
  const [showFilter, setShowFilter] = useState(false);
  const [filterRole, setFilterRole] = useState('');
  const [search, setSearch]         = useState('');

  useEffect(() => {
    getAllUsers()
      .then((res) => {
        const list = res.data.data || [];
        setUsers(list);
        const init = {};
        list.forEach((u) => { init[u.id] = u.role; });
        setSelected(init);
      })
      .catch(() => setError('Failed to load users. Please refresh.'))
      .finally(() => setLoading(false));
  }, []);

  const handleUpdate = async (id) => {
    setUpdating(id);
    setUpdateMsg((prev) => ({ ...prev, [id]: null }));
    try {
      const res = await updateUserRole(id, selected[id]);
      setUsers((prev) => prev.map((u) => (u.id === id ? res.data.data : u)));
      setUpdateMsg((prev) => ({ ...prev, [id]: { type: 'success', text: 'Role updated!' } }));
    } catch (err) {
      setUpdateMsg((prev) => ({ ...prev, [id]: { type: 'error', text: err.response?.data?.message || 'Update failed' } }));
    } finally {
      setUpdating(null);
    }
  };

  const filtered = users.filter((u) => {
    const matchRole   = filterRole ? u.role === filterRole : true;
    const matchSearch = search
      ? u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
      : true;
    return matchRole && matchSearch;
  });

  const isFiltered = filterRole || search;

  const admins = users.filter((u) => u.role === 'ADMIN').length;
  const staff  = users.filter((u) => u.role === 'STAFF').length;
  const normal = users.filter((u) => u.role === 'USER').length;

  return (
    <Layout>
      {/* Header + Stats */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end mb-8">
        <div className="lg:col-span-4 space-y-2">
          <p className="text-primary font-bold text-xs tracking-widest uppercase">Admin Panel</p>
          <h2 className="text-4xl font-headline font-extrabold tracking-tight text-on-surface">User Management</h2>
          <p className="text-on-surface-variant text-sm">Directory of all registered personnel and access controls.</p>
        </div>
        <div className="lg:col-span-8 grid grid-cols-3 gap-4">
          {[
            { label: 'Total Admins',   value: admins, accent: 'text-primary',    border: '' },
            { label: 'Staff Members',  value: staff,  accent: 'text-on-surface', border: 'border-l-4 border-primary' },
            { label: 'Standard Users', value: normal, accent: 'text-on-surface', border: '' },
          ].map(({ label, value, accent, border }) => (
            <div key={label} className={`bg-surface-container-lowest p-6 rounded-xl ambient-shadow flex flex-col gap-2 ${border}`}>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
              <span className={`text-3xl font-headline font-extrabold ${accent}`}>{value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Table */}
      <section className="bg-surface-container-lowest rounded-xl ambient-shadow overflow-hidden">
        <div className="px-6 py-5 flex justify-between items-center border-b border-surface-container-high">
          <h3 className="font-headline font-bold text-on-surface">Access List</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilter((v) => !v)}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                isFiltered
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 hover:bg-surface-container-high'
              }`}
            >
              <span className="material-symbols-outlined text-sm">filter_list</span>
              Filter{isFiltered ? ` (${[filterRole, search].filter(Boolean).length})` : ''}
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilter && (
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Search</label>
                <input
                  type="text"
                  placeholder="Name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-900 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Role</label>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-900 transition-all appearance-none"
                >
                  <option value="">All Roles</option>
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <button
              onClick={() => { setFilterRole(''); setSearch(''); setShowFilter(false); }}
              className="mt-3 text-xs text-primary font-semibold hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}

        <AlertMessage type="error" message={error} />

        {loading ? (
          <div className="flex items-center justify-center p-12 gap-3 text-on-surface-variant">
            <span className="material-symbols-outlined animate-spin">progress_activity</span>
            Loading users...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-on-surface-variant">
            <span className="material-symbols-outlined text-5xl mb-3 opacity-30">group</span>
            <p className="text-sm font-medium">{isFiltered ? 'No users match the filters.' : 'No users found.'}</p>
            {isFiltered && (
              <button
                onClick={() => { setFilterRole(''); setSearch(''); }}
                className="mt-3 text-xs text-primary font-semibold hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container text-on-surface-variant">
                  {['User Profile', 'Email Address', 'Access Role', 'Change Role', 'Actions'].map((h) => (
                    <th key={h} className="px-6 py-4 text-[11px] font-black uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-low">
                {filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-surface-container-low transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary">
                          <span className="material-symbols-outlined">person</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-on-surface">{user.name}</p>
                          <p className="text-xs text-slate-500">ID #{user.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-600">{user.email}</td>
                    <td className="px-6 py-5"><Badge value={user.role} /></td>
                    <td className="px-6 py-5">
                      <div className="relative inline-block w-full max-w-[140px]">
                        <select
                          className="w-full appearance-none bg-surface-container border-none text-xs font-bold rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 outline-none"
                          value={selected[user.id] || user.role}
                          onChange={(e) => setSelected((prev) => ({ ...prev, [user.id]: e.target.value }))}
                        >
                          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                        </select>
                        <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-outline text-sm">expand_more</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => handleUpdate(user.id)}
                          disabled={updating === user.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-fixed text-primary rounded-lg text-xs font-bold hover:bg-secondary-container transition-all disabled:opacity-50"
                        >
                          <span className="material-symbols-outlined text-sm">
                            {updating === user.id ? 'progress_activity' : 'save'}
                          </span>
                          {updating === user.id ? 'Saving...' : 'Update'}
                        </button>
                        {updateMsg[user.id] && (
                          <span className={`text-[10px] font-bold ${updateMsg[user.id].type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                            {updateMsg[user.id].text}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </Layout>
  );
};

export default ManageUsers;
