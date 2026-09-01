import axios from 'axios';

const api = axios.create({
  baseURL: 'https://smit-x7hq.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Generic CRUD operations for any resource
export const getItems = async (resource) => {
  const response = await api.get(`/${resource}`);
  return response.data;
};

export const getItemById = async (resource, id) => {
  const response = await api.get(`/${resource}/${id}`);
  return response.data;
};

export const createItem = async (resource, payload) => {
  const response = await api.post(`/${resource}`, payload);
  return response.data;
};

export const updateItem = async (resource, id, payload) => {
  const response = await api.put(`/${resource}/${id}`, payload);
  return response.data;
};

export const deleteItem = async (resource, id) => {
  const response = await api.delete(`/${resource}/${id}`);
  return response.data;
};

export default api;
