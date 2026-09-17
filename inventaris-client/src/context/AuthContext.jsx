import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axiosClient from '../api/axiosClient';
import { useToast } from './ToastContext';
import { trackEvent, trackFormSubmit } from '../utils/analytics';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  // Validate token with /me on app start
  useEffect(() => {
    const verifyUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await axiosClient.get('/me');
        if (res.data && res.data.data) {
          setUser(res.data.data);
          localStorage.setItem('user', JSON.stringify(res.data.data));
        }
      } catch (err) {
        console.warn('Session verification failed:', err);
        // Token invalid or expired
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    verifyUser();

    // Listen for global 401 broadcast from axiosClient
    const handleUnauthorized = (e) => {
      setUser(null);
      setToken(null);
      toast.warning(e.detail?.message || 'Sesi telah berakhir, silakan login kembali.', 'Sesi Habis');
    };

    window.addEventListener('auth_unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth_unauthorized', handleUnauthorized);
  }, [token, toast]);

  // Login handler
  const login = async (email, password) => {
    try {
      trackEvent('user_login_attempt', { email });
      const response = await axiosClient.post('/login', { email, password });
      const { user: userData, token: userToken } = response.data.data;

      localStorage.setItem('token', userToken);
      localStorage.setItem('user', JSON.stringify(userData));

      setToken(userToken);
      setUser(userData);

      trackFormSubmit('login_form', 'success', { email });
      toast.success(`Selamat datang kembali, ${userData.name}!`, 'Login Berhasil');
      return { success: true, data: response.data.data };
    } catch (error) {
      let message = 'Gagal melakukan login. Silakan periksa kembali email & password Anda.';
      
      if (error.response) {
        if (error.response.status === 401) {
          message = 'Email atau password salah. Silakan coba lagi.';
        } else if (error.response.data?.message) {
          message = error.response.data.message;
        }
      } else if (error.request) {
        message = 'Tidak dapat menghubungi server API backend (localhost:8000). Pastikan Laravel sudah berjalan.';
      }

      trackFormSubmit('login_form', 'error', { error: message });
      toast.error(message, 'Login Gagal');
      return { success: false, message };
    }
  };

  // Register handler with specific duplicate email check message
  const register = async (name, email, password, passwordConfirmation) => {
    try {
      trackEvent('user_register_attempt', { email, name });
      const response = await axiosClient.post('/register', {
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });

      const { user: userData, token: userToken } = response.data.data;

      localStorage.setItem('token', userToken);
      localStorage.setItem('user', JSON.stringify(userData));

      setToken(userToken);
      setUser(userData);

      trackFormSubmit('register_form', 'success', { email, name });
      toast.success(`Akun berhasil dibuat. Selamat datang, ${userData.name}!`, 'Registrasi Berhasil');
      return { success: true, data: response.data.data };
    } catch (error) {
      let message = 'Terjadi kesalahan saat registrasi.';
      
      if (error.response?.data) {
        const resData = error.response.data;
        const errors = resData.errors || {};

        // Check specifically for duplicate email error
        if (errors.email) {
          const emailErr = errors.email.join(' ');
          if (emailErr.toLowerCase().includes('sudah terdaftar') || emailErr.toLowerCase().includes('taken') || emailErr.toLowerCase().includes('unique')) {
            message = 'account has already register';
          } else {
            message = errors.email[0];
          }
        } else if (errors.password) {
          message = errors.password[0];
        } else if (errors.name) {
          message = errors.name[0];
        } else if (resData.message) {
          message = resData.message;
        }
      } else if (error.request) {
        message = 'Tidak dapat terhubung ke server Laravel backend. Pastikan server aktif di port 8000.';
      }

      trackFormSubmit('register_form', 'error', { error: message });
      toast.error(message, 'Registrasi Gagal');
      return { success: false, message };
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      trackEvent('user_logout_attempt', { email: user?.email });
      await axiosClient.post('/logout');
    } catch (error) {
      console.warn('Logout API notification error (proceeding client logout):', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
      toast.info('Anda telah berhasil keluar dari akun (logout).', 'Logout');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token,
        login,
        register,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
