import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function AppLayout() {
  return (
    <div className='min-h-screen flex flex-col bg-slate-50 text-slate-900'>
      <Navbar />
      <main className='flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8'>
        <Outlet />
      </main>
    </div>
  );
}
