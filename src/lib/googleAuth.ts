
const CLIENT_ID = '343076327600-thdrgnptpi95ql4gveuokqv2r5ujnr68.apps.googleusercontent.com';
const REDIRECT_URI = window.location.origin;
const SCOPES = ['https://www.googleapis.com/auth/calendar.events', 'https://www.googleapis.com/auth/calendar.readonly'];

export function initiateGoogleAuth() {
  try {
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=token&scope=${SCOPES.join(' ')}&prompt=consent&access_type=online`;
    console.log('Redirecting to:', authUrl);
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
      const expiresIn = params.get('expires_in');
      const error = params.get('error');
      
      if (error) {
        console.error('Auth callback error:', error);
        return false;
      }
      
      if (accessToken && expiresIn) {
        const expirationTime = Date.now() + Number(expiresIn) * 1000;
        localStorage.setItem('google_access_token', accessToken);
        localStorage.setItem('token_expiration', expirationTime.toString());
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
  const token = localStorage.getItem('google_access_token');
  const expiration = localStorage.getItem('token_expiration');
  
  if (!token || !expiration) {
    return false;
  }

  // Check if token is expired (with 5 minute buffer)
  const isExpired = Date.now() > (Number(expiration) - 300000); // 5 minutes buffer
  if (isExpired) {
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('token_expiration');
    return false;
  }

  return true;
}

export function clearAuth() {
  localStorage.removeItem('google_access_token');
  localStorage.removeItem('token_expiration');
}

