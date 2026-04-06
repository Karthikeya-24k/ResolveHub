import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/api';
import { saveToken } from '../services/auth';
import AlertMessage from '../components/AlertMessage';

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(form);
      saveToken(res.data.data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface-container-low font-body text-on-surface min-h-screen flex items-center justify-center p-6">
      <main className="w-full max-w-[440px]">
        {/* Branding */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl primary-gradient mb-6 ambient-shadow">
            <span className="material-symbols-outlined text-white text-3xl">forum</span>
          </div>
          <h1 className="font-headline font-extrabold text-4xl tracking-tight text-primary">
            ResolveHub
          </h1>
          <p className="text-on-surface-variant mt-2 font-medium">Issue resolution, refined.</p>
        </div>

        {/* Card */}
        <div className="bg-surface-container-lowest rounded-xl p-8 ambient-shadow border border-outline-variant/10">
          <AlertMessage type="error" message={error} />

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="font-label text-[0.6875rem] font-semibold uppercase tracking-widest text-on-surface-variant ml-1">
                Email Address
              </label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline group-focus-within:text-primary transition-colors">mail</span>
                <input
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-lg focus:border-slate-900 focus:ring-0 outline-none transition-all text-on-surface placeholder:text-slate-300"
                  type="email" placeholder="name@company.com"
                  value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-label text-[0.6875rem] font-semibold uppercase tracking-widest text-on-surface-variant ml-1">
                Password
              </label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline group-focus-within:text-primary transition-colors">lock</span>
                <input
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-lg focus:border-slate-900 focus:ring-0 outline-none transition-all text-on-surface placeholder:text-slate-300"
                  type="password" placeholder="••••••••"
                  value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required
                />
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full primary-gradient text-white py-4 px-6 rounded-lg font-semibold text-base hover:opacity-90 active:scale-[0.98] transition-all ambient-shadow flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Login'}
              {!loading && <span className="material-symbols-outlined text-[1.25rem]">login</span>}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-on-surface-variant text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary font-semibold hover:underline transition-all">Register</Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 grid grid-cols-3 gap-4">
          <div className="h-[1px] bg-outline-variant/30 self-center" />
          <p className="text-center font-label text-[0.625rem] font-bold uppercase tracking-widest text-outline">Trusted by Teams</p>
          <div className="h-[1px] bg-outline-variant/30 self-center" />
        </div>
        <div className="mt-6 flex justify-center items-center gap-8 opacity-40 grayscale">
          {[['shield','SECURE'],['bolt','FAST'],['verified','ENTERPRISE']].map(([icon, label]) => (
            <div key={label} className="flex items-center gap-2">
              <span className="material-symbols-outlined">{icon}</span>
              <span className="text-xs font-bold font-headline tracking-tighter">{label}</span>
            </div>
          ))}
        </div>
      </main>

      <div className="fixed top-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full primary-gradient opacity-[0.03] blur-[120px] -z-10" />
      <div className="fixed bottom-[-5%] left-[-5%] w-[30%] h-[30%] bg-secondary opacity-[0.03] blur-[100px] -z-10" />
    </div>
  );
};

export default Login;
