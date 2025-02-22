
const CLIENT_ID = ''; // Add your Google OAuth client ID here
const REDIRECT_URI = window.location.origin;
const SCOPES = ['https://www.googleapis.com/auth/calendar.events'];

export function initiateGoogleAuth() {
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=token&scope=${SCOPES.join(' ')}`;
  window.location.href = authUrl;
}

export function handleAuthCallback() {
  const hash = window.location.hash;
  if (hash) {
    const params = new URLSearchParams(hash.substring(1));
    const accessToken = params.get('access_token');
    if (accessToken) {
      localStorage.setItem('google_access_token', accessToken);
      // Clear the URL hash
      window.history.pushState('', document.title, window.location.pathname);
      return true;
    }
  }
  return false;
}

export function isAuthenticated() {
  return !!localStorage.getItem('google_access_token');
}
