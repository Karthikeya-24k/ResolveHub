import { NavLink } from 'react-router-dom';
import { getRole } from '../services/auth';

const links = {
  USER:  [
    { to: '/dashboard',     icon: 'dashboard',      label: 'Dashboard'     },
    { to: '/issues',        icon: 'list_alt',        label: 'My Issues'     },
    { to: '/issues/create', icon: 'add_circle',      label: 'Create Issue'  },
  ],
  STAFF: [
    { to: '/dashboard',     icon: 'dashboard',      label: 'Dashboard'     },
    { to: '/issues',        icon: 'list_alt',        label: 'My Issues'     },
    { to: '/issues/status', icon: 'sync_alt',        label: 'Update Status' },
  ],
  ADMIN: [
    { to: '/dashboard',     icon: 'dashboard',      label: 'Dashboard'     },
    { to: '/issues',        icon: 'list_alt',        label: 'All Issues'    },
    { to: '/issues/create', icon: 'add_circle',      label: 'Create Issue'  },
    { to: '/issues/assign', icon: 'assignment_ind',  label: 'Assign Issues' },
    { to: '/issues/status', icon: 'sync_alt',        label: 'Update Status' },
    { to: '/users',         icon: 'group',           label: 'Manage Users'  },
  ],
};

const Sidebar = () => {
  const role = getRole();
  const navLinks = links[role] || links.USER;

  return (
    <aside className="hidden md:flex flex-col h-screen w-64 bg-slate-50 p-4 gap-2 sticky top-0">
      <div className="mb-8 px-2 flex items-center gap-3">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <span className="material-symbols-outlined text-white text-lg">shield_person</span>
        </div>
        <div>
          <h2 className="text-lg font-black tracking-tighter text-indigo-600 leading-tight font-headline">
            Internal Portal
          </h2>
          <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">
            Issue Management
          </p>
        </div>
      </div>

      <nav className="flex-1 flex flex-col gap-1">
        {navLinks.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:bg-slate-200/50'
              }`
            }
          >
            <span className="material-symbols-outlined">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto border-t border-slate-200/50 pt-4">
        <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
          Role: {role}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
