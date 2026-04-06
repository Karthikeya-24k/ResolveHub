import { useNavigate } from 'react-router-dom';
import { getEmail, getRole, removeToken } from '../services/auth';
import useDarkMode from '../hooks/useDarkMode';

const Navbar = () => {
  const navigate = useNavigate();
  const email = getEmail();
  const role  = getRole();
  const [dark, toggleDark] = useDarkMode();

  const logout = () => {
    removeToken();
    navigate('/login');
  };

  return (
    <header className="flex justify-between items-center px-6 py-3 w-full sticky top-0 z-50">
      {/* Left */}
      <div className="flex items-center gap-4 flex-1">
        <h1 className="text-xl font-bold font-headline text-token-primary">ResolveHub</h1>
        <div className="relative w-full max-w-md ml-4 hidden sm:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg text-token-faint">
            search
          </span>
          <input
            className="field pl-10"
            placeholder="Search issues, IDs or users..."
            type="text"
            readOnly
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1">
        <button
          onClick={toggleDark}
          title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="p-2 rounded-lg transition-colors text-token-secondary hover:bg-token-raised"
        >
          <span className="material-symbols-outlined">{dark ? 'light_mode' : 'dark_mode'}</span>
        </button>

        <button className="p-2 rounded-lg transition-colors text-token-secondary hover:bg-token-raised">
          <span className="material-symbols-outlined">notifications</span>
        </button>

        <div className="h-8 w-px mx-2 border-token" style={{ backgroundColor: 'var(--surface-border)' }} />

        <div className="flex items-center gap-3 pl-2">
          <div className="hidden lg:block text-right">
            <p className="text-sm font-bold leading-none text-token-primary">{email}</p>
            <p className="text-[10px] uppercase font-semibold mt-1 text-token-muted">{role}</p>
          </div>
          <span className="material-symbols-outlined text-indigo-500 text-3xl">account_circle</span>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors text-token-secondary hover:bg-token-raised"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
