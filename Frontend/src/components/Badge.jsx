const colors = {
  OPEN:         'bg-blue-100   text-blue-700   dark:bg-blue-900   dark:text-blue-300',
  UNDER_REVIEW: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  ASSIGNED:     'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300',
  IN_PROGRESS:  'bg-amber-100  text-amber-700  dark:bg-amber-900  dark:text-amber-300',
  RESOLVED:     'bg-green-100  text-green-700  dark:bg-green-900  dark:text-green-300',
  CLOSED:       'bg-slate-100  text-slate-600  dark:bg-slate-800  dark:text-slate-400',
  HIGH:         'bg-red-100    text-red-700    dark:bg-red-900    dark:text-red-300',
  MEDIUM:       'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  LOW:          'bg-green-100  text-green-700  dark:bg-green-900  dark:text-green-300',
  USER:         'bg-slate-100  text-slate-600  dark:bg-slate-800  dark:text-slate-300',
  STAFF:        'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  ADMIN:        'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300',
};

const Badge = ({ value }) => (
  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-tight ${colors[value] || 'bg-surface-container text-on-surface-variant'}`}>
    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
    {value?.replace('_', ' ')}
  </span>
);

export default Badge;
