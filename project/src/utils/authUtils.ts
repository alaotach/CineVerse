export const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};
