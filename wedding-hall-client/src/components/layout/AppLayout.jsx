import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function AppLayout() {
  return (
    <div className='min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased'>
      <Navbar />
      {/* pb-24 ensures floating bottom navbars or actions on phones never cover content */}
      <main className='flex-1 max-w-7xl w-full mx-auto px-3.5 py-4 sm:px-6 sm:py-6 lg:px-8 pb-24 md:pb-8'>
        <Outlet />
      </main>
    </div>
  );
}
