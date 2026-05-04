import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(()=>{
    const token = localStorage.getItem('token'); 
    if(token){
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      return token;
    }
    return null;
  });
  const navigate = useNavigate();

  useEffect(() => {
    console.log("token state have been updated now setting default axios header");
    if (token) {
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUserProfile();
    } else {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
    }
  }, [token]);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/me`);
      setUser(response.data);
    } catch (e) {
      console.error("Failed to fetch user profile", e);
      // Fallback to basic user info from token if API fails
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({ _id: payload.userId, username: payload.username, settings: { emojiSet: 0, disableEmojis: false } });
      } catch (err) {
        logout();
      }
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/users/settings`, newSettings);
      setUser(response.data);
      return response.data;
    } catch (e) {
      console.error("Failed to update settings", e);
      throw e;
    }
  };

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          logout();
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  const login = (newToken) => {
    setToken(newToken);
  };

  const logout = () => {
    setToken(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user , token, login, logout, updateSettings, fetchUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);