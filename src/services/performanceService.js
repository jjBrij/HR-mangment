// src/services/performanceService.js (Create this new file)
import { api } from './api';

const API_URL = '/api/performance';

export const performanceService = {
  // Performance Targets
  getAllTargets: async (params = {}) => {
    try {
      const response = await api.get(`${API_URL}/targets/`, params);
      return response;
    } catch (error) {
      console.error('Get targets error:', error);
      throw error;
    }
  },

  createTarget: async (targetData) => {
    try {
      const response = await api.post(`${API_URL}/targets/`, targetData);
      return response;
    } catch (error) {
      console.error('Create target error:', error);
      throw error;
    }
  },

  updateTarget: async (id, targetData) => {
    try {
      const response = await api.put(`${API_URL}/targets/${id}/`, targetData);
      return response;
    } catch (error) {
      console.error('Update target error:', error);
      throw error;
    }
  },

  deleteTarget: async (id) => {
    try {
      const response = await api.delete(`${API_URL}/targets/${id}/`);
      return response;
    } catch (error) {
      console.error('Delete target error:', error);
      throw error;
    }
  },

  getTargetStats: async (month) => {
    try {
      const response = await api.get(`${API_URL}/targets/stats/`, { month });
      return response;
    } catch (error) {
      console.error('Get stats error:', error);
      throw error;
    }
  },

  getTargetTrends: async (months = 6) => {
    try {
      const response = await api.get(`${API_URL}/targets/trends/`, { months });
      return response;
    } catch (error) {
      console.error('Get trends error:', error);
      throw error;
    }
  },

  // Daily Targets
  getDailyTargets: async () => {
    try {
      const response = await api.get(`${API_URL}/daily/`);
      return response;
    } catch (error) {
      console.error('Get daily targets error:', error);
      throw error;
    }
  },

  updateDailyTarget: async (id, data) => {
    try {
      const response = await api.put(`${API_URL}/daily/${id}/`, data);
      return response;
    } catch (error) {
      console.error('Update daily target error:', error);
      throw error;
    }
  },

  getMyDailyTargets: async (month) => {
    try {
      const response = await api.get(`${API_URL}/daily/my_targets/`, { month });
      return response;
    } catch (error) {
      console.error('Get my daily targets error:', error);
      throw error;
    }
  },

  bulkCreateDailyTargets: async (employeeId, month) => {
    try {
      const response = await api.post(`${API_URL}/daily/bulk_create/`, { employeeId, month });
      return response;
    } catch (error) {
      console.error('Bulk create error:', error);
      throw error;
    }
  }
};