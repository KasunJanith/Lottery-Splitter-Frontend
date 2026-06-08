import { Outlet, Link, useLocation } from 'react-router-dom';
import { CalendarIcon, UsersIcon, ScissorsIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

const links = [
  { to: '/orders', label: 'Order Entry', icon: CalendarIcon },
  { to: '/assign', label: 'Assignment', icon: UsersIcon },
  { to: '/split', label: 'Split', icon: ScissorsIcon },
  { to: '/download', label: 'Download', icon: ArrowDownTrayIcon },
];

const Layout = () => {
  const location = useLocation();
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-5 text-2xl font-bold border-b border-gray-700">🎲 DBF Splitter</div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {links.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} className={`flex items-center px-4 py-3 rounded-lg transition ${location.pathname === to ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}>
              <Icon className="h-5 w-5 mr-3" />{label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 bg-gray-50 p-6"><Outlet /></main>
    </div>
  );
};
export default Layout;