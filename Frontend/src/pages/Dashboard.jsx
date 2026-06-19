import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getAllIssues } from "../services/api";
import { getRole } from "../services/auth";
import Layout from "../components/Layout";
import AlertMessage from "../components/AlertMessage";
import { useSearchContext } from "../context/SearchContext";

const STATUS_COLOR = {
  OPEN: "bg-blue-100  text-blue-700  dark:bg-blue-900  dark:text-blue-300",
  UNDER_REVIEW:
    "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  ASSIGNED:
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300",
  IN_PROGRESS:
    "bg-amber-100 text-amber-700  dark:bg-amber-900  dark:text-amber-300",
  RESOLVED:
    "bg-green-100 text-green-700  dark:bg-green-900  dark:text-green-300",
  CLOSED: "bg-slate-100 text-slate-600  dark:bg-slate-800  dark:text-slate-400",
};

const PRIORITY_COLOR = {
  HIGH: "bg-red-100   text-red-700   dark:bg-red-900   dark:text-red-300",
  MEDIUM:
    "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  LOW: "bg-slate-100 text-slate-500  dark:bg-slate-800  dark:text-slate-400",
};

const CARD_THEMES = {
  indigo: {
    card:  'bg-white border-gray-200 shadow-sm dark:bg-indigo-950/40 dark:border-indigo-800/50',
    strip: 'bg-indigo-500 dark:bg-indigo-400',
    icon:  'bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100 dark:bg-indigo-900/60 dark:text-indigo-300',
    label: 'text-gray-500 font-semibold dark:text-indigo-300',
    value: 'text-gray-900 font-extrabold dark:text-indigo-300',
    badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-indigo-900/50 dark:text-emerald-300 dark:border-indigo-700/50',
  },

  blue: {
    card:  'bg-white border-gray-200 shadow-sm dark:bg-blue-950/40 dark:border-blue-800/50',
    strip: 'bg-blue-500 dark:bg-blue-400',
    icon:  'bg-blue-50 text-blue-600 ring-1 ring-blue-100 dark:bg-blue-900/60 dark:text-blue-300',
    label: 'text-gray-500 font-semibold dark:text-blue-300',
    value: 'text-gray-900 font-extrabold dark:text-blue-300',
    badge: '',
  },

  amber: {
    card:  'bg-white border-gray-200 shadow-sm dark:bg-amber-950/40 dark:border-amber-800/50',
    strip: 'bg-amber-500 dark:bg-amber-400',
    icon:  'bg-amber-50 text-amber-600 ring-1 ring-amber-100 dark:bg-amber-900/60 dark:text-amber-300',
    label: 'text-gray-500 font-semibold dark:text-amber-300',
    value: 'text-gray-900 font-extrabold dark:text-amber-300',
    badge: '',
  },

  green: {
    card:  'bg-white border-gray-200 shadow-sm dark:bg-emerald-950/40 dark:border-emerald-800/50',
    strip: 'bg-emerald-500 dark:bg-emerald-400',
    icon:  'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100 dark:bg-emerald-900/60 dark:text-emerald-300',
    label: 'text-gray-500 font-semibold dark:text-emerald-300',
    value: 'text-gray-900 font-extrabold dark:text-emerald-300',
    badge: '',
  },
};
const MetricCard = ({ icon, label, value, theme = "indigo", badge }) => {
  const t = CARD_THEMES[theme];
  return (
    <div
      className={`rounded-2xl border overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${t.card}`}
    >
      <div className={`h-1 w-full ${t.strip}`} />
      <div className="p-6">
        <div className="flex justify-between items-start mb-5">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${t.icon}`}
          >
            <span className="material-symbols-outlined text-[20px]">
              {icon}
            </span>
          </div>
          {badge && (
            <span
              className={`text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${t.badge}`}
            >
              <span className="material-symbols-outlined text-[13px]">
                trending_up
              </span>
              {badge}
            </span>
          )}
        </div>
        <p
          className={`text-[11px] font-bold tracking-widest uppercase ${t.label}`}
        >
          {label}
        </p>
        <p
          className={`text-4xl font-black mt-1.5 leading-none tracking-tight ${t.value}`}
        >
          {value}
        </p>
      </div>
    </div>
  );
};
const Dashboard = () => {
  const [issues, setIssues] = useState([]);
  const [error, setError] = useState("");
  const [showSupport, setShowSupport] = useState(false);
  const [supportForm, setSupportForm]   = useState({ subject: '', message: '' });
  const [supportSent, setSupportSent]   = useState(false);
  const navigate = useNavigate();
  const role = getRole();
  const { query } = useSearchContext();

  const [debouncedQuery, setDebouncedQuery] = useState(query);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  const visibleIssues = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return issues;
    return issues.filter(
      (i) =>
        String(i.id).includes(q) ||
        i.title?.toLowerCase().includes(q) ||
        i.status?.toLowerCase().includes(q) ||
        i.priority?.toLowerCase().includes(q) ||
        i.createdBy?.toLowerCase().includes(q) ||
        i.assignedTo?.toLowerCase().includes(q),
    );
  }, [issues, debouncedQuery]);

  useEffect(() => {
    getAllIssues()
      .then((res) => setIssues(res.data))
      .catch(() => setError("Failed to load issues."));
  }, []);

  const count = (key, val) => issues.filter((i) => i[key] === val).length;

  const STATUS_PRIORITY = useMemo(
    () => ({ OPEN: 0, UNDER_REVIEW: 1, ASSIGNED: 2, IN_PROGRESS: 3, RESOLVED: 4, CLOSED: 5 }),
    []
  );

  // Sort: CLOSED last, then by ID descending (most recently created/updated first)
  const recentIssues = useMemo(() => {
    const base = debouncedQuery ? visibleIssues : [...issues];
    return [...base].sort((a, b) => {
      const pa = STATUS_PRIORITY[a.status] ?? 3;
      const pb = STATUS_PRIORITY[b.status] ?? 3;
      if (pa !== pb) return pa - pb;
      return b.id - a.id;
    }).slice(0, 5);
  }, [issues, visibleIssues, debouncedQuery, STATUS_PRIORITY]);

  const handleSupportSend = (e) => {
    e.preventDefault();
    if (!supportForm.subject.trim() || !supportForm.message.trim()) return;
    setSupportSent(true);
    setTimeout(() => {
      setShowSupport(false);
      setSupportSent(false);
      setSupportForm({ subject: '', message: '' });
    }, 2000);
  };

  const exportCSV = () => {
    if (!issues.length) return;
    const headers = [
      "ID",
      "Title",
      "Status",
      "Priority",
      "Created By",
      "Assigned To",
    ];
    const rows = issues.map((i) => [
      i.id,
      `"${(i.title || "").replace(/"/g, '""')}"`,
      i.status || "",
      i.priority || "",
      i.createdBy || "",
      i.assignedTo || "",
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `issues-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
        <div>
          <p className="text-primary font-bold text-xs tracking-widest uppercase mb-1">System Overview</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight font-headline">Dashboard</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={exportCSV}
            disabled={!issues.length}
            className="flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: 'var(--surface-raised)', color: 'var(--text-primary)', border: '1px solid var(--surface-border)' }}
          >
            <span className="material-symbols-outlined text-sm">download</span>
            Export
          </button>
          {(role === 'USER' || role === 'ADMIN') && (
            <button
              onClick={() => navigate('/issues/create')}
              className="flex-1 sm:flex-none primary-gradient text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              New Issue
            </button>
          )}
        </div>
      </div>

      <AlertMessage type="error" message={error} />

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <MetricCard
          icon="analytics"
          theme="indigo"
          label="Total Issues"
          value={issues.length}
        />
        <MetricCard
          icon="drafts"
          theme="blue"
          label="Open Issues"
          value={count("status", "OPEN")}
        />
        <MetricCard
          icon="sync_alt"
          theme="amber"
          label="In Progress"
          value={count("status", "IN_PROGRESS")}
        />
        <MetricCard
          icon="check_circle"
          theme="green"
          label="Resolved"
          value={count("status", "RESOLVED")}
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Issues */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl p-4 sm:p-6 md:p-8 ambient-shadow">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold tracking-tight font-headline">
              Recent Issues
            </h3>
            <button
              onClick={() => navigate("/issues")}
              className="text-primary text-sm font-semibold hover:underline"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {recentIssues.length === 0 ? (
              <p className="text-sm text-on-surface-variant">
                {debouncedQuery
                  ? `No matching issues for "${debouncedQuery}".`
                  : "No issues found."}
              </p>
            ) : (
              recentIssues.map((issue) => (
                <div
                  key={issue.id}
                  onClick={() => navigate(`/issues/${issue.id}`)}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer border border-transparent hover:border-outline-variant/20"
                >
                  <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-primary text-sm">bug_report</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-on-surface truncate">{issue.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>
                      #{issue.id}{issue.assignedTo ? ` · ${issue.assignedTo}` : ''}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLOR[issue.status] || 'bg-slate-100 text-slate-600'}`}>
                        {issue.status || 'OPEN'}
                      </span>
                      {issue.priority && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${PRIORITY_COLOR[issue.priority] || 'bg-slate-100 text-slate-500'}`}>
                          {issue.priority}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions + Activity */}
        <div className="lg:col-span-1 space-y-6">
          {/* Quick Actions */}
          <div className="bg-surface-container-lowest rounded-xl p-6 ambient-shadow">
            <h3 className="text-lg font-bold tracking-tight mb-4 font-headline">
              Quick Actions
            </h3>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => navigate("/issues/create")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg primary-gradient text-white font-semibold text-sm shadow shadow-primary/20 hover:opacity-90 transition-all"
              >
                <span className="material-symbols-outlined text-sm">
                  add_circle
                </span>
                Create Issue
              </button>
              <button
                onClick={() => navigate("/issues")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-sm transition-colors"
                style={{
                  backgroundColor: "var(--surface-raised)",
                  color: "var(--text-primary)",
                }}
              >
                <span className="material-symbols-outlined text-sm text-primary">
                  list_alt
                </span>
                View My Issues
              </button>
              {role === "STAFF" && (
                <button
                  onClick={() => navigate("/issues/status")}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-sm transition-colors"
                  style={{
                    backgroundColor: "var(--surface-raised)",
                    color: "var(--text-primary)",
                  }}
                >
                  <span className="material-symbols-outlined text-sm text-amber-500">
                    sync_alt
                  </span>
                  Update Status
                </button>
              )}
              {role === "ADMIN" && (
                <button
                  onClick={() => navigate("/issues/assign")}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-sm transition-colors"
                  style={{
                    backgroundColor: "var(--surface-raised)",
                    color: "var(--text-primary)",
                  }}
                >
                  <span className="material-symbols-outlined text-sm text-indigo-500">
                    assignment_ind
                  </span>
                  Assign Issues
                </button>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-surface-container-lowest rounded-xl p-6 ambient-shadow">
            <h3 className="text-lg font-bold tracking-tight mb-4 font-headline">
              Recent Activity
            </h3>
            <div className="space-y-3">
              {visibleIssues.length === 0 ? (
                <p className="text-sm text-slate-400">No recent activity.</p>
              ) : (
                visibleIssues.slice(0, 4).map((issue) => (
                  <div key={issue.id} className="flex items-start gap-3">
                    <span
                      className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                        issue.status === "RESOLVED"
                          ? "bg-green-500"
                          : issue.status === "IN_PROGRESS"
                            ? "bg-amber-500"
                            : issue.status === "OPEN"
                              ? "bg-blue-500"
                              : "bg-slate-400"
                      }`}
                    />
                    <div className="min-w-0">
                      <p
                        className="text-xs font-semibold truncate"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {issue.title}
                      </p>
                      <p
                        className="text-[11px]"
                        style={{ color: "var(--text-faint)" }}
                      >
                        {issue.status}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Support Modal */}
      {showSupport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div
            className="rounded-2xl shadow-2xl w-full max-w-md p-8 relative"
            style={{ backgroundColor: "var(--surface)" }}
          >
            <button
              onClick={() => { setShowSupport(false); setSupportSent(false); setSupportForm({ subject: '', message: '' }); }}
              className="absolute top-4 right-4 p-1.5 rounded-lg transition-colors"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--surface-raised)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-300">support_agent</span>
              </div>
              <div>
                <h3 className="font-headline font-bold" style={{ color: "var(--text-primary)" }}>Contact Support</h3>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>We typically respond within 1 hour</p>
              </div>
            </div>

            {supportSent ? (
              <div className="flex flex-col items-center py-8 gap-3">
                <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                  <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-3xl">check_circle</span>
                </div>
                <p className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>Message sent!</p>
                <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>Our team will get back to you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSupportSend} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Subject</label>
                  <input
                    className="field text-sm"
                    placeholder="Briefly describe your issue..."
                    value={supportForm.subject}
                    onChange={(e) => setSupportForm({ ...supportForm, subject: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Message</label>
                  <textarea
                    rows={4}
                    className="field text-sm resize-none"
                    placeholder="Describe the problem in detail..."
                    value={supportForm.message}
                    onChange={(e) => setSupportForm({ ...supportForm, message: e.target.value })}
                    required
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setShowSupport(false); setSupportForm({ subject: '', message: '' }); }}
                    className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                    style={{ border: "1px solid var(--surface-border)", color: "var(--text-primary)", backgroundColor: "transparent" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-lg primary-gradient text-white text-sm font-bold hover:opacity-90 transition-all"
                  >
                    Send Message
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Bottom Bento */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        <div className="md:col-span-2 lg:col-span-3 bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10 ambient-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold tracking-tight font-headline">
              Need technical assistance?
            </h3>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
              Our support team is available 24/7 for internal system
              emergencies.
            </p>
          </div>
          <button
            onClick={() => setShowSupport(true)}
            className="bg-slate-900 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-slate-800 transition-all shrink-0 w-full sm:w-auto"
          >
            Contact Support
          </button>
        </div>
        <div className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/10 ambient-shadow flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-black text-indigo-600">98%</span>
          <p
            className="text-[10px] uppercase tracking-widest font-bold mt-2"
            style={{ color: "var(--text-faint)" }}
          >
            SLA Compliance
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
