import { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { getErrorMessage } from '../utils/apiError';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Initialize Auth State on App Load
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          // FIX: Ensure axios has the token immediately on refresh
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          setUser(JSON.parse(savedUser));
        } catch (_) {
          // If JSON parse fails, clean up
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          delete axiosInstance.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axiosInstance.post('/auth/login', { email, password });
      
      const token = response.data?.token;
      if (!token) {
        return { success: false, error: 'Invalid response from server' };
      }

      // 2. Save Token
      localStorage.setItem('token', token);

      // 3. FIX: Attach token to Axios headers IMMEDIATELY
      // Without this, the next call to /users/profile will fail (401 Unauthorized)
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // 4. Fetch User Profile
      const profileResponse = await axiosInstance.get('/users/profile');
      const userData = profileResponse.data;

      // 5. Update State & Storage
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      return { success: true };
    } catch (error) {
      // Cleanup if profile fetch fails despite successful login
      localStorage.removeItem('token');
      delete axiosInstance.defaults.headers.common['Authorization'];
      return { success: false, error: getErrorMessage(error, 'Login failed') };
    }
  };

  const register = async (userData) => {
    try {
      await axiosInstance.post('/auth/register', userData);
      return { success: true };
    } catch (error) {
      return { success: false, error: getErrorMessage(error, 'Registration failed') };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // FIX: Remove the header so future requests don't send an invalid token
    delete axiosInstance.defaults.headers.common['Authorization'];
    
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateUser,
    loading,
    isAuthenticated: !!user,
    isArtist: user?.role === 'ARTIST',
    isBuyer: user?.role === 'BUYER',
    isAdmin: user?.role === 'ADMIN',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};