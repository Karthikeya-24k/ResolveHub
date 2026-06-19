import { useEffect, useState } from 'react';
import { getMyOrganization } from '../services/api';
import Layout from '../components/Layout';

const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={handle}
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all"
      style={{ backgroundColor: copied ? 'var(--accent-indigo-soft)' : 'var(--surface-raised)', color: copied ? '#4f46e5' : 'var(--text-muted)', border: '1px solid var(--surface-border)' }}
    >
      <span className="material-symbols-outlined text-sm">{copied ? 'check' : 'content_copy'}</span>
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
};

const InfoRow = ({ label, value, children }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-4" style={{ borderBottom: '1px solid var(--surface-border)' }}>
    <div>
      <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{label}</p>
      {value && <p className="text-sm font-semibold mt-0.5" style={{ color: 'var(--text-primary)' }}>{value}</p>}
    </div>
    {children}
  </div>
);

const AdminOrgSettings = () => {
  const [org, setOrg]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    getMyOrganization()
      .then((res) => setOrg(res.data.data))
      .catch(() => setError('Failed to load organization settings.'))
      .finally(() => setLoading(false));
  }, []);

  const portalUrl = org ? `${window.location.origin}/org/${org.slug}` : '';

  return (
    <Layout>
      <div className="mb-8">
        <p className="text-primary font-bold text-xs tracking-widest uppercase mb-1">Admin Panel</p>
        <h2 className="text-3xl font-extrabold tracking-tight font-headline" style={{ color: 'var(--text-primary)' }}>
          Organization Settings
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Your organization details and integration configuration.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12 gap-3" style={{ color: 'var(--text-muted)' }}>
          <span className="material-symbols-outlined animate-spin">progress_activity</span>
          Loading...
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 p-4 rounded-lg text-sm text-red-600 bg-red-50 dark:bg-red-900/20">
          <span className="material-symbols-outlined text-sm">error</span>
          {error}
        </div>
      ) : org && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Main settings card */}
          <div className="lg:col-span-2 rounded-xl ambient-shadow" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
            <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--surface-border)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl primary-gradient flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {org.name[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-bold" style={{ color: 'var(--text-primary)' }}>{org.name}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${org.status === 'ACTIVE' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : 'bg-slate-100 text-slate-600'}`}>
                    {org.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="px-6">
              <InfoRow label="Organization Name" value={org.name} />
              <InfoRow label="Slug" value={org.slug} />
              <InfoRow label="Contact Email" value={org.contactEmail || '—'} />

              <InfoRow label="Public Complaint Portal">
                <div className="flex items-center gap-2 flex-wrap">
                  <code className="text-xs font-mono px-2 py-1 rounded" style={{ backgroundColor: 'var(--surface-raised)', color: 'var(--text-secondary)' }}>
                    {portalUrl}
                  </code>
                  <CopyButton text={portalUrl} />
                  <a href={portalUrl} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline">
                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                    Open
                  </a>
                </div>
              </InfoRow>

              {/* API Key section */}
              <div className="py-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                      API Integration Key
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>
                      Used for external portal login and trusted integrations. Keep this secret.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap mt-3">
                  <code
                    className="text-xs font-mono px-3 py-2 rounded-lg flex-1 min-w-0"
                    style={{ backgroundColor: 'var(--surface-raised)', color: revealed ? 'var(--text-primary)' : 'var(--text-faint)', border: '1px solid var(--surface-border)' }}
                  >
                    {revealed ? org.apiKey : '••••••••••••••••••••••••••••••••'}
                  </code>
                  <button
                    onClick={() => setRevealed((v) => !v)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all"
                    style={{ backgroundColor: 'var(--surface-raised)', color: 'var(--text-secondary)', border: '1px solid var(--surface-border)' }}
                  >
                    <span className="material-symbols-outlined text-sm">{revealed ? 'visibility_off' : 'visibility'}</span>
                    {revealed ? 'Hide' : 'Reveal'}
                  </button>
                  <CopyButton text={org.apiKey} />
                </div>
                <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--accent-indigo-soft)' }}>
                  <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                    🔒 Only you and the Super Admin can see this key. Never share it publicly.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Integration instructions */}
          <div className="space-y-4">
            <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-indigo-500 text-sm">integration_instructions</span>
                <h3 className="text-sm font-bold font-headline" style={{ color: 'var(--text-primary)' }}>Integration Guide</h3>
              </div>
              <div className="space-y-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                <div className="space-y-1">
                  <p className="font-bold" style={{ color: 'var(--text-primary)' }}>1. External Portal Login</p>
                  <p>Send a POST request to:</p>
                  <code className="block px-2 py-1.5 rounded text-[10px] font-mono" style={{ backgroundColor: 'var(--surface-raised)', color: 'var(--text-primary)' }}>
                    POST /organizations/auth/external
                  </code>
                  <p>With header:</p>
                  <code className="block px-2 py-1.5 rounded text-[10px] font-mono" style={{ backgroundColor: 'var(--surface-raised)', color: 'var(--text-primary)' }}>
                    X-Org-Api-Key: {'<your-api-key>'}
                  </code>
                </div>
                <div className="space-y-1">
                  <p className="font-bold" style={{ color: 'var(--text-primary)' }}>2. Request Body</p>
                  <code className="block px-2 py-1.5 rounded text-[10px] font-mono whitespace-pre" style={{ backgroundColor: 'var(--surface-raised)', color: 'var(--text-primary)' }}>
{`{
  "name": "User Name",
  "email": "user@org.com",
  "externalId": "EMP001",
  "department": "IT"
}`}
                  </code>
                </div>
                <div className="space-y-1">
                  <p className="font-bold" style={{ color: 'var(--text-primary)' }}>3. Public Portal</p>
                  <p>Share your portal URL with users to let them submit complaints without logging in.</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--surface-raised)', border: '1px solid var(--surface-border)' }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-amber-500 text-sm">warning</span>
                <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Security Notice</p>
              </div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                If you suspect your API key has been compromised, contact your Super Admin to regenerate it immediately.
              </p>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AdminOrgSettings;
