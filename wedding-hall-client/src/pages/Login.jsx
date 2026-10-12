import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Lock, Mail, AlertCircle } from 'lucide-react';

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
      // Inside handleLogin in Login.jsx:
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
    <div className='min-h-screen flex items-center justify-center bg-slate-100 p-4'>
      <form
        onSubmit={handleLogin}
        className='bg-white p-8 rounded-2xl shadow-lg border border-slate-200 w-full max-w-md space-y-5'
      >
        <div className='text-center'>
          <div className='w-12 h-12 bg-amber-500 text-white rounded-xl mx-auto flex items-center justify-center font-bold text-xl mb-2'>
            WH
          </div>
          <h2 className='text-2xl font-bold text-slate-800'>
            Smit Wedding Hall
          </h2>
          <p className='text-sm text-slate-500'>
            Sign in with your admin account
          </p>
        </div>

        {error && (
          <div className='p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg flex items-center gap-2'>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <div className='space-y-4'>
          <div>
            <label className='block text-xs font-semibold text-slate-600 mb-1'>
              Email
            </label>
            <div className='relative'>
              <Mail
                size={16}
                className='absolute left-3 top-3 text-slate-400'
              />
              <input
                type='email'
                required
                placeholder='admin@smitoffice.com'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none'
              />
            </div>
          </div>

          <div>
            <label className='block text-xs font-semibold text-slate-600 mb-1'>
              Password
            </label>
            <div className='relative'>
              <Lock
                size={16}
                className='absolute left-3 top-3 text-slate-400'
              />
              <input
                type='password'
                required
                placeholder='••••••••'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className='w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none'
              />
            </div>
          </div>
        </div>

        <button
          type='submit'
          disabled={loading}
          className='w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition disabled:opacity-50'
        >
          {loading ? 'Authenticating...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}
