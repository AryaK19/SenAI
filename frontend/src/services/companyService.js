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
 * Call the AI shortlister API to rank candidates
 * @param {number} threshold - Optional threshold for shortlisting (0-1)
 * @returns {Promise} Ranked candidates
 */
export const rankCandidatesByAI = async (threshold = 0.7) => {
  try {
    const response = await authAxios().get(`${API_URL}/company/resumeShortlister?threshold=${threshold}`);
    return response.data;
  } catch (error) {
    console.error('Error ranking candidates by AI:', error);
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

/**
 * Bulk upload resumes for a job posting
 * @param {File} zipFile - ZIP file containing multiple resumes
 * @returns {Promise} Upload result
 */
export const bulkUploadResumes = async (zipFile) => {
  try {
    const formData = new FormData();
    
    formData.append('resumes', zipFile);
    
    // Log the FormData to make sure it's correct
    console.log('FormData created with file:', zipFile.name);
    
    const token = getAuthToken();
    const response = await axios.post(`${API_URL}/company/bulkUpload`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      },
      // Add progress tracking
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log(`Upload progress: ${percentCompleted}%`);
      }
    });
    
    console.log('Upload response received:', response);
    return response.data;
  } catch (error) {
    console.error('Error uploading resumes in bulk:', error);
    // Provide more detailed error information
    if (error.response) {
      // The request was made and the server responded with a status code
      console.error('Response error data:', error.response.data);
      console.error('Response status:', error.response.status);
      throw new Error(error.response.data?.message || `Server error: ${error.response.status}`);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
      throw new Error('No response received from server. Please check your internet connection.');
    } else {
      // Something happened in setting up the request that triggered an Error
      throw error;
    }
  }
};

/**
 * Fetch company profile from the backend
 * @returns {Promise} Profile data
 */
export const fetchCompanyProfile = async () => {
  try {
    const response = await authAxios().get(`${API_URL}/company/profile`);
    console.log('Company profile fetched successfully:', response.data);
    if (!response.data) {
      throw new Error('Profile data not found');
    }
    return response.data;
  } catch (error) {
    console.error('Error fetching company profile:', error);
    throw error;
  }
};

/**
 * Update company job profile
 * @param {Object} profileData - Updated profile data
 * @returns {Promise} Updated profile
 */
export const updateCompanyProfile = async (profileData) => {
  try {
    const response = await authAxios().put(`${API_URL}/company/profile`, profileData);
    return response.data;
  } catch (error) {
    console.error('Error updating company profile:', error);
    throw error;
  }
};
