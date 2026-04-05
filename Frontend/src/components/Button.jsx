const variants = {
  primary: 'primary-gradient text-white shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98]',
  danger:  'bg-error-container text-on-error-container hover:bg-error hover:text-white',
  ghost:   'bg-surface-container-high text-on-surface hover:bg-surface-container-highest',
  success: 'bg-green-600 hover:bg-green-700 text-white',
  outline: 'border border-outline-variant text-on-surface hover:bg-surface-container-low',
};

const Button = ({ children, variant = 'primary', className = '', ...props }) => (
  <button
    className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    {...props}
  >
    {children}
  </button>
);

export default Button;
