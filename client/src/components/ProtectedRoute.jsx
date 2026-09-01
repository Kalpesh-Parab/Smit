import { useAuth } from '../context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';
import { ShieldCheck, LogIn, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import './ProtectedRoute.scss';

export default function ProtectedRoute({ children }) {
  const { user, loading, setTokenAndFetchContacts } = useAuth();

  const handleLogin = useGoogleLogin({
    scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/contacts.readonly',
    onSuccess: async (tokenResponse) => {
      try {
        await setTokenAndFetchContacts(tokenResponse.access_token);
        toast.success('Logged in successfully!');
      } catch {
        toast.error('Failed to authenticate');
      }
    },
    onError: () => toast.error('Google Sign In failed'),
  });

  if (loading) {
    return (
      <div className="auth-lock-screen">
        <Loader2 className="spinner" size={40} />
        <p>Verifying access...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="auth-lock-screen">
        <div className="lock-card">
          <div className="lock-icon">
            <ShieldCheck size={36} />
          </div>
          <h2>Smit Office Workspace</h2>
          <p>Please authenticate with your authorized Google Account to access dashboard operations.</p>
          <button onClick={() => handleLogin()} className="login-action-btn">
            <LogIn size={18} />
            <span>Sign in with Google</span>
          </button>
        </div>
      </div>
    );
  }

  return children;
}
