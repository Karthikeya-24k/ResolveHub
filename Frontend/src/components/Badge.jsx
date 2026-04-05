const colors = {
  OPEN:         'bg-blue-50 text-blue-700',
  UNDER_REVIEW: 'bg-secondary-fixed text-on-secondary-container',
  ASSIGNED:     'bg-primary-fixed text-on-primary-fixed-variant',
  IN_PROGRESS:  'bg-amber-50 text-amber-700',
  RESOLVED:     'bg-green-50 text-green-700',
  CLOSED:       'bg-surface-container-high text-on-surface-variant',
  HIGH:         'bg-error-container text-on-error-container',
  MEDIUM:       'bg-tertiary-fixed text-on-tertiary-fixed-variant',
  LOW:          'bg-green-50 text-green-700',
  USER:         'bg-surface-container text-on-surface-variant',
  STAFF:        'bg-secondary-fixed text-on-secondary-container',
  ADMIN:        'bg-primary-fixed text-on-primary-fixed-variant',
};

const Badge = ({ value }) => (
  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-tight ${colors[value] || 'bg-surface-container text-on-surface-variant'}`}>
    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
    {value?.replace('_', ' ')}
  </span>
);

export default Badge;
