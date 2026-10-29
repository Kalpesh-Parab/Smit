import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || 'https://smit-608m.onrender.com/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [googleAccessToken, setGoogleAccessToken] = useState(null);
  const [googleContacts, setGoogleContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchContacts = async (token) => {
    if (!token) return;
    try {
      const contactsRes = await axios.get(`${API_BASE}/contacts`, {
        headers: { 'x-google-access-token': token },
        withCredentials: true,
      });
      if (contactsRes.data.success) {
        setGoogleContacts(contactsRes.data.data);
      }
    } catch (err) {
      console.error('Failed to sync contacts:', err);
    }
  };

  const checkUser = async () => {
    try {
      const savedJwt = localStorage.getItem('smit_session_token');
      const res = await axios.get(`${API_BASE}/auth/me`, {
        headers: savedJwt ? { Authorization: `Bearer ${savedJwt}` } : {},
        withCredentials: true,
      });

      if (res.data?.success && res.data?.user) {
        setUser(res.data.user);
        if (res.data.googleAccessToken) {
          setGoogleAccessToken(res.data.googleAccessToken);
          fetchContacts(res.data.googleAccessToken);
        }
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
      localStorage.removeItem('smit_session_token');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUser();
  }, []);

  const loginWithBackend = async (authCode) => {
    const res = await axios.post(
      `${API_BASE}/auth/google`,
      { code: authCode },
      { withCredentials: true },
    );

    if (res.data.success) {
      setUser(res.data.user);
      localStorage.setItem('smit_session_token', res.data.token);

      if (res.data.googleAccessToken) {
        setGoogleAccessToken(res.data.googleAccessToken);
        fetchContacts(res.data.googleAccessToken);
      }
    }
  };

  const logout = async () => {
    try {
      await axios.post(
        `${API_BASE}/auth/logout`,
        {},
        { withCredentials: true },
      );
    } catch (err) {
      console.error('Logout error:', err);
    }
    setUser(null);
    setGoogleAccessToken(null);
    setGoogleContacts([]);
    localStorage.removeItem('smit_session_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        googleAccessToken,
        googleContacts,
        loginWithBackend,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
