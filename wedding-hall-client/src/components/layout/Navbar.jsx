import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileSpreadsheet,
  Tags,
  LogOut,
  Menu,
  X,
  PlusCircle,
} from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('hall_token');
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
      isActive
        ? 'bg-amber-600 text-white shadow-sm'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  const mobileNavLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all ${
      isActive
        ? 'bg-amber-600 text-white shadow-sm'
        : 'text-slate-700 hover:bg-slate-100'
    }`;

  const bottomTabClass = ({ isActive }) =>
    `flex flex-col items-center justify-center flex-1 py-1.5 text-[11px] font-medium transition-colors ${
      isActive
        ? 'text-amber-600 font-semibold'
        : 'text-slate-500 hover:text-slate-800'
    }`;

  return (
    <>
      {/* Top Navbar */}
      <header className='no-print bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between h-16'>
            {/* Brand Logo & Name */}
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-500 text-white flex items-center justify-center font-bold text-lg shadow-sm'>
                WH
              </div>
              <div className='leading-tight'>
                <h1 className='text-base sm:text-lg font-bold text-slate-900 tracking-tight'>
                  Smit Wedding Hall
                </h1>
                <p className='text-[11px] text-slate-500 font-medium'>
                  Billing & Admin Desk
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className='hidden md:flex items-center gap-1.5'>
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

            {/* Desktop Logout Button */}
            <div className='hidden md:flex items-center'>
              <button
                onClick={handleLogout}
                className='inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition'
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>

            {/* Mobile Hamburger Button */}
            <div className='flex md:hidden items-center gap-1'>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className='p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition'
                aria-label='Toggle menu'
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Slide-down Drawer */}
        {mobileMenuOpen && (
          <div className='md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2 shadow-lg animate-in slide-in-from-top-2 duration-200'>
            <NavLink
              to='/dashboard'
              onClick={() => setMobileMenuOpen(false)}
              className={mobileNavLinkClass}
            >
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink
              to='/invoices/new'
              onClick={() => setMobileMenuOpen(false)}
              className={mobileNavLinkClass}
            >
              <PlusCircle size={20} />
              <span>Create New Invoice</span>
            </NavLink>
            <NavLink
              to='/categories'
              onClick={() => setMobileMenuOpen(false)}
              className={mobileNavLinkClass}
            >
              <Tags size={20} />
              <span>Pricing & Categories</span>
            </NavLink>

            <div className='pt-3 border-t border-slate-100'>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className='w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-rose-600 hover:bg-rose-50 transition'
              >
                <LogOut size={20} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Bottom Navigation Bar (Persistent Native App Feel) */}
      <nav className='md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 flex items-center justify-around px-2 py-1 shadow-lg no-print'>
        <NavLink to='/dashboard' className={bottomTabClass}>
          <LayoutDashboard size={20} className='mb-0.5' />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to='/invoices/new' className={bottomTabClass}>
          <div className='bg-amber-600 text-white rounded-full p-2 -mt-5 shadow-md shadow-amber-600/30'>
            <FileSpreadsheet size={20} />
          </div>
          <span className='mt-0.5'>New Bill</span>
        </NavLink>
        <NavLink to='/categories' className={bottomTabClass}>
          <Tags size={20} className='mb-0.5' />
          <span>Rates</span>
        </NavLink>
      </nav>
    </>
  );
}
