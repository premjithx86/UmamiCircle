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
