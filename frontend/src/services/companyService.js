import axios from 'axios';
import { getAuthToken } from './authService';

const API_URL = import.meta.env.VITE_API_URL;

// Configure axios with auth token
const authAxios = () => {
  const token = getAuthToken();
  return axios.create({
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};

/**
 * Fetch company dashboard statistics
 * @returns {Promise} Dashboard statistics
 */
export const fetchDashboardStats = async () => {
  try {
    const response = await authAxios().get(`${API_URL}/company/dashboard/stats`);
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

/**
 * Fetch candidates who applied to the company's job
 * @returns {Promise} List of candidates
 */
export const fetchAppliedCandidates = async () => {
  try {
    const response = await authAxios().get(`${API_URL}/company/candidates`);
    return response.data;
  } catch (error) {
    console.error('Error fetching applied candidates:', error);
    throw error;
  }
};

/**
 * Update candidate shortlist status
 * @param {number} candidateId - Candidate ID
 * @param {boolean} shortlisted - Whether the candidate is shortlisted
 * @returns {Promise} Updated shortlist status
 */
export const updateCandidateShortlistStatus = async (candidateId, shortlisted) => {
  try {
    const response = await authAxios().put(
      `${API_URL}/company/candidates/${candidateId}/shortlist`,
      { shortlisted }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating shortlist status:', error);
    throw error;
  }
};

/**
 * Get resume download URL
 * @param {string} path - Resume file path
 * @returns {string} Full URL to download resume
 */
export const getResumeDownloadUrl = (path) => {
  if (!path) return null;
  return `${API_URL}${path}`;
};
