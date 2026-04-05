import { useNavigate } from 'react-router-dom';
import { getEmail, getRole, removeToken } from '../services/auth';

const Navbar = () => {
  const navigate = useNavigate();
  const email = getEmail();
  const role  = getRole();

  const logout = () => {
    removeToken();
    navigate('/login');
  };

  return (
    <header className="flex justify-between items-center px-6 py-3 w-full sticky top-0 bg-white/80 backdrop-blur-xl z-50 shadow-sm">
      <div className="flex items-center gap-4 flex-1">
        <h1 className="text-xl font-bold text-slate-900 font-headline">Complain System</h1>
        <div className="relative w-full max-w-md ml-4 hidden sm:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
          <input
            className="w-full bg-slate-100/50 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
            placeholder="Search issues, IDs or users..."
            type="text"
            readOnly
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors relative">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <div className="h-8 w-[1px] bg-slate-200 mx-2" />
        <div className="flex items-center gap-3 pl-2">
          <div className="hidden lg:block text-right">
            <p className="text-sm font-bold text-slate-900 leading-none">{email}</p>
            <p className="text-[10px] text-slate-500 uppercase font-semibold mt-1">{role}</p>
          </div>
          <span className="material-symbols-outlined text-indigo-600 text-3xl">account_circle</span>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
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
