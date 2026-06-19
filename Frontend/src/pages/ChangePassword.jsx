import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { changePassword } from '../services/api';
import Layout from '../components/Layout';

// Defined outside component so it is never recreated on re-render
const PasswordField = ({ label, value, onChange, show, onToggle, placeholder }) => (
  <div className="space-y-1.5">
    <label className="label-muted">{label}</label>
    <div className="relative">
      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] pointer-events-none"
        style={{ color: 'var(--text-faint)' }}>lock</span>
      <input
        type={show ? 'text' : 'password'}
        className="field text-sm"
        style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
      />
      <button type="button" onClick={onToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
        style={{ color: 'var(--text-faint)' }}>
        <span className="material-symbols-outlined text-[18px]">
          {show ? 'visibility_off' : 'visibility'}
        </span>
      </button>
    </div>
  </div>
);

const ChangePassword = () => {
  const navigate = useNavigate();
  const [form, setForm]               = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [success, setSuccess]         = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.newPassword !== form.confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    if (form.newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (form.currentPassword === form.newPassword) {
      setError('New password must be different from your current password.');
      return;
    }

    setLoading(true);
    try {
      await changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const strength = Math.min(4, Math.floor(form.newPassword.length / 3));
  const strengthLabel = form.newPassword.length < 6 ? 'Too short'
    : form.newPassword.length < 9  ? 'Weak'
    : form.newPassword.length < 12 ? 'Good' : 'Strong';
  const strengthColor = strength <= 1 ? '#ef4444' : strength <= 2 ? '#f59e0b' : strength <= 3 ? '#3b82f6' : '#22c55e';

  return (
    <Layout>
      <div className="max-w-md">
        <div className="mb-8">
          <p className="text-primary font-bold text-xs tracking-widest uppercase mb-1">Account</p>
          <h2 className="text-3xl font-extrabold tracking-tight font-headline" style={{ color: 'var(--text-primary)' }}>
            Change Password
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Update your account password. You will remain logged in after changing it.
          </p>
        </div>

        <div className="rounded-2xl p-8 ambient-shadow"
          style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--surface-border)' }}>

          {success ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-3xl">check_circle</span>
              </div>
              <h3 className="font-headline font-bold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>
                Password Changed!
              </h3>
              <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                Your password has been updated successfully.
              </p>
              <button onClick={() => navigate(-1)}
                className="px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                style={{ backgroundColor: 'var(--surface-raised)', color: 'var(--text-primary)', border: '1px solid var(--surface-border)' }}>
                Go Back
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg text-sm text-red-600 bg-red-50 dark:bg-red-900/20">
                  <span className="material-symbols-outlined text-sm">error</span>
                  {error}
                </div>
              )}

              <PasswordField
                label="Current Password"
                value={form.currentPassword}
                onChange={(e) => setForm((f) => ({ ...f, currentPassword: e.target.value }))}
                show={showCurrent}
                onToggle={() => setShowCurrent((v) => !v)}
                placeholder="Enter your current password"
              />

              <div style={{ borderTop: '1px solid var(--surface-border)' }} />

              <PasswordField
                label="New Password"
                value={form.newPassword}
                onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))}
                show={showNew}
                onToggle={() => setShowNew((v) => !v)}
                placeholder="Min. 6 characters"
              />

              <PasswordField
                label="Confirm New Password"
                value={form.confirmPassword}
                onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                show={showConfirm}
                onToggle={() => setShowConfirm((v) => !v)}
                placeholder="Repeat new password"
              />

              {/* Password strength bar */}
              {form.newPassword.length > 0 && (
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4].map((level) => (
                    <div key={level} className="h-1 flex-1 rounded-full transition-colors"
                      style={{ backgroundColor: level <= strength ? strengthColor : 'var(--surface-border)' }} />
                  ))}
                  <span className="text-[10px] font-bold shrink-0" style={{ color: 'var(--text-faint)' }}>
                    {strengthLabel}
                  </span>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => navigate(-1)}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                  style={{ border: '1px solid var(--surface-border)', color: 'var(--text-primary)', backgroundColor: 'transparent' }}>
                  Cancel
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 py-2.5 rounded-lg primary-gradient text-white text-sm font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading && <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>}
                  {loading ? 'Saving...' : 'Change Password'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ChangePassword;
