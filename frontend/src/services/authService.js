/* eslint-disable no-useless-catch */
const API_URL = import.meta.env.VITE_API_URL;

export const registerCompany = async (companyData) => {
  try {
    const response = await fetch(`${API_URL}/register/company`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(companyData),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }
    
    return data;
  } catch (error) {
    throw error;
  }
};

export const registerCandidate = async (candidateData) => {
  try {
    const response = await fetch(`${API_URL}/register/candidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(candidateData),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }
    
    return data;
  } catch (error) {
    throw error;
  }
};

// New login functions
export const loginCandidate = async (credentials) => {
  try {
    const response = await fetch(`${API_URL}/login/candidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }
    
    // Store token in localStorage for future authenticated requests
    if (data.access_token) {
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('userType', 'candidate');
      localStorage.setItem('userData', JSON.stringify(data.candidate));
    }
    
    return data;
  } catch (error) {
    throw error;
  }
};

export const loginCompany = async (credentials) => {
  try {
    const response = await fetch(`${API_URL}/login/company`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }
    
    // Store token in localStorage for future authenticated requests
    if (data.access_token) {
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('userType', 'company');
      localStorage.setItem('userData', JSON.stringify(data.company));
    }
    
    return data;
  } catch (error) {
    throw error;
  }
};

// Helper function to check if user is logged in
export const isAuthenticated = () => {
  return localStorage.getItem('token') !== null;
};

// Helper function to get current user data
export const getCurrentUser = () => {
  const userData = localStorage.getItem('userData');
  return userData ? JSON.parse(userData) : null;
};

// Helper function to get current user type
export const getUserType = () => {
  return localStorage.getItem('userType');
};

// Helper function to get authentication token
export const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper function to logout
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userType');
  localStorage.removeItem('userData');
};