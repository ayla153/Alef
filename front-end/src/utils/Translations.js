// src/utils/translations.js
export const tuitionTypeAr = {
  online: 'تدريس أونلاين',
  offline: 'تدريس حضوري',
  both: 'أونلاين وحضوري',
};

export const genderPrefAr = {
  male: 'يفضّل مدرّسًا ذكر',
  female: 'يفضّل مدرّسة أنثى',
};

export const leadStatusAr = {
  open: 'مفتوح',
  closed_shortlist: 'قائمة مختصرة',
  closed_empty: 'مغلق بلا تطابق',
  closed_matched: 'تم التواصل',
  closed_expired: 'انتهت مدته',
};

// خريطة المواد (للترجمة الاحتياطية)
const SUBJECT_MAP = {
  Mathematics: 'الرياضيات',
  Math: 'الرياضيات',
  Physics: 'الفيزياء',
  Chemistry: 'الكيمياء',
  Biology: 'الأحياء',
  Arabic: 'اللغة العربية',
  English: 'اللغة الإنجليزية',
  French: 'اللغة الفرنسية',
  Science: 'العلوم',
  'Islamic Education': 'التربية الإسلامية',
  History: 'التاريخ',
  Geography: 'الجغرافيا',
  'Civic Education': 'التربية الوطنية',
  'Computer Science': 'المعلوماتية',
  Informatics: 'المعلوماتية',
};

export const translateSubject = (title) => {
  if (!title) return null;
  return SUBJECT_MAP[title] || title;
};

// خريطة المستويات
const LEVEL_MAP = {
  primary: 'ابتدائية',
  elementary: 'ابتدائية',
  middle: 'متوسطة',
  intermediate: 'متوسطة',
  high: 'ثانوية',
  secondary: 'ثانوية',
  foundation: 'تأسيس',
};

export const translateLevel = (title) => {
  if (!title) return null;
  const lower = title.toLowerCase();
  for (const [key, val] of Object.entries(LEVEL_MAP)) {
    if (lower.includes(key)) return val;
  }
  return title;
};

export const formatCurrency = (amount) => {
  if (amount == null) return 'غير محدد';
  return amount.toLocaleString('ar-SY') + ' ل.س';
};

/** سعر الساعة للكروت — يُرجع «—» إذا الطريقة غير متاحة أو السعر غير موجود */
export const formatHourlyPrice = (amount, enabled = true) => {
  if (!enabled) return '—';
  if (amount == null || amount === '') return '—';
  const n = Number(amount);
  if (Number.isNaN(n)) return '—';
  return `${n.toLocaleString('ar-SY')} ل.س`;
};

/** نطاق سعر الساعة (أرخص مادة → أغلى مادة) بالليرة السورية */
export const formatHourlyPriceRange = (min, max, enabled = true) => {
  if (!enabled) return '—';
  const lo = min ?? max;
  const hi = max ?? min;
  if (lo == null && hi == null) return '—';
  const nMin = Number(lo);
  const nMax = Number(hi);
  if (Number.isNaN(nMin) || Number.isNaN(nMax)) return '—';
  if (nMin === nMax) return `${nMin.toLocaleString('ar-SY')} ل.س`;
  return `${nMin.toLocaleString('ar-SY')} - ${nMax.toLocaleString('ar-SY')} ل.س`;
};

export const formatDate = (dateString) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};