const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const API_URL = `${BASE_URL}`;

export function getAccessToken() { 
  return localStorage.getItem('access_token'); 
}

export function getRefreshToken() { 
  return localStorage.getItem('refresh_token'); 
}

export function setTokens(access, refresh) {
  if (access)  localStorage.setItem('access_token',  access);
  if (refresh) localStorage.setItem('refresh_token', refresh);
}

export function clearTokens() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('current_user');
  localStorage.removeItem('must_change_password');
}

let isRefreshing = false;
let failedQueue = [];

function processQueue(error, token = null) {
  failedQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token)
  );
  failedQueue = [];
}

async function apiFetch(endpoint, options = {}) {
  // Endpoint should already include /api/ prefix
  const url = `${API_URL}${endpoint}`;
  console.log('API Request URL:', url);

  const headers = {
    ...(options.body && !(options.body instanceof FormData)
      ? { 'Content-Type': 'application/json' }
      : {}),
    ...options.headers,
  };

  const token = getAccessToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    let response = await fetch(url, { ...options, headers });

    // Auto-refresh on 401
    if (response.status === 401 && getRefreshToken()) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(newToken => {
          headers['Authorization'] = `Bearer ${newToken}`;
          return fetch(url, { ...options, headers });
        });
      }

      isRefreshing = true;
      try {
        const refreshRes = await fetch(`${API_URL}/api/auth/token/refresh/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh: getRefreshToken() }),
        });

        if (!refreshRes.ok) throw new Error('Refresh failed');

        const { access } = await refreshRes.json();
        setTokens(access, null);
        processQueue(null, access);
        headers['Authorization'] = `Bearer ${access}`;
        response = await fetch(url, { ...options, headers });
      } catch (err) {
        processQueue(err);
        clearTokens();
        window.location.href = '/login';
        throw err;
      } finally {
        isRefreshing = false;
      }
    }

    if (!response.ok) {
      let errorData;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        errorData = await response.json();
      } else {
        errorData = { error: await response.text() };
      }
      
      let errorMessage = `Request failed (${response.status})`;
      
      if (errorData.detail) {
        errorMessage = errorData.detail;
      } else if (errorData.error) {
        errorMessage = errorData.error;
      } else if (typeof errorData === 'object') {
        const keys = Object.keys(errorData);
        if (keys.length > 0) {
          const firstError = errorData[keys[0]];
          if (Array.isArray(firstError)) {
            errorMessage = firstError[0];
          } else if (typeof firstError === 'string') {
            errorMessage = firstError;
          }
        }
      }
      
      throw new Error(errorMessage);
    }

    if (response.status === 204) return null;
    return response.json();
    
  } catch (error) {
    if (error.message === 'Failed to fetch') {
      throw new Error('Cannot connect to server. Please make sure the backend is running on port 8000');
    }
    throw error;
  }
}

export const api = {
  get: (url, opts = {}) => apiFetch(url, { method: 'GET', ...opts }),
  post: (url, data, opts = {}) => apiFetch(url, { 
    method: 'POST', 
    body: JSON.stringify(data), 
    ...opts 
  }),
  put: (url, data, opts = {}) => apiFetch(url, { 
    method: 'PUT', 
    body: JSON.stringify(data), 
    ...opts 
  }),
  patch: (url, data, opts = {}) => apiFetch(url, { 
    method: 'PATCH', 
    body: JSON.stringify(data), 
    ...opts 
  }),
  delete: (url, opts = {}) => apiFetch(url, { method: 'DELETE', ...opts }),
  upload: (url, formData, opts = {}) => apiFetch(url, { 
    method: 'POST', 
    body: formData, 
    ...opts 
  }),
};