import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/api';

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm]       = useState({ name: '', email: '', password: '' });
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      setSuccess('Account created! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const field = (label, icon, type, key, placeholder) => (
    <div className="space-y-2">
      <label className="font-label text-[0.6875rem] font-semibold uppercase tracking-widest text-on-surface-variant ml-1">{label}</label>
      <div className="relative group">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline group-focus-within:text-primary transition-colors">{icon}</span>
        <input
          className="w-full pl-12 pr-4 py-3.5 bg-surface-container-highest border-none rounded-lg focus:ring-0 outline-none border-b-2 border-transparent focus:border-primary transition-all text-on-surface placeholder:text-outline"
          type={type} placeholder={placeholder}
          value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} required
        />
      </div>
    </div>
  );

  return (
    <div className="bg-surface-container-low font-body text-on-surface min-h-screen flex items-center justify-center p-6">
      <main className="w-full max-w-[440px]">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl primary-gradient mb-6 ambient-shadow">
            <span className="material-symbols-outlined text-white text-3xl">person_add</span>
          </div>
          <h1 className="font-headline font-extrabold text-4xl tracking-tight text-primary">Create Account</h1>
          <p className="text-on-surface-variant mt-2 font-medium">Join the complaint system</p>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-8 ambient-shadow border border-outline-variant/10">
          {error && (
            <div className="flex items-start gap-3 p-4 mb-6 rounded-lg bg-error-container text-on-error-container text-sm">
              <span className="material-symbols-outlined text-[1.25rem]">error</span>
              <p>{error}</p>
            </div>
          )}
          {success && (
            <div className="flex items-start gap-3 p-4 mb-6 rounded-lg bg-green-50 text-green-800 text-sm">
              <span className="material-symbols-outlined text-[1.25rem]">check_circle</span>
              <p>{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {field('Full Name',  'person', 'text',     'name',     'John Doe')}
            {field('Email',      'mail',   'email',    'email',    'name@company.com')}
            {field('Password',   'lock',   'password', 'password', '••••••••')}
            <button
              type="submit" disabled={loading}
              className="w-full primary-gradient text-white py-4 px-6 rounded-lg font-semibold text-base hover:opacity-90 active:scale-[0.98] transition-all ambient-shadow flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Register'}
              {!loading && <span className="material-symbols-outlined text-[1.25rem]">how_to_reg</span>}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-on-surface-variant text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Register;
