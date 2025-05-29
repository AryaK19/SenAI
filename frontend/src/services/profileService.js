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
 * Fetch candidate profile from the backend
 * @returns {Promise} Profile data
 */
export const fetchCandidateProfile = async () => {
  try {
    const response = await authAxios().get(`${API_URL}/candidate/profile`);
    console.log('Profile fetched successfully:', response.data);
    if (!response.data) {
      throw new Error('Profile data not found');
    }
    return response.data;
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
};

/**
 * Update candidate profile
 * @param {Object} profileData - Updated profile data
 * @returns {Promise} Updated profile
 */
export const updateCandidateProfile = async (profileData) => {
  try {
    const response = await authAxios().put(`${API_URL}/candidate/profile`, profileData);
    return response.data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

/**
 * Upload resume file
 * @param {File} file - Resume file to upload
 * @returns {Promise} Upload result
 */
export const uploadResume = async (file) => {
  try {
    const formData = new FormData();
    formData.append('resume', file);
    
    const token = getAuthToken();
    const response = await axios.post(`${API_URL}/candidate/resume`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error uploading resume:', error);
    throw error;
  }
};

/**
 * Add education record
 * @param {Object} educationData - Education data to add
 * @returns {Promise} Added education record
 */
export const addEducation = async (educationData) => {
  try {
    const response = await authAxios().post(`${API_URL}/candidate/education`, educationData);
    return response.data;
  } catch (error) {
    console.error('Error adding education:', error);
    throw error;
  }
};

/**
 * Add skill record
 * @param {Object} skillData - Skill data to add
 * @returns {Promise} Added skill record
 */
export const addSkill = async (skillData) => {
  try {
    const response = await authAxios().post(`${API_URL}/candidate/skills`, skillData);
    return response.data;
  } catch (error) {
    console.error('Error adding skill:', error);
    throw error;
  }
};
