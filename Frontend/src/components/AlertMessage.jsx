const STYLES = {
  error:   'bg-red-50   text-red-700   dark:bg-red-950   dark:text-red-300',
  success: 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300',
  warning: 'bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
};

const ICONS = {
  error:   'error',
  success: 'check_circle',
  warning: 'warning',
};

const AlertMessage = ({ type = 'error', message }) => {
  if (!message) return null;
  return (
    <div className={`flex items-center gap-2 p-3 mb-4 rounded-lg text-sm ${STYLES[type]}`}>
      <span className="material-symbols-outlined text-base">{ICONS[type]}</span>
      {message}
    </div>
  );
};

export default AlertMessage;
