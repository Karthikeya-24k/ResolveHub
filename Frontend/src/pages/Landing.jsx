import { useNavigate } from 'react-router-dom';
import useDarkMode from '../hooks/useDarkMode';

const features = [
  { icon: 'domain_add',     title: 'Apply & Onboard',     desc: 'Your organization submits a request. Super Admin reviews and provisions your dedicated workspace.' },
  { icon: 'assignment_ind', title: 'Assign & Delegate',   desc: 'Admins review incoming complaints and route them to the right staff member instantly.' },
  { icon: 'task_alt',       title: 'Resolve & Close',     desc: 'Staff update progress, add comments, and mark issues resolved with a full audit trail.' },
  { icon: 'bar_chart',      title: 'Monitor & Report',    desc: 'Role-specific dashboards give every stakeholder the visibility they need.' },
];

const useCases = [
  { icon: 'school',         label: 'Colleges & Universities' },
  { icon: 'apartment',      label: 'Apartments & Housing'    },
  { icon: 'business',       label: 'Offices & SMEs'          },
  { icon: 'local_hospital', label: 'Clinics & Services'      },
];

const onboardingSteps = [
  {
    icon: 'domain_add',
    color: 'bg-purple-500',
    actor: 'ORGANIZATION',
    action: 'Applies for access',
    detail: 'Fills the onboarding form with org details and admin contact.',
  },
  {
    icon: 'admin_panel_settings',
    color: 'bg-indigo-500',
    actor: 'SUPER ADMIN',
    action: 'Reviews & approves',
    detail: 'Provisions the org, creates admin account, generates API key.',
  },
  {
    icon: 'manage_accounts',
    color: 'bg-blue-500',
    actor: 'ADMIN',
    action: 'Sets up the workspace',
    detail: 'Logs in with temp credentials, adds staff and users.',
  },
  {
    icon: 'edit_note',
    color: 'bg-green-500',
    actor: 'USER',
    action: 'Submits complaints',
    detail: 'Raises issues via dashboard or the public portal.',
  },
];

const workflowSteps = [
  { icon: 'edit_note',       color: 'bg-green-500',  actor: 'USER',  action: 'Submits a complaint',         detail: 'Fills in title and description from their dashboard.' },
  { icon: 'manage_accounts', color: 'bg-indigo-500', actor: 'ADMIN', action: 'Reviews & assigns to Staff',  detail: 'Sets priority and delegates to the right team member.' },
  { icon: 'support_agent',   color: 'bg-amber-500',  actor: 'STAFF', action: 'Works on & resolves',         detail: 'Updates status, adds comments, marks resolved.' },
  { icon: 'track_changes',   color: 'bg-green-500',  actor: 'USER',  action: 'Tracks progress live',        detail: 'Sees every status change and comment on their issue.' },
];

const roles = [
  {
    role: 'Admin',
    icon: 'manage_accounts',
    color: 'text-indigo-600',
    ring: 'ring-indigo-200 dark:ring-indigo-800',
    bg: 'bg-indigo-50 dark:bg-indigo-900/20',
    perms: ['Create & manage users and staff', 'Assign complaints with priority', 'Monitor team workflow', 'Full dashboard visibility'],
  },
  {
    role: 'Staff',
    icon: 'support_agent',
    color: 'text-amber-600',
    ring: 'ring-amber-200 dark:ring-amber-800',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    perms: ['View assigned complaints only', 'Update complaint status', 'Add resolution comments', 'Track workload progress'],
  },
  {
    role: 'User',
    icon: 'person',
    color: 'text-green-600',
    ring: 'ring-green-200 dark:ring-green-800',
    bg: 'bg-green-50 dark:bg-green-900/20',
    perms: ['Submit complaints easily', 'Track own issues live', 'View status & comments', 'Get notified on updates'],
  },
];

const Landing = () => {
  const navigate = useNavigate();
  const [dark, toggleDark] = useDarkMode();

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg)', color: 'var(--text-primary)' }}>

      {/* ── Navbar ─────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-6 py-4"
        style={{ backgroundColor: 'var(--navbar-bg)', borderBottom: '1px solid var(--surface-border)', backdropFilter: 'blur(20px)' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg primary-gradient flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-white text-lg">shield_person</span>
          </div>
          <span className="font-headline font-black text-lg tracking-tight text-indigo-600">ResolveHub</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleDark}
            className="p-2 rounded-lg text-token-secondary hover:bg-token-raised transition-colors"
            title={dark ? 'Light mode' : 'Dark mode'}>
            <span className="material-symbols-outlined">{dark ? 'light_mode' : 'dark_mode'}</span>
          </button>
          <button onClick={() => navigate('/login')}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors hidden sm:block"
            style={{ backgroundColor: 'var(--surface-raised)', color: 'var(--text-primary)', border: '1px solid var(--surface-border)' }}>
            Sign In
          </button>
          <button onClick={() => navigate('/register')}
            className="primary-gradient text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-all shadow-md shadow-indigo-500/20 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm">domain_add</span>
            Apply for Access
          </button>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="flex flex-col items-center justify-center text-center px-6 pt-24 pb-20 relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full primary-gradient opacity-[0.04] blur-[120px] -z-10" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[30%] h-[30%] rounded-full bg-indigo-400 opacity-[0.04] blur-[100px] -z-10" />

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-8"
          style={{ backgroundColor: 'var(--accent-indigo-soft)', color: '#4f46e5' }}>
          <span className="material-symbols-outlined text-sm">verified</span>
          SaaS Helpdesk Platform · Multi-Organization
        </div>

        <h1 className="font-headline font-black text-5xl md:text-6xl lg:text-7xl tracking-tight leading-[1.08] max-w-4xl mb-5"
          style={{ color: 'var(--text-primary)' }}>
          Track.{' '}
          <span className="text-indigo-600">Assign.</span>{' '}
          Resolve.
        </h1>

        <p className="text-lg max-w-xl leading-relaxed mb-10" style={{ color: 'var(--text-muted)' }}>
          ResolveHub is a dedicated complaint management platform for organizations.
          Apply for access, get provisioned in minutes, and bring structure to every complaint.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 items-center mb-16">
          <button onClick={() => navigate('/register')}
            className="primary-gradient text-white px-8 py-3.5 rounded-xl font-bold text-base hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-indigo-500/25 flex items-center gap-2">
            <span className="material-symbols-outlined">domain_add</span>
            Apply for Your Organization
          </button>
          <button onClick={() => navigate('/login')}
            className="px-8 py-3.5 rounded-xl font-bold text-base transition-all flex items-center gap-2"
            style={{ backgroundColor: 'var(--surface-raised)', color: 'var(--text-primary)', border: '1px solid var(--surface-border)' }}>
            <span className="material-symbols-outlined">login</span>
            Sign In
          </button>
        </div>

        {/* Stats strip */}
        <div className="flex flex-wrap justify-center gap-x-10 gap-y-4 px-8 py-5 rounded-2xl"
          style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
          {[
            ['Multi-Org', 'Platform'],
            ['100%', 'JWT Secured'],
            ['Real-time', 'Notifications'],
            ['Public', 'Complaint Portal'],
          ].map(([val, label]) => (
            <div key={label} className="text-center">
              <p className="font-headline font-black text-xl text-indigo-600">{val}</p>
              <p className="text-[11px] font-bold uppercase tracking-widest mt-0.5" style={{ color: 'var(--text-faint)' }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How to Access ─────────────────────────────── */}
      <section className="px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-2">Get Started</p>
            <h2 className="font-headline font-extrabold text-3xl md:text-4xl tracking-tight" style={{ color: 'var(--text-primary)' }}>
              How to Access ResolveHub
            </h2>
            <p className="text-sm mt-3 max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>
              Whether you're an organization, a team member, or a member of the public — here's exactly where you start.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Card 1 — Already a member */}
            <div
              className="group relative rounded-2xl p-7 flex flex-col gap-5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl cursor-pointer"
              style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--surface-border)' }}
              onClick={() => navigate('/login')}
            >
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ boxShadow: '0 0 0 2px #4f46e5' }} />
              <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110">
                <span className="material-symbols-outlined text-indigo-600 text-2xl">login</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-headline font-bold text-base" style={{ color: 'var(--text-primary)' }}>Already a Member?</h3>
                  <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600">Staff / User</span>
                </div>
                <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--text-muted)' }}>
                  If your organization is already on ResolveHub, your admin has created an account for you. Check your email for credentials and sign in directly.
                </p>
                <ul className="space-y-2">
                  {['Your admin shares your login credentials', 'Change your password on first login', 'Access your role-based dashboard instantly'].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      <span className="material-symbols-outlined text-sm text-indigo-500 shrink-0 mt-0.5">check_circle</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); navigate('/login'); }}
                className="w-full py-2.5 rounded-xl primary-gradient text-white text-sm font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">login</span>
                Sign In Now
              </button>
            </div>

            {/* Card 2 — New Organization */}
            <div
              className="group relative rounded-2xl p-7 flex flex-col gap-5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl cursor-pointer"
              style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--surface-border)' }}
              onClick={() => navigate('/register')}
            >
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ boxShadow: '0 0 0 2px #4f46e5' }} />
              {/* Featured badge */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full primary-gradient text-white shadow-md shadow-indigo-500/30">
                  Most Common
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110">
                <span className="material-symbols-outlined text-purple-600 text-2xl">domain_add</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-headline font-bold text-base" style={{ color: 'var(--text-primary)' }}>New Organization?</h3>
                  <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-600">Admin</span>
                </div>
                <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--text-muted)' }}>
                  Apply for access on behalf of your organization. Once approved by our Super Admin, your workspace, admin account, and public complaint portal are auto-provisioned.
                </p>
                <ul className="space-y-2">
                  {[
                    'Fill the onboarding form — takes 2 minutes',
                    'Super Admin reviews & approves your request',
                    'Receive admin credentials + public portal URL',
                    'Add your staff & users, start managing complaints',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      <span className="material-symbols-outlined text-sm text-purple-500 shrink-0 mt-0.5">check_circle</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); navigate('/register'); }}
                className="w-full py-2.5 rounded-xl primary-gradient text-white text-sm font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">domain_add</span>
                Apply for Access
              </button>
            </div>

            {/* Card 3 — Public / Anonymous */}
            <div
              className="group relative rounded-2xl p-7 flex flex-col gap-5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
              style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--surface-border)' }}
            >
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ boxShadow: '0 0 0 2px #4f46e5' }} />
              <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-900/30 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110">
                <span className="material-symbols-outlined text-green-600 text-2xl">public</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-headline font-bold text-base" style={{ color: 'var(--text-primary)' }}>Public Complaint?</h3>
                  <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-900/30 text-green-600">No Login</span>
                </div>
                <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--text-muted)' }}>
                  No account needed. If your organization has a public portal, visit their unique link to submit a complaint — anonymously or with your name.
                </p>
                <ul className="space-y-2">
                  {[
                    'Visit your org\'s portal at /org/your-org-name',
                    'Submit with or without your name',
                    'Optionally add email to receive a tracking link',
                    'Track progress anytime via the magic link',
                    'Reopen if unsatisfied within 48 hours',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      <span className="material-symbols-outlined text-sm text-green-500 shrink-0 mt-0.5">check_circle</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                style={{ backgroundColor: 'var(--surface-raised)', color: 'var(--text-muted)', border: '1px solid var(--surface-border)' }}>
                <span className="material-symbols-outlined text-sm">link</span>
                Get the link from your organization
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Onboarding flow ────────────────────────────────────── */}
      <section className="px-6 py-20" style={{ backgroundColor: 'var(--surface-raised)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-2">How It Works</p>
            <h2 className="font-headline font-extrabold text-3xl md:text-4xl tracking-tight" style={{ color: 'var(--text-primary)' }}>
              From application to live helpdesk
            </h2>
            <p className="text-sm mt-3 max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>
              Organizations apply once. We provision everything. Your team is live in minutes.
            </p>
          </div>

          <div className="relative">
            <div className="hidden md:block absolute top-8 left-[calc(12.5%-1px)] right-[calc(12.5%-1px)] h-px" style={{ backgroundColor: 'var(--surface-border)' }} />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {onboardingSteps.map(({ icon, color, actor, action, detail }, i) => (
                <div key={i} className="flex flex-col items-center text-center relative">
                  <div className={`w-16 h-16 rounded-full ${color} flex items-center justify-center shadow-lg mb-4 relative z-10`}>
                    <span className="material-symbols-outlined text-white text-2xl">{icon}</span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: 'var(--text-faint)' }}>
                    Step {i + 1} · {actor}
                  </span>
                  <p className="font-headline font-bold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{action}</p>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{detail}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Apply CTA inline */}
          <div className="mt-12 text-center">
            <button onClick={() => navigate('/register')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl primary-gradient text-white font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-indigo-500/20">
              <span className="material-symbols-outlined text-sm">domain_add</span>
              Start Your Application
            </button>
          </div>
        </div>
      </section>

      {/* ── Complaint workflow ─────────────────────────────────── */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-2">The Complaint Workflow</p>
            <h2 className="font-headline font-extrabold text-3xl md:text-4xl tracking-tight" style={{ color: 'var(--text-primary)' }}>
              From complaint to resolution
            </h2>
            <p className="text-sm mt-3 max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>
              Every complaint follows a clear, accountable path — no more lost tickets or unclear ownership.
            </p>
          </div>

          <div className="relative">
            <div className="hidden md:block absolute top-8 left-[calc(12.5%-1px)] right-[calc(12.5%-1px)] h-px" style={{ backgroundColor: 'var(--surface-border)' }} />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {workflowSteps.map(({ icon, color, actor, action, detail }, i) => (
                <div key={i} className="flex flex-col items-center text-center relative">
                  <div className={`w-16 h-16 rounded-full ${color} flex items-center justify-center shadow-lg mb-4 relative z-10`}>
                    <span className="material-symbols-outlined text-white text-2xl">{icon}</span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: 'var(--text-faint)' }}>
                    Step {i + 1} · {actor}
                  </span>
                  <p className="font-headline font-bold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{action}</p>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────── */}
      <section className="px-6 py-20" style={{ backgroundColor: 'var(--surface-raised)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-2">Why ResolveHub</p>
            <h2 className="font-headline font-extrabold text-3xl md:text-4xl tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Everything your organization needs
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map(({ icon, title, desc }) => (
              <div key={title} className="rounded-2xl p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
                <div className="w-10 h-10 rounded-xl primary-gradient flex items-center justify-center mb-4 shadow-sm">
                  <span className="material-symbols-outlined text-white text-[20px]">{icon}</span>
                </div>
                <h3 className="font-headline font-bold text-base mb-2" style={{ color: 'var(--text-primary)' }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Roles ──────────────────────────────────────────────── */}
      <section className="px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-2">Role-Based Access</p>
            <h2 className="font-headline font-extrabold text-3xl tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Built for efficient operations
            </h2>
            <p className="text-sm mt-3 max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>
              Three operational roles, each with exactly the access they need — nothing more, nothing less.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
            {roles.map(({ role, icon, color, ring, bg, perms }) => (
              <div key={role}
                className={`rounded-2xl p-6 ring-1 ${ring} transition-all duration-200 hover:-translate-y-1 hover:shadow-lg`}
                style={{ backgroundColor: 'var(--surface)' }}>
                <div className="flex items-center gap-3 mb-5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>
                    <span className={`material-symbols-outlined ${color}`}>{icon}</span>
                  </div>
                  <span className={`font-headline font-black text-base ${color}`}>{role}</span>
                </div>
                <ul className="space-y-2.5">
                  {perms.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <span className="material-symbols-outlined text-sm text-indigo-500 mt-0.5 shrink-0">check_circle</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* SUPER_ADMIN note */}
          <div className="rounded-xl px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3"
            style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-purple-600 text-sm">admin_panel_settings</span>
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-purple-600">Super Admin</span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Platform-level control — approves organization applications, provisions admin accounts, manages all organizations, and monitors platform-wide activity.
            </p>
          </div>
        </div>
      </section>

      {/* ── Use cases ──────────────────────────────────────────── */}
      <section className="px-6 py-20" style={{ backgroundColor: 'var(--surface-raised)' }}>
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-2">Where it fits</p>
          <h2 className="font-headline font-extrabold text-3xl tracking-tight mb-4" style={{ color: 'var(--text-primary)' }}>
            A practical solution for any organisation
          </h2>
          <p className="text-sm max-w-lg mx-auto mb-12" style={{ color: 'var(--text-muted)' }}>
            Whether you're managing student grievances, tenant requests, or customer support — ResolveHub adapts to your workflow.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {useCases.map(({ icon, label }) => (
              <div key={label}
                className="rounded-2xl p-6 flex flex-col items-center gap-3 transition-all duration-200 hover:-translate-y-1"
                style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
                <div className="w-12 h-12 rounded-xl primary-gradient flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-white text-2xl">{icon}</span>
                </div>
                <p className="text-xs font-bold text-center leading-snug" style={{ color: 'var(--text-secondary)' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────── */}
      <section className="px-6 py-16">
        <div className="max-w-2xl mx-auto text-center rounded-2xl p-10 primary-gradient shadow-2xl shadow-indigo-500/20">
          <h2 className="font-headline font-black text-3xl text-white mb-3">
            Ready to onboard your organization?
          </h2>
          <p className="text-indigo-200 mb-8 text-sm leading-relaxed">
            Submit your application today. Once approved, your admin account and workspace are provisioned automatically — no setup overhead.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => navigate('/register')}
              className="bg-white text-indigo-700 px-8 py-3 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-all shadow-md flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-sm">domain_add</span>
              Apply for Access
            </button>
            <button onClick={() => navigate('/login')}
              className="bg-white/10 text-white border border-white/30 px-8 py-3 rounded-xl font-bold text-sm hover:bg-white/20 transition-all flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-sm">login</span>
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="px-6 py-8" style={{ borderTop: '1px solid var(--surface-border)' }}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded primary-gradient flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-sm">shield_person</span>
            </div>
            <span className="font-headline font-black text-sm text-indigo-600">ResolveHub</span>
          </div>
          <p className="text-xs text-center sm:text-right" style={{ color: 'var(--text-faint)' }}>
            Multi-Organization Helpdesk Platform · Built with Spring Boot &amp; React · JWT Secured
          </p>
        </div>
      </footer>

    </div>
  );
};

export default Landing;
