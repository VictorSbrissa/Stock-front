import axios from 'axios';

const API_BASE_URL = 'https://localhost:7105/api';

// Criar instância do axios com configuração base
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Desabilitar verificação SSL para desenvolvimento local
  httpsAgent: {
    rejectUnauthorized: false,
  } as any,
});

// Interceptador para adicionar token JWT e tenant ID a cada requisição
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  const tenantId = localStorage.getItem('tenantId');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (tenantId) {
    config.headers['X-Tenant-ID'] = tenantId;
  }

  return config;
});

// Interceptador para tratar erros de resposta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Se receber 401 (Unauthorized), limpar token e redirecionar para login
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('tenantId');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;
