import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/admin';

export const getDashboardStats = async () => {
  const token = localStorage.getItem('adminToken');
  const response = await axios.get(`${API_URL}/dashboard/stats`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const getUsers = async (search = '') => {
  const token = localStorage.getItem('adminToken');
  const response = await axios.get(`${API_URL}/users`, {
    params: { search },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const toggleBlockUser = async (userId, isBlocked) => {
  const token = localStorage.getItem('adminToken');
  const response = await axios.patch(`${API_URL}/users/${userId}/block`, { isBlocked }, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const deleteUser = async (userId) => {
  const token = localStorage.getItem('adminToken');
  const response = await axios.delete(`${API_URL}/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const getPosts = async (params = {}) => {
  const token = localStorage.getItem('adminToken');
  const response = await axios.get(`${API_URL}/content/posts`, {
    params,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const deletePost = async (postId) => {
  const token = localStorage.getItem('adminToken');
  const response = await axios.delete(`${API_URL}/content/post/${postId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const getRecipes = async (params = {}) => {
  const token = localStorage.getItem('adminToken');
  const response = await axios.get(`${API_URL}/content/recipes`, {
    params,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const deleteRecipe = async (recipeId) => {
  const token = localStorage.getItem('adminToken');
  const response = await axios.delete(`${API_URL}/content/recipe/${recipeId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const updateContentStatus = async (type, id, status) => {
  const token = localStorage.getItem('adminToken');
  const response = await axios.patch(`${API_URL}/content/${type}/${id}/status`, { status }, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const toggleHideContent = async (type, id, isHidden) => {
  const token = localStorage.getItem('adminToken');
  const response = await axios.patch(`${API_URL}/content/${type}/${id}/hide`, { isHidden }, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const updateContentDetails = async (type, id, updates) => {
  const token = localStorage.getItem('adminToken');
  const response = await axios.put(`${API_URL}/content/${type}/${id}`, updates, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const getReports = async (params = {}) => {
  const token = localStorage.getItem('adminToken');
  const response = await axios.get(`${API_URL}/reports`, {
    params,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const updateReport = async (reportId, data) => {
  const token = localStorage.getItem('adminToken');
  const response = await axios.patch(`${API_URL}/reports/${reportId}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const takeReportAction = async (reportId, action, warnMessage = '') => {
  const token = localStorage.getItem('adminToken');
  const response = await axios.post(`${API_URL}/reports/${reportId}/action`, { action, warnMessage }, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const getAuditLogs = async (params = {}) => {
  const token = localStorage.getItem('adminToken');
  const response = await axios.get(`${API_URL}/logs`, {
    params,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
