import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [googleAccessToken, setGoogleAccessToken] = useState(
    () => localStorage.getItem('smit_g_token') || null,
  );
  const [googleContacts, setGoogleContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  const checkUser = async () => {
    try {
      const savedToken = localStorage.getItem('smit_g_token');
      if (savedToken) {
        const profileRes = await axios.get(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          {
            headers: { Authorization: `Bearer ${savedToken}` },
          },
        );
        setUser(profileRes.data);
      }
    } catch {
      setUser(null);
      localStorage.removeItem('smit_g_token');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUser();
  }, []);

  const setTokenAndFetchContacts = async (token) => {
    setGoogleAccessToken(token);
    localStorage.setItem('smit_g_token', token);

    // 1. Fetch User Profile
    const profileRes = await axios.get(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    setUser(profileRes.data);

    // 2. Fetch Google Contacts through backend proxy
    try {
      const contactsRes = await axios.get(
        'http://localhost:5000/api/contacts',
        {
          headers: { 'x-google-access-token': token },
        },
      );
      if (contactsRes.data.success) {
        setGoogleContacts(contactsRes.data.data);
      }
    } catch (err) {
      console.error('Failed to sync contacts:', err);
    }
  };

  const logout = () => {
    setUser(null);
    setGoogleAccessToken(null);
    setGoogleContacts([]);
    localStorage.removeItem('smit_g_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        googleAccessToken,
        googleContacts,
        setTokenAndFetchContacts,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
