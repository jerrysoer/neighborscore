import { NavLink, Outlet } from 'react-router-dom';
import { Building2, Map, GitCompare, BookOpen, Home } from 'lucide-react';

const navItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/report', label: 'Report', icon: Building2 },
  { to: '/compare', label: 'Compare', icon: GitCompare },
  { to: '/map', label: 'Map', icon: Map },
  { to: '/methodology', label: 'Methodology', icon: BookOpen },
] as const;

export function Layout() {
  return (
    <div className="min-h-screen bg-bg font-body text-text">
      <nav className="border-b border-gray-200 bg-surface">
        <div className="mx-auto flex max-w-5xl items-center gap-1 overflow-x-auto px-4 py-3">
          <span className="mr-4 font-display text-lg font-bold text-civic-blue">
            NeighborScore
          </span>
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors ${
                  isActive
                    ? 'bg-civic-blue/10 font-medium text-civic-blue'
                    : 'text-text-muted hover:text-text'
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
      <footer className="border-t border-gray-200 py-4 text-center text-sm text-text-muted">
        by{' '}
        <a
          href="https://github.com/jerrysoer/neighborscore"
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-text-muted/40 underline-offset-2 transition-colors hover:text-civic-blue"
        >
          jerrysoer
        </a>
      </footer>
    </div>
  );
}
