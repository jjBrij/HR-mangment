// src/pages/Login.jsx - Complete working version
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiLogIn, FiUser, FiLock, FiEye, FiEyeOff, 
  FiBriefcase, FiAlertCircle, FiCheckCircle, FiX, FiMail 
} from 'react-icons/fi';
import { 
  login, isAuthenticated, initializeAuth, 
  getCurrentUser, mustChangePassword 
} from '../services/authService';

const Login = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showForgotUserId, setShowForgotUserId] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

  useEffect(() => {
    // Clear any stale auth data when login page loads
    const clearStaleData = () => {
      const token = localStorage.getItem('access_token');
      const user = getCurrentUser();
      
      // If there's a token but no user, or token seems invalid, clear everything
      if (token && !user) {
        localStorage.clear();
      }
    };
    
    clearStaleData();
    initializeAuth();
    
    // Prevent back button issues
    window.history.pushState(null, '', window.location.href);
    
    const handlePopState = () => {
      window.location.reload();
    };
    
    window.addEventListener('popstate', handlePopState);
    
    // Check if already logged in
    if (isAuthenticated()) {
      const user = getCurrentUser();
      const mustChange = mustChangePassword();
      
      console.log('Already authenticated, redirecting...', { user, mustChange });
      
      if (mustChange) {
        navigate('/change-password');
      } else if (user?.role === 'admin' || user?.role === 'hr_manager') {
        navigate('/dashboard');
      } else {
        navigate('/employee-dashboard');
      }
    }
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigate]);

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 3000);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!userId.trim()) newErrors.userId = 'User ID is required';
    if (!password.trim()) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setErrors({});
    
    try {
      const user = await login(userId, password);
      const mustChange = mustChangePassword();
      

      
      showNotification('success', `Welcome back, ${user.first_name || user.name || userId}!`);
      
      if (mustChange) {
        setTimeout(() => {
          navigate('/change-password', { replace: true });
        }, 500);
      } else if (user.role === 'admin' || user.role === 'hr_manager') {
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 500);
      } else {
        setTimeout(() => {
          navigate('/employee-dashboard', { replace: true });
        }, 500);
      }
    } catch (error) {
      console.error('Login error:', error);
      showNotification('error', error.message);
      setErrors({ general: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotUserId = async (e) => {
    e.preventDefault();
    
    if (!forgotEmail.trim()) {
      showNotification('error', 'Please enter your registered email address');
      return;
    }
    
    setLoading(true);
    try {
      const { forgotUserId } = await import('../services/authService');
      await forgotUserId(forgotEmail);
      showNotification('success', 'Your User ID has been sent to your registered email address.');
      setTimeout(() => {
        setShowForgotUserId(false);
        setForgotEmail('');
      }, 3000);
    } catch (error) {
      showNotification('error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    
    if (!forgotEmail.trim()) {
      showNotification('error', 'Please enter your registered email address');
      return;
    }
    
    setLoading(true);
    try {
      const { forgotPassword } = await import('../services/authService');
      await forgotPassword(forgotEmail);
      showNotification('success', 'Password reset link has been sent to your registered email.');
      setTimeout(() => {
        setShowForgotPassword(false);
        setForgotEmail('');
      }, 3000);
    } catch (error) {
      showNotification('error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Toast Notification */}
      {notification.show && (
        <div className={`toast-notification ${notification.type}`}>
          <div className="toast-content">
            {notification.type === 'success' ? (
              <FiCheckCircle className="toast-icon" />
            ) : (
              <FiAlertCircle className="toast-icon" />
            )}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification({ show: false, type: '', message: '' })} className="toast-close">
            <FiX />
          </button>
        </div>
      )}

      {/* Main Login Container */}
      <div className="login-container">
        <div className="login-card glass-effect">
          {/* Logo and Company Name */}
          <div className="login-header">
            <div className="logo-container">
              <div className="logo-icon">
                <FiBriefcase className="logo-icon-svg" />
              </div>
              <div className="logo-text">
                <h1 className="company-name">HRMS</h1>
                <p className="company-tagline">Human Resource Management System</p>
              </div>
            </div>
            <div className="welcome-text">
              <h2>Welcome Back!</h2>
              <p>Please enter your credentials to access your account</p>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label className="form-label">
                <FiUser className="label-icon" />
                Employee ID / Email
              </label>
              <input
                type="text"
                className={`form-input ${errors.userId ? 'error' : ''}`}
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter your Employee ID or Email"
                disabled={loading}
              />
              {errors.userId && <span className="error-message">{errors.userId}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                <FiLock className="label-icon" />
                Password
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            {errors.general && (
              <div className="general-error">
                <FiAlertCircle />
                <span>{errors.general}</span>
              </div>
            )}

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? (
                <div className="spinner"></div>
              ) : (
                <>
                  <FiLogIn />
                  Login
                </>
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className="login-footer">
            <button
              className="link-btn"
              onClick={() => setShowForgotUserId(true)}
              disabled={loading}
            >
              Forgot User ID?
            </button>
            <span className="separator">•</span>
            <button
              className="link-btn"
              onClick={() => setShowForgotPassword(true)}
              disabled={loading}
            >
              Forgot Password?
            </button>
          </div>
        </div>
      </div>

      {/* Forgot User ID Modal */}
      {showForgotUserId && (
        <div className="modal-overlay" onClick={() => setShowForgotUserId(false)}>
          <div className="modal-content glass-effect" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Recover User ID</h3>
              <button className="modal-close" onClick={() => setShowForgotUserId(false)}>
                <FiX />
              </button>
            </div>
            <form onSubmit={handleForgotUserId}>
              <div className="form-group">
                <label className="form-label">
                  <FiMail className="label-icon" />
                  Registered Email Address
                </label>
                <input
                  type="email"
                  className="form-input"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowForgotUserId(false)}>
                  Back to Login
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? <div className="spinner-small"></div> : 'Send User ID'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="modal-overlay" onClick={() => setShowForgotPassword(false)}>
          <div className="modal-content glass-effect" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Reset Password</h3>
              <button className="modal-close" onClick={() => setShowForgotPassword(false)}>
                <FiX />
              </button>
            </div>
            <form onSubmit={handleForgotPassword}>
              <div className="form-group">
                <label className="form-label">
                  <FiMail className="label-icon" />
                  Registered Email Address
                </label>
                <input
                  type="email"
                  className="form-input"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowForgotPassword(false)}>
                  Back to Login
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? <div className="spinner-small"></div> : 'Send Reset Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;