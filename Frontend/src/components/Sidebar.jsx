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
    <aside className="hidden md:flex flex-col h-screen w-64 p-4 gap-2 sticky top-0">
      {/* Logo */}
      <div className="mb-8 px-2 flex items-center gap-3">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-white text-lg">shield_person</span>
        </div>
        <div>
          <h2 className="text-lg font-black tracking-tighter leading-tight font-headline text-indigo-600">
            ResolveHub
          </h2>
          <p className="text-[10px] font-bold tracking-widest uppercase text-token-muted">
            Issue Tracker
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-1">
        {navLinks.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sidebar-link flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${isActive ? 'active' : ''}`
            }
          >
            <span className="material-symbols-outlined">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="mt-auto pt-4 border-token" style={{ borderTop: '1px solid var(--surface-border)' }}>
        <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-token-faint">
          Role: {role}
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
