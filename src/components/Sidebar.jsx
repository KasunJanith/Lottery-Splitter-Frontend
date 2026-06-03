import { Link, useLocation } from 'react-router-dom';
import { HomeIcon, CloudArrowUpIcon, UsersIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: HomeIcon },
  { to: '/agents', label: 'Agents', icon: UsersIcon },
  { to: '/agent-summary', label: 'Agent Summary', icon: ClipboardDocumentListIcon },
  { to: '/', label: 'Upload', icon: CloudArrowUpIcon },
];

const Sidebar = () => {
  const location = useLocation();
  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-5 text-2xl font-bold border-b border-gray-700">
        🎲 DBF Splitter
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
              location.pathname === to
                ? 'bg-cyan-600 text-white shadow-lg'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <Icon className="h-5 w-5 mr-3" />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;