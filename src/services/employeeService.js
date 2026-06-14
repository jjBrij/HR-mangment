import { api } from './api';

const API_URL = '/api/employees';

export const employeeService = {
  // Get all employees
  getAll: async () => {
    try {
      const response = await api.get(`${API_URL}/`);
      return response;
    } catch (error) {
      console.error('Get employees error:', error);
      throw error;
    }
  },

  // Get employee by ID
  getById: async (id) => {
    try {
      const response = await api.get(`${API_URL}/${id}/`);
      return response;
    } catch (error) {
      console.error('Get employee error:', error);
      throw error;
    }
  },

  // Create employee
  create: async (employeeData) => {
    try {
      const response = await api.post(`${API_URL}/`, employeeData);
      return response;
    } catch (error) {
      console.error('Create employee error:', error);
      throw error;
    }
  },

  // Update employee
  update: async (id, employeeData) => {
    try {
      const response = await api.put(`${API_URL}/${id}/`, employeeData);
      return response;
    } catch (error) {
      console.error('Update employee error:', error);
      throw error;
    }
  },

  // Delete employee
  delete: async (id) => {
    try {
      const response = await api.delete(`${API_URL}/${id}/`);
      return response;
    } catch (error) {
      console.error('Delete employee error:', error);
      throw error;
    }
  },

  // Get current user profile
  getMyProfile: async () => {
    try {
      const response = await api.get(`${API_URL}/me/`);
      return response;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },

  // Get employee statistics
  getStats: async () => {
    try {
      const response = await api.get(`${API_URL}/stats/`);
      return response;
    } catch (error) {
      console.error('Get stats error:', error);
      throw error;
    }
  }
};