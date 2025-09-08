export const authErrorMessages = {
  'auth/user-not-found': 'No account found with this email address.',
  'auth/wrong-password': 'Incorrect password. Please try again.',
  'auth/invalid-credential': 'Invalid email or password. Please check your credentials and try again.',
  'auth/email-already-in-use': 'An account with this email already exists. Try signing in instead.',
  'auth/weak-password': 'Password should be at least 6 characters long.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/too-many-requests': 'Too many failed attempts. Please wait a moment before trying again.',
  'auth/user-disabled': 'This account has been disabled. Please contact support.',
  'auth/operation-not-allowed': 'This sign-in method is not enabled. Please contact support.',
  'auth/network-request-failed': 'Network error. Please check your internet connection and try again.',
  'auth/timeout': 'Request timed out. Please try again.',
  'auth/configuration-not-found': 'Authentication service is not properly configured. Please contact support.',
  'auth/invalid-api-key': 'Invalid API configuration. Please contact support.',
  'auth/popup-closed-by-user': 'Sign-in popup was closed before completion.',
  'auth/popup-blocked': 'Sign-in popup was blocked. Please allow popups and try again.',
  'auth/cancelled-popup-request': 'Only one popup request is allowed at one time.',
  'auth/account-exists-with-different-credential': 'An account already exists with the same email but different sign-in credentials.',
  'auth/requires-recent-login': 'Please sign out and sign in again to perform this action.',
  'auth/missing-email': 'Please enter your email address.',
  'auth/unauthorized-domain': 'This domain is not authorized for authentication. Please contact support.',
};

export const getAuthErrorMessage = (errorCode) => {
  return authErrorMessages[errorCode] || `Authentication failed (${errorCode}). Please try again or contact support if the problem persists.`;
};

export const handleAuthError = (error) => {
  console.error('Auth Error:', error);
  return getAuthErrorMessage(error.code);
};
