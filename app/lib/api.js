export function getApiBaseUrl() {
  return process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:8000';
}

export function authHeaders(accessToken) {
  if (!accessToken) return {};
  return { Authorization: `Bearer ${accessToken}` };
}
