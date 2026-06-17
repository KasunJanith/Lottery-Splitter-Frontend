import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import {
  HomeIcon,
  CalendarIcon,
  UsersIcon,
  CloudArrowUpIcon,
  ScissorsIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';

const menuItems = [
  { to: '/orders', label: 'Order Entry', icon: CalendarIcon },
  { to: '/assign', label: 'Assignment', icon: UsersIcon },
  { to: '/upload', label: 'Upload', icon: CloudArrowUpIcon },
  { to: '/split', label: 'Split', icon: ScissorsIcon },
  { to: '/download', label: 'Download', icon: ArrowDownTrayIcon },
];

const Layout = () => {
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(true);

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-5 text-2xl font-bold border-b border-gray-700">
          DBF Splitter
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {/* Overview Tab */}
          <Link
            to="/overview"
            className={`flex items-center px-4 py-3 rounded-lg transition ${
              location.pathname === '/overview' || location.pathname === '/'
                ? 'bg-cyan-600 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <HomeIcon className="h-5 w-5 mr-3" />
            Overview
          </Link>

          {/* Dropdown heading */}
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center justify-between w-full px-4 py-3 text-left text-gray-300 hover:bg-gray-800 rounded-lg transition mt-2"
          >
            <span className="font-semibold">Upload File Splitter</span>
            {dropdownOpen ? (
              <ChevronDownIcon className="h-4 w-4" />
            ) : (
              <ChevronRightIcon className="h-4 w-4" />
            )}
          </button>

          {/* Dropdown items */}
          {dropdownOpen && (
            <div className="ml-2 space-y-1 border-l border-gray-700 pl-4">
              {menuItems.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center px-3 py-2 rounded-lg transition ${
                    location.pathname === to
                      ? 'bg-cyan-600 text-white'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  <span className="text-sm">{label}</span>
                </Link>
              ))}
            </div>
          )}
        </nav>
      </aside>
      <main className="flex-1 bg-gray-50 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;