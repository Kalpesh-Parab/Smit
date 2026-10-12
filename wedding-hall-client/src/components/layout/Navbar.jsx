import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileSpreadsheet, Tags, LogOut } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('hall_token');
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-amber-600 text-white'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  return (
    <header className='no-print bg-white border-b border-slate-200 sticky top-0 z-40'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between h-16'>
          {/* Logo / Brand */}
          <div className='flex items-center gap-3'>
            <div className='w-9 h-9 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-lg shadow-sm'>
              WH
            </div>
            <div>
              <h1 className='text-base font-bold text-slate-900 leading-tight'>
                Smit Wedding Hall
              </h1>
              <p className='text-xs text-slate-500'>Billing & Management</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className='flex items-center gap-2'>
            <NavLink to='/dashboard' className={navLinkClass}>
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to='/invoices/new' className={navLinkClass}>
              <FileSpreadsheet size={18} />
              <span>Create Invoice</span>
            </NavLink>
            <NavLink to='/categories' className={navLinkClass}>
              <Tags size={18} />
              <span>Categories</span>
            </NavLink>
          </nav>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className='inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-rose-600 hover:bg-rose-50 transition-colors'
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
