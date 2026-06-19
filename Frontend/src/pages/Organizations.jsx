import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getOrganizations, createOrganization, updateOrgStatus,
  regenerateOrgApiKey, deleteOrganization,
} from '../services/api';
import Layout from '../components/Layout';
import AlertMessage from '../components/AlertMessage';

const EMPTY_FORM = { name: '', slug: '', contactEmail: '' };

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
    <div className="rounded-2xl shadow-2xl w-full max-w-lg p-8 relative" style={{ backgroundColor: 'var(--surface)' }}>
      <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg transition-colors"
        style={{ color: 'var(--text-muted)' }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface-raised)')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}>
        <span className="material-symbols-outlined">close</span>
      </button>
      <h3 className="font-headline font-bold text-lg mb-6" style={{ color: 'var(--text-primary)' }}>{title}</h3>
      {children}
    </div>
  </div>
);

/* Reusable API key widget — masked by default, reveal/copy buttons */
const ApiKeyWidget = ({ apiKey, canRegen, onRegen, busy }) => {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied]     = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 flex-wrap">
        <code
          className="text-xs font-mono px-2.5 py-1.5 rounded-lg flex-1 min-w-0 truncate"
          style={{ backgroundColor: 'var(--surface-raised)', color: revealed ? 'var(--text-primary)' : 'var(--text-faint)', border: '1px solid var(--surface-border)' }}
        >
          {revealed ? apiKey : '••••••••••••••••••••••••'}
        </code>
        <button
          onClick={() => setRevealed((v) => !v)}
          className="p-1.5 rounded-lg transition-colors shrink-0"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface-raised)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          title={revealed ? 'Hide key' : 'Reveal key'}
        >
          <span className="material-symbols-outlined text-sm">{revealed ? 'visibility_off' : 'visibility'}</span>
        </button>
        <button
          onClick={handleCopy}
          className="p-1.5 rounded-lg transition-colors shrink-0"
          style={{ color: copied ? '#16a34a' : 'var(--text-muted)' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface-raised)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          title="Copy key"
        >
          <span className="material-symbols-outlined text-sm">{copied ? 'check' : 'content_copy'}</span>
        </button>
        {canRegen && (
          <button
            onClick={onRegen}
            disabled={busy}
            className="p-1.5 rounded-lg transition-colors shrink-0 disabled:opacity-50"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface-raised)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            title="Regenerate key"
          >
            <span className={`material-symbols-outlined text-sm ${busy ? 'animate-spin' : ''}`}>refresh</span>
          </button>
        )}
      </div>
      <p className="text-[10px]" style={{ color: 'var(--text-faint)' }}>
        API Integration Key · Used for external portal login and trusted integrations
      </p>
    </div>
  );
};

const Organizations = () => {
  const navigate = useNavigate();
  const [orgs, setOrgs]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [search, setSearch]     = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError]   = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [busy, setBusy]         = useState(null);
  const [rowMsg, setRowMsg]     = useState({});

  useEffect(() => { fetchOrgs(); }, []);

  const fetchOrgs = () => {
    setLoading(true);
    getOrganizations()
      .then((res) => setOrgs(res.data.data || []))
      .catch(() => setError('Failed to load organizations.'))
      .finally(() => setLoading(false));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError(''); setFormSuccess('');
    setSubmitting(true);
    try {
      const res = await createOrganization(form);
      setOrgs((prev) => [...prev, res.data.data]);
      setFormSuccess('Organization created successfully!');
      setForm(EMPTY_FORM);
      setTimeout(() => { setShowModal(false); setFormSuccess(''); }, 1500);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create organization.');
    } finally { setSubmitting(false); }
  };

  const handleToggleStatus = async (org) => {
    setBusy(org.id);
    const newStatus = org.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const res = await updateOrgStatus(org.id, newStatus);
      setOrgs((prev) => prev.map((o) => (o.id === org.id ? res.data.data : o)));
      setRowMsg((prev) => ({ ...prev, [org.id]: { type: 'success', text: `Status: ${newStatus}` } }));
    } catch {
      setRowMsg((prev) => ({ ...prev, [org.id]: { type: 'error', text: 'Status update failed' } }));
    } finally { setBusy(null); }
  };

  const handleRegenerateKey = async (org) => {
    if (!window.confirm(`Regenerate API key for ${org.name}? The old key will stop working immediately.`)) return;
    setBusy(org.id);
    try {
      const res = await regenerateOrgApiKey(org.id);
      setOrgs((prev) => prev.map((o) => (o.id === org.id ? res.data.data : o)));
      setRowMsg((prev) => ({ ...prev, [org.id]: { type: 'success', text: 'API key regenerated' } }));
    } catch {
      setRowMsg((prev) => ({ ...prev, [org.id]: { type: 'error', text: 'Regeneration failed' } }));
    } finally { setBusy(null); }
  };

  const handleDelete = async (org) => {
    if (!window.confirm(`Delete ${org.name}? This cannot be undone.`)) return;
    setBusy(org.id);
    try {
      await deleteOrganization(org.id);
      setOrgs((prev) => prev.filter((o) => o.id !== org.id));
    } catch {
      setRowMsg((prev) => ({ ...prev, [org.id]: { type: 'error', text: 'Delete failed' } }));
      setBusy(null);
    }
  };

  const filtered = orgs.filter((o) => {
    const q = search.toLowerCase();
    return !q || o.name?.toLowerCase().includes(q) || o.slug?.toLowerCase().includes(q) ||
      o.adminName?.toLowerCase().includes(q) || o.adminEmail?.toLowerCase().includes(q);
  });

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-purple-600 font-bold text-xs tracking-widest uppercase mb-1">Super Admin</p>
          <h2 className="text-3xl font-extrabold tracking-tight font-headline" style={{ color: 'var(--text-primary)' }}>
            Organizations
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Manage all organizations, assigned admins, and integration keys.
          </p>
        </div>
        <button
          onClick={() => { setForm(EMPTY_FORM); setFormError(''); setFormSuccess(''); setShowModal(true); }}
          className="primary-gradient text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-all shadow-md shadow-primary/20 flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          New Organization
        </button>
      </div>

      <div className="rounded-xl ambient-shadow overflow-hidden" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
        <div className="px-5 py-4 flex gap-3" style={{ borderBottom: '1px solid var(--surface-border)' }}>
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] pointer-events-none" style={{ color: 'var(--text-faint)' }}>search</span>
            <input type="text" placeholder="Search by name, slug, or admin..." value={search}
              onChange={(e) => setSearch(e.target.value)} className="field text-sm" style={{ paddingLeft: '2.25rem' }} />
          </div>
          <span className="flex items-center text-xs font-bold px-2.5 py-1 rounded-full self-center"
            style={{ backgroundColor: 'var(--surface-raised)', color: 'var(--text-muted)' }}>
            {filtered.length} orgs
          </span>
        </div>

        <AlertMessage type="error" message={error} />

        {loading ? (
          <div className="flex items-center justify-center p-12 gap-3" style={{ color: 'var(--text-muted)' }}>
            <span className="material-symbols-outlined animate-spin">progress_activity</span>
            Loading organizations...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-14 gap-3" style={{ color: 'var(--text-muted)' }}>
            <span className="material-symbols-outlined text-5xl opacity-25">domain_disabled</span>
            <p className="text-sm font-medium">
              {orgs.length === 0 ? 'No organizations yet. Create your first one.' : 'No organizations match your search.'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop — card-per-org layout (table was too cramped with new columns) */}
            <div className="hidden md:block divide-y" style={{ borderColor: 'var(--surface-border)' }}>
              {filtered.map((org) => (
                <div key={org.id} className="p-6 space-y-4"
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-raised)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  {/* Row 1 — org identity + status + actions */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl primary-gradient flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {org.name[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{org.name}</p>
                        <code className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--surface-soft)', color: 'var(--text-faint)' }}>
                          {org.slug}
                        </code>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${org.status === 'ACTIVE' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                          {org.status}
                        </span>
                      </div>
                      {/* Assigned admin */}
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="material-symbols-outlined text-xs" style={{ color: 'var(--text-faint)' }}>manage_accounts</span>
                        {org.adminName ? (
                          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                            {org.adminName} <span style={{ color: 'var(--text-faint)' }}>· {org.adminEmail}</span>
                          </span>
                        ) : (
                          <span className="text-xs italic" style={{ color: 'var(--text-faint)' }}>No admin assigned</span>
                        )}
                      </div>
                    </div>
                    {/* Action buttons */}
                    <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                      <button
                        onClick={() => navigate(`/superadmin/audit/${org.id}`)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                        style={{ backgroundColor: 'var(--accent-indigo-soft)', color: '#4f46e5', border: '1px solid var(--surface-border)' }}
                      >
                        <span className="material-symbols-outlined text-sm">list_alt</span>
                        Issues
                      </button>
                      <button
                        onClick={() => handleToggleStatus(org)}
                        disabled={busy === org.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                        style={{ backgroundColor: 'var(--surface-raised)', color: 'var(--text-secondary)', border: '1px solid var(--surface-border)' }}
                      >
                        <span className="material-symbols-outlined text-sm">
                          {org.status === 'ACTIVE' ? 'pause' : 'play_arrow'}
                        </span>
                        {org.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDelete(org)}
                        disabled={busy === org.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        style={{ border: '1px solid var(--surface-border)' }}
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Row 2 — API key widget */}
                  <div className="pl-14">
                    <ApiKeyWidget
                      apiKey={org.apiKey}
                      canRegen={true}
                      onRegen={() => handleRegenerateKey(org)}
                      busy={busy === org.id}
                    />
                  </div>

                  {rowMsg[org.id] && (
                    <p className={`pl-14 text-[10px] font-bold ${rowMsg[org.id].type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                      {rowMsg[org.id].text}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y" style={{ borderColor: 'var(--surface-border)' }}>
              {filtered.map((org) => (
                <div key={org.id} className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg primary-gradient flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {org.name[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{org.name}</p>
                      <p className="text-xs truncate" style={{ color: 'var(--text-faint)' }}>
                        {org.adminName || 'No admin'} · {org.slug}
                      </p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${org.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                      {org.status}
                    </span>
                  </div>
                  <ApiKeyWidget
                    apiKey={org.apiKey}
                    canRegen={true}
                    onRegen={() => handleRegenerateKey(org)}
                    busy={busy === org.id}
                  />
                  <div className="flex gap-2">
                    <button onClick={() => handleToggleStatus(org)} disabled={busy === org.id}
                      className="flex-1 py-2 rounded-lg text-xs font-bold disabled:opacity-50"
                      style={{ backgroundColor: 'var(--accent-indigo-soft)', color: '#4f46e5' }}>
                      {org.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                    </button>
                    <button onClick={() => navigate(`/superadmin/audit/${org.id}`)}
                      className="flex-1 py-2 rounded-lg text-xs font-bold"
                      style={{ backgroundColor: 'var(--surface-raised)', color: 'var(--text-secondary)' }}>
                      Issues
                    </button>
                    <button onClick={() => handleDelete(org)} disabled={busy === org.id}
                      className="px-3 py-2 rounded-lg text-xs font-bold text-red-600 disabled:opacity-50"
                      style={{ backgroundColor: 'var(--surface-raised)' }}>
                      Delete
                    </button>
                  </div>
                  {rowMsg[org.id] && (
                    <p className={`text-[10px] font-bold ${rowMsg[org.id].type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                      {rowMsg[org.id].text}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <Modal title="Create Organization" onClose={() => setShowModal(false)}>
          <AlertMessage type="error"   message={formError} />
          <AlertMessage type="success" message={formSuccess} />
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-1.5">
              <label className="label-muted">Organization Name</label>
              <input className="field text-sm" placeholder="e.g. Acme Corporation"
                value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <label className="label-muted">Slug (URL-safe)</label>
              <input className="field text-sm" placeholder="e.g. acme-corp"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                required />
              <p className="text-[10px]" style={{ color: 'var(--text-faint)' }}>
                Public portal: /org/{form.slug || 'your-slug'}
              </p>
            </div>
            <div className="space-y-1.5">
              <label className="label-muted">Contact Email</label>
              <input type="email" className="field text-sm" placeholder="admin@company.com"
                value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                style={{ border: '1px solid var(--surface-border)', color: 'var(--text-primary)', backgroundColor: 'transparent' }}>
                Cancel
              </button>
              <button type="submit" disabled={submitting}
                className="flex-1 py-2.5 rounded-lg primary-gradient text-white text-sm font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {submitting && <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>}
                {submitting ? 'Creating...' : 'Create Organization'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </Layout>
  );
};

export default Organizations;
