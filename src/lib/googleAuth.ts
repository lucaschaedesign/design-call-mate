
const CLIENT_ID = '369653276436-7qbv3o2egop5vvl810ntn0fn72jg3925.apps.googleusercontent.com'; // Your Google OAuth client ID
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
