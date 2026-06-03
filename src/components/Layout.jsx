import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => (
  <div className="flex min-h-screen">
    <Sidebar />
    <main className="flex-1 bg-gray-50 p-6">
      <Outlet />
    </main>
  </div>
);

export default Layout;