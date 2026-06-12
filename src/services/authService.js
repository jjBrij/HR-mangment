import { api, setTokens, clearTokens, getAccessToken } from './api';


export const login = async (employeeId, password) => {
  try {
    clearTokens();
    
    const data = await api.post('/api/auth/login/', {
      employee_id: employeeId,
      password: password,
    });
    
    if (data.access) {
      setTokens(data.access, data.refresh);
    }
    
    if (data.user) {
      localStorage.setItem('current_user', JSON.stringify(data.user));
    }
    
    if (data.must_change_password !== undefined) {
      localStorage.setItem('must_change_password', data.must_change_password);
    }
    
    return {
      ...data.user,
      mustChangePassword: data.must_change_password,
    };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Logout
export const logout = async () => {
  try {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      await api.post('/api/auth/logout/', { refresh: refreshToken });
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    clearTokens();
    window.location.href = '/login';
  }
};

// Get current user
export const getCurrentUser = () => {
  try {
    const raw = localStorage.getItem('current_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

// Check authentication
export const isAuthenticated = () => {
  return !!getAccessToken() && !!getCurrentUser();
};

// Check if password needs change
export const mustChangePassword = () => {
  return localStorage.getItem('must_change_password') === 'true';
};

// Change password
export const changePassword = async (currentPassword, newPassword) => {
  const data = await api.post('/api/auth/change-password/', {
    current_password: currentPassword,
    new_password: newPassword,
    confirm_password: newPassword,
  });
  
  if (data.access) {
    setTokens(data.access, data.refresh);
  }
  
  localStorage.setItem('must_change_password', 'false');
  return data;
};

// Forgot User ID
export const forgotUserId = async (email) => {
  return api.post('/api/auth/forgot-userid/', { email });
};

// Forgot Password
export const forgotPassword = async (email) => {
  return api.post('/api/auth/forgot-password/', { email });
};

// Reset Password
export const resetPassword = async (token, newPassword) => {
  return api.post('/api/auth/reset-password/', {
    token,
    new_password: newPassword,
    confirm_password: newPassword,
  });
};

// Get current user profile
export const getCurrentUserProfile = async () => {
  const data = await api.get('/api/auth/me/');
  return data;
};

// Initialize auth
export const initializeAuth = () => {
  const token = getAccessToken();
  const user = getCurrentUser();
  console.log('Auth initialized:', { hasToken: !!token, hasUser: !!user });
  return { token, user };
};