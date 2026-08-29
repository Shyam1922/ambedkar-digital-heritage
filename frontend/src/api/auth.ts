const TOKEN_KEY = 'ambedkar_admin_access_token';

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch (e) {
    console.error('Failed to save auth token to localStorage', e);
  }
}

export function removeAuthToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (e) {
    console.error('Failed to remove auth token from localStorage', e);
  }
}

export function isAuthenticated(): boolean {
  return Boolean(getAuthToken());
}
