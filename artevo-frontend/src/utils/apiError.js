/**
 * Get a user-facing error message from an API error.
 * Backend returns { message: "..." } for errors.
 */
export function getErrorMessage(error, fallback = 'Something went wrong') {
  if (!error || !error.response) {
    return error?.message || fallback;
  }
  const data = error.response.data;
  if (typeof data === 'string') {
    return data.replace(/^Error:\s*/i, '').trim() || fallback;
  }
  if (data && typeof data.message === 'string') {
    return data.message;
  }
  const status = error.response.status;
  if (status === 401) return 'Invalid email or password';
  if (status === 403) return 'Access denied';
  if (status === 404) return 'Not found';
  if (status >= 500) return 'Server error. Please try again.';
  return fallback;
}
