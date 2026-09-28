import axios, { type AxiosError, type AxiosResponse } from 'axios';

interface ApiError {
  message?: string;
  errors?: Record<string, string>;
}

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response) {
      const message = error.response.data?.message ||
        error.response.data?.errors?.toString() ||
        `Request failed with status ${error.response.status}`;
      throw new Error(message);
    }
    throw error;
  }
);

export default api;
