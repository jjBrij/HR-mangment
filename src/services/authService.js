// src/services/authService.js
// Authentication service for HRMS

// Storage keys
const STORAGE_KEYS = {
  USERS: 'hrms_users',
  CURRENT_USER: 'hrms_current_user',
  RESET_TOKENS: 'hrms_reset_tokens'
};

// Initialize default admin user
export const initializeAuth = () => {
  const users = localStorage.getItem(STORAGE_KEYS.USERS);
  if (!users) {
    // Create default admin user (password is 'admin123' - in production, this should be hashed)
    const defaultUsers = [
      {
        id: 1,
        userId: 'ADMIN001',
        email: 'admin@hrms.com',
        password: btoa('admin123'), // Simple base64 encoding (in production, use proper hashing)
        name: 'Administrator',
        role: 'admin',
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        userId: 'EMP001',
        email: 'john.smith@demo.com',
        password: btoa('employee123'),
        name: 'John Smith',
        role: 'employee',
        createdAt: new Date().toISOString()
      },
      {
        id: 3,
        userId: 'EMP002',
        email: 'sarah.j@demo.com',
        password: btoa('employee123'),
        name: 'Sarah Johnson',
        role: 'employee',
        createdAt: new Date().toISOString()
      }
    ];
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaultUsers));
  }
};

// Get all users
export const getUsers = () => {
  const users = localStorage.getItem(STORAGE_KEYS.USERS);
  return users ? JSON.parse(users) : [];
};

// Find user by email
export const findUserByEmail = (email) => {
  const users = getUsers();
  return users.find(user => user.email.toLowerCase() === email.toLowerCase());
};

// Find user by userId
export const findUserByUserId = (userId) => {
  const users = getUsers();
  return users.find(user => user.userId === userId);
};

// Login function
export const login = async (userId, password) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const users = getUsers();
  const user = users.find(u => u.userId === userId);
  
  if (!user) {
    throw new Error('Invalid User ID or Password');
  }
  
  // Check password (decode from base64 - in production, use proper hashing)
  const decodedPassword = atob(user.password);
  if (decodedPassword !== password) {
    throw new Error('Invalid User ID or Password');
  }
  
  // Store current user (excluding password)
  const { password: _, ...currentUser } = user;
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
  
  return currentUser;
};

// Logout function
export const logout = () => {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  sessionStorage.clear();
};

// Get current user
export const getCurrentUser = () => {
  const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return user ? JSON.parse(user) : null;
};

// Check if user is logged in
export const isAuthenticated = () => {
  return getCurrentUser() !== null;
};

// Forgot User ID - Send user ID to email
export const forgotUserId = async (email) => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const user = findUserByEmail(email);
  
  if (!user) {
    throw new Error('No account found with this email address.');
  }
  
  // In production, this would send an actual email
  console.log(`Sending User ID ${user.userId} to ${email}`);
  
  // Store for demo purposes
  localStorage.setItem('last_user_id_recovery', JSON.stringify({
    email,
    userId: user.userId,
    timestamp: new Date().toISOString()
  }));
  
  return { success: true, userId: user.userId };
};

// Forgot Password - Send reset link
export const forgotPassword = async (email) => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const user = findUserByEmail(email);
  
  if (!user) {
    throw new Error('No account found with this email address.');
  }
  
  // Generate reset token
  const resetToken = btoa(`${user.id}_${Date.now()}_${Math.random()}`);
  
  // Store reset token
  const resetTokens = JSON.parse(localStorage.getItem(STORAGE_KEYS.RESET_TOKENS) || '{}');
  resetTokens[resetToken] = {
    userId: user.id,
    email: user.email,
    expiresAt: new Date(Date.now() + 3600000).toISOString() // 1 hour expiry
  };
  localStorage.setItem(STORAGE_KEYS.RESET_TOKENS, JSON.stringify(resetTokens));
  
  // In production, this would send an actual email with reset link
  console.log(`Password reset link for ${email}: /reset-password?token=${resetToken}`);
  
  // Store for demo purposes
  localStorage.setItem('last_password_reset', JSON.stringify({
    email,
    resetToken,
    timestamp: new Date().toISOString()
  }));
  
  return { success: true };
};

// Reset password
export const resetPassword = async (token, newPassword) => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const resetTokens = JSON.parse(localStorage.getItem(STORAGE_KEYS.RESET_TOKENS) || '{}');
  const resetData = resetTokens[token];
  
  if (!resetData) {
    throw new Error('Invalid or expired reset token');
  }
  
  if (new Date(resetData.expiresAt) < new Date()) {
    delete resetTokens[token];
    localStorage.setItem(STORAGE_KEYS.RESET_TOKENS, JSON.stringify(resetTokens));
    throw new Error('Reset token has expired');
  }
  
  // Update user password
  const users = getUsers();
  const userIndex = users.findIndex(u => u.id === resetData.userId);
  
  if (userIndex === -1) {
    throw new Error('User not found');
  }
  
  users[userIndex].password = btoa(newPassword);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  
  // Delete used token
  delete resetTokens[token];
  localStorage.setItem(STORAGE_KEYS.RESET_TOKENS, JSON.stringify(resetTokens));
  
  return { success: true };
};

// Update user profile
export const updateUserProfile = async (userId, updates) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const users = getUsers();
  const userIndex = users.findIndex(u => u.userId === userId);
  
  if (userIndex === -1) {
    throw new Error('User not found');
  }
  
  users[userIndex] = { ...users[userIndex], ...updates };
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  
  // Update current user if it's the same
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.userId === userId) {
    const { password, ...updatedUser } = users[userIndex];
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedUser));
  }
  
  return users[userIndex];
};