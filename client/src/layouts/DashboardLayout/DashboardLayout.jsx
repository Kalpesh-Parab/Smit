import { Outlet } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Sidebar from '../../components/Sidebar/Sidebar';
import './DashboardLayout.scss';

export default function DashboardLayout() {
  return (
    <div className='dashboard-container'>
      <Navbar />
      <div className='dashboard-body'>
        <Sidebar />
        <main className='dashboard-content'>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
