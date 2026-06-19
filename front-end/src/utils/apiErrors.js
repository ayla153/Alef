export function parseValidationErrors(error) {
  if (error?.response?.data?.errors) {
    return error.response.data.errors;
  }
  return {};
}

export function getErrorMessage(error) {
  return error?.response?.data?.message || error?.message || 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.';
}
