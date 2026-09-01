import { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { toast } from 'sonner';
import axios from 'axios';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import WhatsAppModal from '../WhatsAppModal/WhatsAppModal';
import {
  Sun,
  Moon,
  ShieldCheck,
  MessageSquare,
  LogOut,
  LogIn,
  Users,
} from 'lucide-react';
import './Navbar.scss';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, setTokenAndFetchContacts, googleContacts, logout } = useAuth();

  const [isWaConnected, setIsWaConnected] = useState(false);
  const [isWaModalOpen, setIsWaModalOpen] = useState(false);

  const pollStatus = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/whatsapp/status', {
        withCredentials: true,
      });
      setIsWaConnected(Boolean(res.data.connected));
    } catch {
      setIsWaConnected(false);
    }
  };

  useEffect(() => {
    pollStatus();
    if (!isWaModalOpen) {
      const interval = setInterval(pollStatus, 10000);
      return () => clearInterval(interval);
    }
  }, [isWaModalOpen]);

  // Unified Google Login + Contacts Scope
  const handleGoogleLogin = useGoogleLogin({
    scope:
      'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/contacts.readonly',
    onSuccess: async (tokenResponse) => {
      try {
        await setTokenAndFetchContacts(tokenResponse.access_token);
        toast.success('Logged in & Google Contacts synchronized!');
      } catch {
        toast.error('Failed to complete login');
      }
    },
    onError: () => toast.error('Google Sign In failed'),
  });

  return (
    <>
      <header className='top-navbar'>
        <Link
          to='/'
          className='navbar-brand'
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <ShieldCheck size={22} className='brand-icon' />
          <span className='brand-name'>Smit Office</span>
        </Link>

        <nav className='navbar-services'>
          <NavLink
            to='/ambulance'
            className={({ isActive }) =>
              isActive ? 'service-tab active' : 'service-tab'
            }
          >
            Ambulance
          </NavLink>
          <NavLink
            to='/generators'
            className={({ isActive }) =>
              isActive ? 'service-tab active' : 'service-tab'
            }
          >
            Generators
          </NavLink>
          <NavLink
            to='/towing-vans'
            className={({ isActive }) =>
              isActive ? 'service-tab active' : 'service-tab'
            }
          >
            Towing Vans
          </NavLink>
        </nav>

        <div className='navbar-actions'>
          {/* WhatsApp Bot Status Button */}
          <button
            className={`wa-status-pill ${isWaConnected ? 'connected' : 'disconnected'}`}
            onClick={() => setIsWaModalOpen(true)}
            title='WhatsApp Bot Status'
          >
            <MessageSquare size={16} />
            <span>{isWaConnected ? 'Bot Online' : 'Connect Bot'}</span>
            <span className='pulse-dot'></span>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className='theme-toggle-btn'
            aria-label='Toggle Theme'
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {/* Google Auth Button / Profile */}
          <div className='auth-profile-wrapper'>
            {user ? (
              <div className='user-profile'>
                {user.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name}
                    className='user-avatar'
                  />
                ) : (
                  <div className='user-avatar-fallback'>
                    {user.name?.[0] || 'U'}
                  </div>
                )}
                <span className='user-name-label'>{user.name}</span>
                <button onClick={logout} className='logout-btn' title='Logout'>
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleGoogleLogin()}
                className='google-signin-btn'
              >
                <LogIn size={16} />
                <span>Sign in with Google</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <WhatsAppModal
        isOpen={isWaModalOpen}
        onClose={() => {
          setIsWaModalOpen(false);
          pollStatus();
        }}
      />
    </>
  );
}
