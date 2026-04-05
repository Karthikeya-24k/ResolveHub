import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getIssueById, addComment, getCommentsByIssue } from '../services/api';
import Layout from '../components/Layout';
import Badge from '../components/Badge';

const IssueDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [issue, setIssue]         = useState(null);
  const [comments, setComments]   = useState([]);
  const [message, setMessage]     = useState('');
  const [loading, setLoading]     = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState('');
  const [commentError, setCommentError] = useState('');

  useEffect(() => {
    Promise.all([getIssueById(id), getCommentsByIssue(id)])
      .then(([issueRes, commentsRes]) => {
        setIssue(issueRes.data.data);
        setComments(commentsRes.data);
      })
      .catch(() => setError('Failed to load issue.'))
      .finally(() => setLoading(false));
  }, [id]);

  const fetchComments = () => {
    getCommentsByIssue(id).then((res) => setComments(res.data));
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setCommentError('');
    setSubmitting(true);
    try {
      await addComment({ issueId: Number(id), message });
      setMessage('');
      fetchComments();
    } catch (err) {
      setCommentError(err.response?.data?.message || 'Failed to post comment.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center p-12 gap-3 text-on-surface-variant">
        <span className="material-symbols-outlined animate-spin">progress_activity</span>
        Loading issue...
      </div>
    </Layout>
  );

  if (error || !issue) return (
    <Layout>
      <div className="flex items-center gap-3 p-4 rounded-lg bg-error-container text-on-error-container text-sm">
        <span className="material-symbols-outlined">error</span>
        {error || 'Issue not found.'}
      </div>
    </Layout>
  );

  return (
    <Layout>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 mb-8 text-xs font-label uppercase tracking-widest text-slate-500">
        <button onClick={() => navigate('/issues')} className="hover:text-primary transition-colors">Issues</button>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <span className="text-on-surface">#{issue.id}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-10">
          {/* Header */}
          <section className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Badge value={issue.status || 'OPEN'} />
              {issue.priority && <Badge value={issue.priority} />}
              <span className="text-xs text-slate-500 ml-auto">Issue #{issue.id}</span>
            </div>
            <h2 className="text-4xl font-extrabold tracking-tight text-on-surface leading-tight font-headline">
              {issue.title}
            </h2>
          </section>

          {/* Description */}
          <section className="bg-surface-container-lowest p-8 rounded-xl ambient-shadow">
            <h3 className="text-xs font-label uppercase tracking-widest text-slate-500 mb-4">Description</h3>
            <p className="text-on-surface-variant font-body leading-relaxed">{issue.description}</p>
          </section>

          {/* Comments */}
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-outline-variant/15 pb-4">
              <h3 className="text-xl font-bold font-headline">Activity & Comments</h3>
              <span className="text-sm font-medium bg-surface-container-high px-2 py-0.5 rounded">{comments.length}</span>
            </div>

            <div className="space-y-4">
              {comments.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-on-surface-variant">
                  <span className="material-symbols-outlined text-4xl mb-2 opacity-30">chat_bubble</span>
                  <p className="text-sm">No comments yet. Be the first to comment.</p>
                </div>
              ) : (
                comments.map((c, i) => (
                  <div key={c.id || i} className="flex gap-4 group">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined">person</span>
                    </div>
                    <div className="flex-1 bg-surface-container-low p-5 rounded-lg group-hover:bg-surface-container transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-sm text-on-surface">{c.userName}</span>
                      </div>
                      <p className="text-sm text-on-surface-variant leading-relaxed">{c.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Comment Input */}
            <div className="mt-8 bg-white p-6 rounded-xl ambient-shadow border-2 border-indigo-100">
              <label className="block text-xs font-label uppercase tracking-widest text-slate-500 mb-3">Add a Comment</label>
              {commentError && (
                <div className="flex items-center gap-2 p-3 mb-3 rounded-lg bg-error-container text-on-error-container text-xs">
                  <span className="material-symbols-outlined text-sm">error</span>
                  {commentError}
                </div>
              )}
              <form onSubmit={handleComment}>
                <textarea
                  className="w-full bg-surface-container-lowest border-none rounded-lg focus:ring-2 focus:ring-primary outline-none p-4 text-sm resize-none transition-all duration-200"
                  placeholder="Share your findings or ask a question..."
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <div className="flex justify-end mt-4">
                  <button
                    type="submit" disabled={submitting || !message.trim()}
                    className="primary-gradient text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:opacity-90 active:scale-95 transition-all shadow-md disabled:opacity-50 flex items-center gap-2"
                  >
                    {submitting ? 'Posting...' : 'Post Comment'}
                    {!submitting && <span className="material-symbols-outlined text-sm">send</span>}
                  </button>
                </div>
              </form>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-surface-container-low p-6 rounded-xl space-y-3">
            <h3 className="text-xs font-label uppercase tracking-widest text-slate-500 mb-4">Quick Actions</h3>
            <button
              onClick={() => navigate('/issues')}
              className="w-full flex items-center gap-3 px-4 py-3 bg-white text-on-surface rounded-lg font-bold text-sm shadow-sm hover:bg-slate-50 transition-colors"
            >
              <span className="material-symbols-outlined text-indigo-600">arrow_back</span>
              Back to Issues
            </button>
            <button
              onClick={() => navigate('/issues/status')}
              className="w-full flex items-center gap-3 px-4 py-3 bg-white text-on-surface rounded-lg font-bold text-sm shadow-sm hover:bg-slate-50 transition-colors"
            >
              <span className="material-symbols-outlined text-indigo-600">sync_alt</span>
              Update Status
            </button>
          </div>

          <div className="bg-surface-container-lowest p-6 rounded-xl ambient-shadow border border-outline-variant/10">
            <h3 className="text-xs font-label uppercase tracking-widest text-slate-500 mb-4">Issue Details</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Status</span>
                <Badge value={issue.status || 'OPEN'} />
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Priority</span>
                <Badge value={issue.priority || 'LOW'} />
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Issue ID</span>
                <span className="font-bold text-on-surface">#{issue.id}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default IssueDetail;
