import { useEffect, useState } from 'react';
import { getAllUsers, updateUserRole, createManagedUser, deleteManagedUser } from '../services/api';
import { getEmail } from '../services/auth';
import Layout from '../components/Layout';
import Badge from '../components/Badge';
import AlertMessage from '../components/AlertMessage';

const EMPTY_FORM = { name: '', email: '', password: '' };

/* ── Small modal component ─────────────────────────────────── */
const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
    <div className="rounded-2xl shadow-2xl w-full max-w-md p-8 relative" style={{ backgroundColor: 'var(--surface)' }}>
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-1.5 rounded-lg transition-colors"
        style={{ color: 'var(--text-muted)' }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface-raised)')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
      >
        <span className="material-symbols-outlined">close</span>
      </button>
      <h3 className="font-headline font-bold text-lg mb-6" style={{ color: 'var(--text-primary)' }}>{title}</h3>
      {children}
    </div>
  </div>
);

/* ── Main page ──────────────────────────────────────────────── */
const ManageUsers = () => {
  const currentEmail = getEmail();

  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [search, setSearch]     = useState('');
  const [filterRole, setFilterRole] = useState('');

  // Modal state
  const [modal, setModal]       = useState(null); // null | 'USER' | 'STAFF'
  const [form, setForm]         = useState(EMPTY_FORM);
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError]   = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Per-row state
  const [deleting, setDeleting]     = useState(null);
  const [roleUpdating, setRoleUpdating] = useState(null);
  const [selectedRole, setSelectedRole] = useState({});
  const [rowMsg, setRowMsg]         = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    setLoading(true);
    getAllUsers()
      .then((res) => {
        const list = res.data.data || [];
        setUsers(list);
        const init = {};
        list.forEach((u) => { init[u.id] = u.role; });
        setSelectedRole(init);
      })
      .catch(() => setError('Failed to load users. Please refresh.'))
      .finally(() => setLoading(false));
  };

  /* ── Create user/staff ──────────────────────────────────── */
  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setSubmitting(true);
    try {
      const res = await createManagedUser(
        { name: form.name, email: form.email, password: form.password },
        modal
      );
      const created = res.data.data;
      setUsers((prev) => [...prev, created]);
      setSelectedRole((prev) => ({ ...prev, [created.id]: created.role }));
      setFormSuccess(`${modal === 'STAFF' ? 'Staff member' : 'User'} created successfully!`);
      setForm(EMPTY_FORM);
      setTimeout(() => { setModal(null); setFormSuccess(''); }, 1500);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create user.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Delete user ────────────────────────────────────────── */
  const handleDelete = async (user) => {
    if (!window.confirm(`Remove ${user.name} from your team? This cannot be undone.`)) return;
    setDeleting(user.id);
    try {
      await deleteManagedUser(user.id);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch (err) {
      setRowMsg((prev) => ({ ...prev, [user.id]: { type: 'error', text: err.response?.data?.message || 'Delete failed' } }));
    } finally {
      setDeleting(null);
    }
  };

  /* ── Update role ────────────────────────────────────────── */
  const handleRoleUpdate = async (id) => {
    setRoleUpdating(id);
    setRowMsg((prev) => ({ ...prev, [id]: null }));
    try {
      const res = await updateUserRole(id, selectedRole[id]);
      setUsers((prev) => prev.map((u) => (u.id === id ? res.data.data : u)));
      setRowMsg((prev) => ({ ...prev, [id]: { type: 'success', text: 'Role updated!' } }));
    } catch (err) {
      setRowMsg((prev) => ({ ...prev, [id]: { type: 'error', text: err.response?.data?.message || 'Update failed' } }));
    } finally {
      setRoleUpdating(null);
    }
  };

  /* ── Filtering ──────────────────────────────────────────── */
  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch = !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
    const matchRole   = !filterRole || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const isLocked = (user) => user.seededAdmin || user.email === currentEmail;

  const staffCount = users.filter((u) => u.role === 'STAFF').length;
  const userCount  = users.filter((u) => u.role === 'USER').length;

  const openModal = (role) => {
    setForm(EMPTY_FORM);
    setFormError('');
    setFormSuccess('');
    setShowPass(false);
    setModal(role);
  };

  return (
    <Layout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-primary font-bold text-xs tracking-widest uppercase mb-1">Admin Panel</p>
          <h2 className="text-3xl font-extrabold tracking-tight font-headline" style={{ color: 'var(--text-primary)' }}>
            Manage Users
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Create and manage users and staff under your administration.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => openModal('USER')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            style={{ backgroundColor: 'var(--surface-raised)', color: 'var(--text-primary)', border: '1px solid var(--surface-border)' }}
          >
            <span className="material-symbols-outlined text-sm">person_add</span>
            Add User
          </button>
          <button
            onClick={() => openModal('STAFF')}
            className="primary-gradient text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-all shadow-md shadow-primary/20 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">badge</span>
            Add Staff
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {[
          { label: 'Staff Members',  value: staffCount, icon: 'support_agent', color: 'text-amber-600',  bg: 'bg-amber-50 dark:bg-amber-900/20'  },
          { label: 'Standard Users', value: userCount,  icon: 'group',         color: 'text-green-600',  bg: 'bg-green-50 dark:bg-green-900/20'  },
        ].map(({ label, value, icon, color, bg }) => (
          <div key={label} className="rounded-xl p-5 ambient-shadow flex items-center gap-4" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
              <span className={`material-symbols-outlined ${color}`}>{icon}</span>
            </div>
            <div>
              <p className="text-2xl font-black font-headline" style={{ color: 'var(--text-primary)' }}>{value}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="rounded-xl ambient-shadow overflow-hidden" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--surface-border)' }}>

        {/* Search + filter bar */}
        <div className="px-5 py-4 flex flex-col sm:flex-row gap-3" style={{ borderBottom: '1px solid var(--surface-border)' }}>
          <div className="relative flex-1">
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
          <div className="relative sm:w-40">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="field text-sm appearance-none pr-8"
            >
              <option value="">All Roles</option>
              <option value="USER">USER</option>
              <option value="STAFF">STAFF</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-sm" style={{ color: 'var(--text-faint)' }}>expand_more</span>
          </div>
          <span className="hidden sm:flex items-center text-xs font-bold px-2.5 py-1 rounded-full self-center" style={{ backgroundColor: 'var(--surface-raised)', color: 'var(--text-muted)' }}>
            {filtered.length} / {users.length}
          </span>
        </div>

        <AlertMessage type="error" message={error} />

        {loading ? (
          <div className="flex items-center justify-center p-12 gap-3" style={{ color: 'var(--text-muted)' }}>
            <span className="material-symbols-outlined animate-spin">progress_activity</span>
            Loading users...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-14 gap-3" style={{ color: 'var(--text-muted)' }}>
            <span className="material-symbols-outlined text-5xl opacity-25">group_off</span>
            <p className="text-sm font-medium">
              {users.length === 0 ? 'No users yet. Add your first user or staff member.' : 'No users match your search.'}
            </p>
            {users.length === 0 && (
              <div className="flex gap-2 mt-2">
                <button onClick={() => openModal('USER')} className="text-xs font-bold text-indigo-600 hover:underline">Add User</button>
                <span style={{ color: 'var(--text-faint)' }}>·</span>
                <button onClick={() => openModal('STAFF')} className="text-xs font-bold text-indigo-600 hover:underline">Add Staff</button>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr style={{ backgroundColor: 'var(--surface-raised)' }}>
                    {['User', 'Email', 'Role', 'Change Role', 'Actions'].map((h) => (
                      <th key={h} className="px-6 py-4 text-[11px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((user) => {
                    const locked = isLocked(user);
                    return (
                      <tr
                        key={user.id}
                        style={{ borderTop: '1px solid var(--surface-border)' }}
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
                        <td className="px-6 py-4"><Badge value={user.role} /></td>
                        <td className="px-6 py-4">
                          {locked ? (
                            <span className="locked-badge">
                              <span className="material-symbols-outlined text-sm">lock</span>
                              {user.seededAdmin ? 'Seeded' : 'You'}
                            </span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="relative w-32">
                                <select
                                  className="w-full appearance-none text-xs font-bold rounded-lg px-3 py-2 outline-none transition-colors"
                                  style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', border: '1px solid var(--input-border)' }}
                                  value={selectedRole[user.id] || user.role}
                                  onChange={(e) => setSelectedRole((prev) => ({ ...prev, [user.id]: e.target.value }))}
                                >
                                  <option value="USER">USER</option>
                                  <option value="STAFF">STAFF</option>
                                </select>
                                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-sm" style={{ color: 'var(--text-faint)' }}>expand_more</span>
                              </div>
                              <button
                                onClick={() => handleRoleUpdate(user.id)}
                                disabled={roleUpdating === user.id || selectedRole[user.id] === user.role}
                                className="p-1.5 rounded-lg transition-all disabled:opacity-40"
                                style={{ backgroundColor: 'var(--accent-indigo-soft)', color: '#4f46e5' }}
                                title="Save role"
                              >
                                <span className="material-symbols-outlined text-sm">
                                  {roleUpdating === user.id ? 'progress_activity' : 'save'}
                                </span>
                              </button>
                            </div>
                          )}
                          {rowMsg[user.id] && (
                            <p className={`text-[10px] font-bold mt-1 ${rowMsg[user.id].type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                              {rowMsg[user.id].text}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {!locked && (
                            <button
                              onClick={() => handleDelete(user)}
                              disabled={deleting === user.id}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                              style={{ border: '1px solid var(--surface-border)' }}
                            >
                              <span className="material-symbols-outlined text-sm">
                                {deleting === user.id ? 'progress_activity' : 'delete'}
                              </span>
                              {deleting === user.id ? 'Removing...' : 'Remove'}
                            </button>
                          )}
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
                const locked = isLocked(user);
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
                        <div className="relative flex-1">
                          <select
                            className="w-full appearance-none text-xs font-bold rounded-lg px-3 py-2 outline-none"
                            style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', border: '1px solid var(--input-border)' }}
                            value={selectedRole[user.id] || user.role}
                            onChange={(e) => setSelectedRole((prev) => ({ ...prev, [user.id]: e.target.value }))}
                          >
                            <option value="USER">USER</option>
                            <option value="STAFF">STAFF</option>
                          </select>
                        </div>
                        <button
                          onClick={() => handleRoleUpdate(user.id)}
                          disabled={roleUpdating === user.id || selectedRole[user.id] === user.role}
                          className="px-3 py-2 rounded-lg text-xs font-bold disabled:opacity-40"
                          style={{ backgroundColor: 'var(--accent-indigo-soft)', color: '#4f46e5' }}
                        >
                          Save
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          disabled={deleting === user.id}
                          className="px-3 py-2 rounded-lg text-xs font-bold text-red-600 disabled:opacity-50"
                          style={{ backgroundColor: 'var(--surface-raised)' }}
                        >
                          Remove
                        </button>
                      </div>
                    )}
                    {rowMsg[user.id] && (
                      <p className={`text-[10px] font-bold ${rowMsg[user.id].type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                        {rowMsg[user.id].text}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Create User/Staff Modal */}
      {modal && (
        <Modal
          title={modal === 'STAFF' ? 'Add Staff Member' : 'Add User'}
          onClose={() => setModal(null)}
        >
          <AlertMessage type="error"   message={formError} />
          <AlertMessage type="success" message={formSuccess} />

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-1.5">
              <label className="label-muted">Full Name</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] pointer-events-none" style={{ color: 'var(--text-faint)' }}>person</span>
                <input
                  className="field text-sm"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="e.g. Jane Smith"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="label-muted">Email Address</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] pointer-events-none" style={{ color: 'var(--text-faint)' }}>mail</span>
                <input
                  type="email"
                  className="field text-sm"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="jane@company.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="label-muted">Password</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] pointer-events-none" style={{ color: 'var(--text-faint)' }}>lock</span>
                <input
                  type={showPass ? 'text' : 'password'}
                  className="field text-sm"
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'var(--text-faint)' }}
                >
                  <span className="material-symbols-outlined text-[18px]">{showPass ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="label-muted">Role</label>
              <div className="flex gap-3 pt-1">
                {['USER', 'STAFF'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setModal(r)}
                    className="flex-1 py-2.5 rounded-lg text-sm font-bold transition-all border-2"
                    style={modal === r
                      ? { background: 'linear-gradient(135deg,#3525cd,#4f46e5)', color: '#fff', borderColor: '#3525cd' }
                      : { backgroundColor: 'var(--input-bg)', color: 'var(--text-secondary)', borderColor: 'var(--input-border)' }
                    }
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                style={{ border: '1px solid var(--surface-border)', color: 'var(--text-primary)', backgroundColor: 'transparent' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2.5 rounded-lg primary-gradient text-white text-sm font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting && <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>}
                {submitting ? 'Creating...' : `Create ${modal === 'STAFF' ? 'Staff' : 'User'}`}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </Layout>
  );
};

export default ManageUsers;
