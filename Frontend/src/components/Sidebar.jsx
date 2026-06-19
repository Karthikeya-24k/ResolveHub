import { NavLink } from 'react-router-dom';
import { getRole } from '../services/auth';

const links = {
  USER:  [
    { to: '/dashboard',           icon: 'dashboard',         label: 'Dashboard'     },
    { to: '/issues',              icon: 'list_alt',           label: 'My Issues'     },
    { to: '/issues/create',       icon: 'add_circle',         label: 'Create Issue'  },
  ],
  STAFF: [
    { to: '/dashboard',           icon: 'dashboard',         label: 'Dashboard'     },
    { to: '/issues',              icon: 'list_alt',           label: 'My Issues'     },
    { to: '/issues/status',       icon: 'sync_alt',           label: 'Update Status' },
  ],
  ADMIN: [
    { to: '/dashboard',              icon: 'dashboard',         label: 'Dashboard'          },
    { to: '/issues',                 icon: 'list_alt',           label: 'All Issues'         },
    { to: '/issues/create',          icon: 'add_circle',         label: 'Create Issue'       },
    { to: '/issues/assign',          icon: 'assignment_ind',     label: 'Assign Issues'      },
    { to: '/issues/status',          icon: 'sync_alt',           label: 'Update Status'      },
    { to: '/users',                  icon: 'group',              label: 'Manage Users'       },
    { to: '/admin/organization',     icon: 'settings',           label: 'Org Settings'       },
  ],
  SUPER_ADMIN: [
    { to: '/superadmin/dashboard',     icon: 'admin_panel_settings', label: 'SA Dashboard'      },
    { to: '/superadmin/applications',  icon: 'pending_actions',      label: 'Applications'      },
    { to: '/superadmin/admins',        icon: 'manage_accounts',      label: 'Manage Admins'     },
    { to: '/superadmin/organizations', icon: 'domain',               label: 'Organizations'     },
  ],
};

const SidebarContent = ({ role, onClose }) => {
  const navLinks = links[role] || links.USER;
  return (
    <>
      {/* Logo */}
      <div className="mb-8 px-2 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 primary-gradient shadow-sm">
          <span className="material-symbols-outlined text-white text-lg">shield_person</span>
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-black tracking-tighter leading-tight font-headline text-indigo-600 truncate">ResolveHub</h2>
          <p className="text-[10px] font-bold tracking-widest uppercase text-token-muted">Issue Tracker</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-token-muted hover:bg-token-raised shrink-0 min-w-[36px] min-h-[36px] flex items-center justify-center"
            aria-label="Close menu"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-1 overflow-y-auto">
        {navLinks.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `sidebar-link flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive ? 'active' : ''}`
            }
          >
            <span className="material-symbols-outlined shrink-0">{icon}</span>
            <span className="truncate">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="mt-auto pt-4" style={{ borderTop: '1px solid var(--surface-border)' }}>
        <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-token-faint">Role: {role}</p>
      </div>
    </>
  );
};

const Sidebar = ({ open, onClose }) => {
  const role = getRole();

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex flex-col h-screen w-64 p-4 gap-2 sticky top-0 shrink-0"
        style={{ borderRight: '1px solid var(--surface-border)', backgroundColor: 'var(--surface)' }}
      >
        <SidebarContent role={role} />
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          {/* Drawer */}
          <aside
            className="relative flex flex-col w-72 max-w-[85vw] h-full p-4 gap-2 z-10 overflow-y-auto"
            style={{ backgroundColor: 'var(--surface)', borderRight: '1px solid var(--surface-border)' }}
          >
            <SidebarContent role={role} onClose={onClose} />
          </aside>
        </div>
      )}
    </>
  );
};

export default Sidebar;
