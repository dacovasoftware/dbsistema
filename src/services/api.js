import axios from 'axios'

const API_HOST = window.location.hostname

const api = axios.create({
  baseURL: `http://${API_HOST}:3000/api`
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default api

export const API_URL = `http://${API_HOST}:3000`