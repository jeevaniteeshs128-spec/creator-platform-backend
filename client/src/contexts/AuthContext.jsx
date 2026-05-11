import { createContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

// Create context
export const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Restore authentication state from localStorage on mount
  useEffect(() => {
    const restoreAuth = async () => {
      try {
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('authUser');

        if (storedToken) {
          setToken(storedToken);

          const { data } = await api.get('/auth/me');

          if (data.success) {
            setUser(data.user);
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem('authToken');
            localStorage.removeItem('authUser');
            setIsAuthenticated(false);
          }
        } else if (storedUser) {
          // No token but user data exists, clear it
          localStorage.removeItem('authUser');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error restoring auth state:', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    restoreAuth();
  }, []);

  // Login function
  const login = useCallback(async (email, password) => {
    try {
      setLoading(true);
      const { data } = await api.post('/auth/login', { email, password });

      if (!data.success) {
        throw new Error(data.message || 'Login failed');
      }

      // Store token and user
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('authUser', JSON.stringify(data.user));

      setToken(data.token);
      setUser(data.user);
      setIsAuthenticated(true);

      return { success: true, user: data.user };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Register function
  const register = useCallback(async (name, email, password) => {
    try {
      setLoading(true);
      const { data } = await api.post('/auth/register', { name, email, password });

      if (!data.success) {
        throw new Error(data.message || 'Registration failed');
      }

      // Store token and user
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('authUser', JSON.stringify(data.user));

      setToken(data.token);
      setUser(data.user);
      setIsAuthenticated(true);

      return { success: true, user: data.user };
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      if (token) {
        // Notify backend of logout (optional)
        await api.post('/auth/logout').catch(() => {
          // Ignore errors during logout notification
        });
      }

      // Clear storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');

      // Clear state
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);

      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  }, [token]);

  // Helper function to check if user is authenticated
  const checkAuth = useCallback(() => {
    return isAuthenticated && !!user && !!token;
  }, [isAuthenticated, user, token]);

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
