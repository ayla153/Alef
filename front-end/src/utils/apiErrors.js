const FIELD_LABELS = {
  subject_title: 'اسم المادة',
  subject_description: 'وصف المادة',
  level_title: 'اسم المرحلة',
  email: 'البريد الإلكتروني',
  password: 'كلمة السر',
};

function formatValidationItem(item) {
  if (typeof item === 'string') return item;

  const field = item?.loc?.filter((part) => typeof part === 'string').pop();
  const label = FIELD_LABELS[field] || field;
  const message = item?.msg || item?.message;

  if (typeof message === 'string' && /[\u0600-\u06FF]/.test(message)) {
    return label ? `${label}: ${message}` : message;
  }

  if (message?.includes('match pattern') || message?.includes('string_pattern')) {
    return label
      ? `${label}: الصيغة غير مقبولة. استخدم حروفاً عربية أو إنجليزية فقط.`
      : 'الصيغة غير مقبولة. استخدم حروفاً عربية أو إنجليزية فقط.';
  }

  if (message?.includes('at least') || message?.includes('too_short')) {
    return label ? `${label}: النص قصير جداً.` : 'النص قصير جداً.';
  }

  return label && message ? `${label}: ${message}` : message || 'بيانات غير صالحة.';
}

export function parseValidationErrors(error) {
  if (error?.response?.data?.errors) {
    return error.response.data.errors;
  }
  return {};
}

export function getErrorMessage(error) {
  const data = error?.response?.data;

  if (typeof data?.detail === 'string') return data.detail;

  if (Array.isArray(data?.detail)) {
    const messages = data.detail.map(formatValidationItem).filter(Boolean);
    if (messages.length) return messages.join(' — ');
  }

  if (typeof data?.message === 'string') return data.message;

  const status = error?.response?.status;
  if (status === 401) return 'بيانات الدخول غير صحيحة. تحقق من البريد وكلمة السر.';
  if (status === 403) return 'ليس لديك صلاحية لتنفيذ هذا الإجراء.';
  if (status === 404) return 'العنصر المطلوب غير موجود.';
  if (status === 409) return 'تعارض في البيانات. ربما العنصر مستخدم أو موجود مسبقاً.';
  if (status === 422) return 'تحقق من الحقول وأعد المحاولة.';

  return error?.message || 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.';
}
