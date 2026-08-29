import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function Layout() {
  return (
    <div className="layout">
      <Sidebar />
      <Topbar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
