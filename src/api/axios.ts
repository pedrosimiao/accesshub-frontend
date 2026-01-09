// src/api/axios.ts

import axios, { AxiosError } from 'axios';
import Cookies from 'js-cookie';

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  console.error("ERRO: VITE_API_URL indefinida no arquivo .env");
}

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // envio de cookies (sessionid/csrftoken)
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
});

// Interceptor de Request (CSRF Manual)
api.interceptors.request.use((config) => {
  const csrfToken = Cookies.get('csrftoken');
  if (csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken;
  }
  return config;
}, (error) => Promise.reject(error));

// Interceptor de Response (Sessão Expirada 401)
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;

    // session expired => navega pra /login
    if (status === 401) {
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;