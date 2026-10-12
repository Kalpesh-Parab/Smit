import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Temporary bypass for quick local development; connects to /api/auth later
    localStorage.setItem('hall_token', 'temp_admin_token');
    navigate('/dashboard');
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-slate-100 p-4'>
      <form
        onSubmit={handleLogin}
        className='bg-white p-8 rounded-xl shadow-md w-full max-w-sm space-y-4'
      >
        <h2 className='text-2xl font-bold text-center text-slate-800'>
          Admin Login
        </h2>
        <input
          type='password'
          placeholder='Enter Admin Password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className='w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500'
        />
        <button
          type='submit'
          className='w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition'
        >
          Access Dashboard
        </button>
      </form>
    </div>
  );
}
