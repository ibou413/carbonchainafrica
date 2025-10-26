import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL + '/api/users/';

// Create an axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const register = (userData: any) => {
  return api.post('register/', userData);
};

const login = (userData: any) => {
  return api.post('login/', userData);
};

const logout = () => {
  localStorage.removeItem('user');
  // We might need to call a logout endpoint on the backend as well
  // return api.post('logout/');
};

const authService = {
  register,
  login,
  logout,
};

export default authService;
