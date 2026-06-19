import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createIssue } from "../services/api";
import Layout from "../components/Layout";
import AlertMessage from "../components/AlertMessage";

const CreateIssue = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", description: "", anonymous: false });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await createIssue(form);
      navigate("/issues");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to create issue. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl">
        <div className="mb-8">
          <p className="text-primary font-bold text-xs tracking-widest uppercase mb-1">
            New Complaint
          </p>
          <h2 className="text-3xl font-extrabold text-token-primary font-headline tracking-tight mb-1.5">
            Submit New Issue
          </h2>
          <p className="text-sm max-w-xl leading-relaxed text-token-muted">
            Help us improve by detailing your experience. Our team will review
            your report within 24 hours.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8">
            <div className="panel p-7">
              <AlertMessage type="error" message={error} />

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="label-muted">Issue Title</label>
                  <input
                    className="field text-sm"
                    placeholder="e.g., Delayed response on ticket #402"
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="label-muted">Description</label>
                  <textarea
                    className="field text-sm leading-relaxed resize-none"
                    rows={5}
                    placeholder="Describe the issue in detail, including steps to reproduce..."
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    required
                  />
                </div>

                {/* Anonymous toggle */}
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg transition-colors" style={{ backgroundColor: 'var(--surface-raised)' }}>
                  <div
                    className={`w-10 h-6 rounded-full transition-colors relative shrink-0 ${form.anonymous ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}
                    onClick={() => setForm({ ...form, anonymous: !form.anonymous })}
                  >
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.anonymous ? 'translate-x-5' : 'translate-x-1'}`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Submit Anonymously</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Admin will see "Anonymous User". Your identity is stored securely for audit.</p>
                  </div>
                </label>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="primary-gradient text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading ? "Submitting..." : "Submit Issue"}
                    {!loading && (
                      <span className="material-symbols-outlined text-sm">
                        send
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/issues")}
                    className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors panel-soft"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="panel-soft p-5">
              <div
                className="flex items-center gap-2 mb-4"
                style={{ color: "var(--text-secondary)" }}
              >
                <span className="material-symbols-outlined text-indigo-500 text-[20px]">
                  lightbulb
                </span>
                <h3 className="font-headline font-bold text-sm text-token-primary">
                  Writing a Great Complaint
                </h3>
              </div>

              <ul className="space-y-3">
                {[
                  [
                    "01",
                    "Be Specific:",
                    "Use exact dates, ticket numbers, or names involved.",
                  ],
                  [
                    "02",
                    "Focus on Facts:",
                    "Describe what happened objectively.",
                  ],
                  [
                    "03",
                    "Desired Outcome:",
                    "State what you consider a fair resolution.",
                  ],
                ].map(([num, title, desc]) => (
                  <li key={num} className="flex gap-3">
                    <span className="text-indigo-500 dark:text-indigo-300 font-bold text-xs mt-0.5 shrink-0">
                      {num}
                    </span>
                    <p className="text-xs leading-snug text-token-secondary">
                      <span className="font-semibold text-token-primary">
                        {title}
                      </span>{" "}
                      {desc}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="panel p-5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 style-accent-indigo">
                <span className="material-symbols-outlined text-[18px] text-indigo-600 dark:text-indigo-300">
                  support_agent
                </span>
              </div>

              <div>
                <h4 className="font-bold text-sm text-token-primary">
                  Need immediate help?
                </h4>
                <p className="text-xs mt-0.5 text-token-muted">
                  Contact live support for urgent matters.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CreateIssue;
