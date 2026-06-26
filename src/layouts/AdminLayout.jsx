import { Outlet } from 'react-router-dom';
import Sidebar from '../components/sidebar/Sidebar';

function AdminLayout() {
  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 bg-slate-50 dark:bg-slate-950">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
