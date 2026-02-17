// src/api/axios.ts

import axios, { AxiosError } from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  console.error("ERRO: VITE_API_URL indefinida no arquivo .env");
}

const api = axios.create({
  baseURL: API_URL,
  // withCredentials: true, // envio de cookies (sessionid/csrftoken)
});

api.defaults.xsrfCookieName = 'csrftoken';
api.defaults.xsrfHeaderName = 'X-CSRFToken';
api.defaults.withCredentials = true;


// Interceptor de Response (Sessão Expirada 401)
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;

    // session expired => navega pra /login
    if (status === 401 && window.location.pathname !== '/login') {
      console.warn("Sessão expirada ou usuário não autenticado.");
    }
    
    return Promise.reject(error);
  }
);

export default api;
