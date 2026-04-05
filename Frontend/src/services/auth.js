export const saveToken = (token) => localStorage.setItem('token', token);

export const getToken = () => localStorage.getItem('token');

export const removeToken = () => localStorage.removeItem('token');

export const decodeToken = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
};

export const getRole = () => {
  const token = getToken();
  if (!token) return null;
  const decoded = decodeToken(token);
  return decoded?.role || null;
};

export const getEmail = () => {
  const token = getToken();
  if (!token) return null;
  const decoded = decodeToken(token);
  return decoded?.sub || null;
};

export const isAuthenticated = () => !!getToken();
