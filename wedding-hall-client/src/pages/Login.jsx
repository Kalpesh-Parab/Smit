import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Lock, Mail, AlertCircle, Building2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/hall-auth/login', { email, password });
      const token = res.data.token || res.data.accessToken;
      localStorage.setItem('hall_token', token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-slate-100/90 px-4 py-8 sm:px-6'>
      <div className='w-full max-w-md bg-white p-6 sm:p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/80'>
        {/* Brand Header */}
        <div className='text-center mb-6'>
          <div className='w-14 h-14 bg-gradient-to-tr from-amber-600 to-amber-400 text-white rounded-2xl mx-auto flex items-center justify-center shadow-md shadow-amber-500/20 mb-3'>
            <Building2 size={28} />
          </div>
          <h2 className='text-xl sm:text-2xl font-bold text-slate-900 tracking-tight'>
            Smit Wedding Hall
          </h2>
          <p className='text-xs sm:text-sm text-slate-500 mt-1'>
            Sign in to manage hall billing and operations
          </p>
        </div>

        {error && (
          <div className='mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm rounded-xl flex items-center gap-2'>
            <AlertCircle size={16} className='shrink-0' />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className='space-y-4'>
          <div>
            <label className='block text-xs font-semibold text-slate-700 mb-1.5'>
              Email Address
            </label>
            <div className='relative'>
              <Mail
                size={16}
                className='absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400'
              />
              <input
                type='email'
                required
                placeholder='admin@smitoffice.com'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none transition'
              />
            </div>
          </div>

          <div>
            <label className='block text-xs font-semibold text-slate-700 mb-1.5'>
              Password
            </label>
            <div className='relative'>
              <Lock
                size={16}
                className='absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400'
              />
              <input
                type='password'
                required
                placeholder='••••••••'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className='w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none transition'
              />
            </div>
          </div>

          <button
            type='submit'
            disabled={loading}
            className='w-full py-3 bg-amber-600 hover:bg-amber-700 active:scale-[0.99] text-white font-semibold rounded-xl transition disabled:opacity-50 text-sm shadow-sm mt-2'
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}