
const CLIENT_ID = '343076327600-thdrgnptpi95ql4gveuokqv2r5ujnr68.apps.googleusercontent.com';
const REDIRECT_URI = window.location.origin;
const SCOPES = ['https://www.googleapis.com/auth/calendar.events', 'https://www.googleapis.com/auth/calendar.readonly'];

export function initiateGoogleAuth() {
  try {
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=token&scope=${SCOPES.join(' ')}&prompt=consent`;
    console.log('Redirecting to:', authUrl); // Debug log
    window.location.href = authUrl;
  } catch (error) {
    console.error('Auth initialization error:', error);
    throw error;
  }
}

export function handleAuthCallback() {
  try {
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');
      const error = params.get('error');
      
      if (error) {
        console.error('Auth callback error:', error);
        return false;
      }
      
      if (accessToken) {
        localStorage.setItem('google_access_token', accessToken);
        window.history.pushState('', document.title, window.location.pathname);
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Auth callback handling error:', error);
    return false;
  }
}

export function isAuthenticated() {
  return !!localStorage.getItem('google_access_token');
}
