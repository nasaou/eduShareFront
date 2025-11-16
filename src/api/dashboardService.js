import { apiFetch, getAuthHeaders } from './apiService';

/**
 * Dashboard Service for fetching role-specific metrics
 */
export const dashboardService = {
  /**
   * Get admin dashboard metrics
   * @returns {Promise<Object>} Admin metrics including user stats, course stats, etc.
   */
  async getAdminMetrics() {
    try {
      const response = await apiFetch('/dashboard/metrics', {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch admin metrics:', error);
      throw error;
    }
  },

  /**
   * Get teacher dashboard metrics
   * @returns {Promise<Object>} Teacher metrics including course stats, filiere count, student count
   */
  async getTeacherMetrics() {
    try {
      const response = await apiFetch('/dashboard/teacher-metrics', {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch teacher metrics:', error);
      throw error;
    }
  },

  /**
   * Get student dashboard metrics
   * @returns {Promise<Object>} Student metrics including available courses, groups, modules
   */
  async getStudentMetrics() {
    try {
      const response = await apiFetch('/dashboard/student-metrics', {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch student metrics:', error);
      throw error;
    }
  },

  /**
   * Get metrics based on user role
   * @param {string} role - User role ('admin', 'teacher', 'student')
   * @returns {Promise<Object>} Role-specific metrics
   */
  async getMetricsByRole(role) {
    switch (role) {
      case 'admin':
        return this.getAdminMetrics();
      case 'teacher':
      case 'professor':
        return this.getTeacherMetrics();
      case 'student':
        return this.getStudentMetrics();
      default:
        throw new Error(`Unsupported role: ${role}`);
    }
  }
};

export default dashboardService;