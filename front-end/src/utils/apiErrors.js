export function parseValidationErrors(error) {
  if (error?.response?.data?.errors) {
    return error.response.data.errors;
  }
  return {};
}

export function getErrorMessage(error) {
  const data = error?.response?.data;
  if (typeof data?.detail === 'string') return data.detail;
  if (typeof data?.message === 'string') return data.message;
  return error?.message || 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.';
}
