import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createIssue } from '../services/api';
import Layout from '../components/Layout';

const CreateIssue = () => {
  const navigate = useNavigate();
  const [form, setForm]       = useState({ title: '', description: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await createIssue(form);
      navigate('/issues');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create issue. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="mb-10">
        <p className="text-primary font-bold text-xs tracking-widest uppercase mb-1">New Complaint</p>
        <h2 className="text-4xl font-extrabold text-on-surface font-headline tracking-tight mb-2">Submit New Issue</h2>
        <p className="text-on-surface-variant max-w-2xl leading-relaxed">
          Help us improve by detailing your experience. Our team will review your report within 24 hours.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form */}
        <div className="lg:col-span-8">
          <div className="bg-surface-container-lowest rounded-xl p-8 ambient-shadow">
            {error && (
              <div className="flex items-start gap-3 p-4 mb-6 rounded-lg bg-error-container text-on-error-container text-sm">
                <span className="material-symbols-outlined text-[1.25rem]">error</span>
                <p>{error}</p>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-widest text-slate-500 font-bold">Issue Title</label>
                <input
                  className="w-full bg-surface-container-highest border-0 border-b-2 border-transparent focus:border-primary focus:ring-0 outline-none transition-all py-4 px-0 text-lg font-medium placeholder:text-slate-300"
                  placeholder="e.g., Delayed response on ticket #402"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-widest text-slate-500 font-bold">Description</label>
                <textarea
                  className="w-full bg-surface-container-highest border-0 border-b-2 border-transparent focus:border-primary focus:ring-0 outline-none transition-all py-4 px-0 text-base leading-relaxed placeholder:text-slate-300 resize-none"
                  rows={8}
                  placeholder="Please provide as much detail as possible, including steps to reproduce the issue..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                />
              </div>
              <div className="flex items-center gap-4 pt-4">
                <button
                  type="submit" disabled={loading}
                  className="primary-gradient text-white px-8 py-3 rounded-lg font-semibold shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? 'Submitting...' : 'Submit Issue'}
                  {!loading && <span className="material-symbols-outlined text-sm">send</span>}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/issues')}
                  className="bg-surface-container-high text-on-surface px-8 py-3 rounded-lg font-semibold hover:bg-surface-container-highest transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Guidelines */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-indigo-50/50 rounded-xl p-6 border border-indigo-100/50">
            <div className="flex items-center gap-3 mb-4 text-indigo-600">
              <span className="material-symbols-outlined">lightbulb</span>
              <h3 className="font-headline font-bold">Writing a Great Complaint</h3>
            </div>
            <ul className="space-y-4">
              {[
                ['01', 'Be Specific:', 'Use exact dates, ticket numbers, or names involved to help us track the history.'],
                ['02', 'Focus on Facts:', 'Describe what happened objectively before adding your personal feedback.'],
                ['03', 'Desired Outcome:', 'Clearly state what you would consider a fair resolution to this issue.'],
              ].map(([num, title, desc]) => (
                <li key={num} className="flex gap-3">
                  <span className="text-indigo-400 font-bold text-sm">{num}</span>
                  <p className="text-sm text-slate-600 leading-snug">
                    <span className="font-semibold text-slate-900">{title}</span> {desc}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-6 bg-white rounded-xl ambient-shadow flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-fixed rounded-full flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">support_agent</span>
            </div>
            <div>
              <h4 className="font-bold text-sm">Need immediate help?</h4>
              <p className="text-xs text-slate-500 mt-0.5">Contact live support for urgent matters.</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CreateIssue;
