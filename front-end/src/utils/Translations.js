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

// خريطة المواد (للترجمة فقط، وليست مصدر البيانات الأساسي)
const SUBJECT_MAP = {
  'Mathematics': 'الرياضيات',
  'Math': 'الرياضيات',
  'Physics': 'الفيزياء',
  'Chemistry': 'الكيمياء',
  'Biology': 'الأحياء',
  'Arabic': 'اللغة العربية',
  'English': 'اللغة الإنجليزية',
  'French': 'اللغة الفرنسية',
  'Science': 'العلوم',
  'Islamic Education': 'التربية الإسلامية',
  'Islamic Studies': 'الدراسات الإسلامية',
  'History': 'التاريخ',
  'Geography': 'الجغرافيا',
  'Civic Education': 'التربية الوطنية',
  'Civics': 'التربية الوطنية',
  'Computer Science': 'المعلوماتية',
  'Informatics': 'المعلوماتية',
  'ICT': 'تقنية المعلومات',
  'Social Studies': 'الدراسات الاجتماعية',
  'Art': 'التربية الفنية',
  'Music': 'الموسيقى',
  'Physical Education': 'التربية الرياضية',
};

export const translateSubject = (title) => {
  if (!title) return null; // إذا كان العنوان فارغاً، نُرجع null
  // إذا كان النص موجوداً في الخريطة، نرجعه مترجماً
  if (SUBJECT_MAP[title]) return SUBJECT_MAP[title];
  // إذا كان النص عربياً (يحتوي على أحرف عربية) نرجعه كما هو
  if (/[\u0600-\u06FF]/.test(title)) return title;
  // وإلا نرجعه كما هو (ربما يكون اسم مادة غير موجود في الخريطة)
  return title;
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
  return amount.toLocaleString('ar-SA') + ' ل.س';
};

export const formatDate = (dateString) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};