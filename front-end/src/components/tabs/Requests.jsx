// src/components/tabs/Requests.jsx
import React, { useState } from 'react';
import RequestCard from '../RequestCard';
import '../../styles/Requests.css';

// اسم الأستاذ الحالي (غيّره حسب المستخدم الفعلي)
const CURRENT_TUTOR = 'أحمد محمد';

// المواد الثابتة للفلتر
const allSubjects = [
  'الرياضيات', 'اللغة العربية', 'اللغة الانكليزية', 'اللغة الفرنسية',
  'العلوم', 'الفيزياء', 'الكيمياء', 'التربية الاسلامية',
  'التاريخ', 'الجغرافية', 'الوطنية', 'معلوماتية'
];

const allLevels = ['المرحلة الابتدائية', 'المرحلة المتوسطة', 'المرحلة الثانوية'];

// بيانات تجريبية
const mockRequests = [
  {
    id: 1,
    studentName: 'أحمد السالم',
    subject: 'الرياضيات',
    level: 'المرحلة الثانوية',
    teachingMethod: 'online',
    helpType: 'شرح دروس',
    genderPreference: 'male',
    sessionsPerWeek: 3,
    suitableTime: 'المساء (6-9 م)',
    budget: 250000,
    description: 'أحتاج مساعدة في التفاضل والتكامل.',
    status: 'open',
    requestType: 'private',
    targetTutor: 'أحمد محمد',
    deadline: '2025-06-15',
  },
  {
    id: 2,
    studentName: 'نورا علي',
    subject: 'الفيزياء',
    level: 'المرحلة الثانوية',
    teachingMethod: 'offline',
    helpType: 'تحضير امتحانات',
    genderPreference: '',
    sessionsPerWeek: 2,
    suitableTime: 'الصباح (9-12 ص)',
    budget: 300000,
    description: 'مراجعة شاملة لمادة الفيزياء العامة.',
    status: 'slots_full',
    requestType: 'public',
    targetTutor: null,
    deadline: '2025-06-10',
  },
  {
    id: 3,
    studentName: 'سعاد محمود',
    subject: 'اللغة العربية',
    level: 'المرحلة المتوسطة',
    teachingMethod: 'online',
    helpType: 'تأسيس',
    genderPreference: 'female',
    sessionsPerWeek: 4,
    suitableTime: 'العصر (3-6 م)',
    budget: 150000,
    description: 'تعليم قواعد النحو والصرف من الصفر.',
    status: 'open',
    requestType: 'private',
    targetTutor: 'سارة خالد',
    deadline: '2025-06-20',
  },
  {
    id: 4,
    studentName: 'خالد ياسر',
    subject: 'الكيمياء',
    level: 'المرحلة الثانوية',
    teachingMethod: 'online',
    helpType: 'حل مسائل',
    genderPreference: '',
    sessionsPerWeek: 2,
    suitableTime: 'المساء (6-9 م)',
    budget: 200000,
    description: 'حل مسائل كيمياء عضوية.',
    status: 'open',
    requestType: 'public',
    targetTutor: null,
    deadline: '2025-06-05',
  },
  {
    id: 5,
    studentName: 'ليلى كريم',
    subject: 'التاريخ',
    level: 'المرحلة المتوسطة',
    teachingMethod: 'offline',
    helpType: 'بحث',
    genderPreference: 'male',
    sessionsPerWeek: 1,
    suitableTime: 'الصباح (9-12 ص)',
    budget: 180000,
    description: 'مساعدة في إعداد بحث عن الحضارة الإسلامية.',
    status: 'slots_full',
    requestType: 'private',
    targetTutor: 'أحمد محمد',
    deadline: '2025-06-02',
  },
  {
    id: 6,
    studentName: 'رنا إبراهيم',
    subject: 'اللغة الإنجليزية',
    level: 'المرحلة الابتدائية',
    teachingMethod: 'online',
    helpType: 'محادثة',
    genderPreference: '',
    sessionsPerWeek: 3,
    suitableTime: 'العصر (3-6 م)',
    budget: 220000,
    description: 'تحسين مهارات المحادثة والاستماع.',
    status: 'open',
    requestType: 'public',
    targetTutor: null,
    deadline: '2025-06-25',
  },
];

export default function Requests() {
  const [requests] = useState(mockRequests);
  const [filterSubject, setFilterSubject] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [filterType, setFilterType] = useState('');

  const filteredRequests = requests.filter(request => {
    if (filterSubject && request.subject !== filterSubject) return false;
    if (filterLevel && request.level !== filterLevel) return false;
    if (filterType === 'public') return request.requestType === 'public';
    if (filterType === 'private') return request.requestType === 'private' && request.targetTutor === CURRENT_TUTOR;
    return true;
  });

  const handleResetFilters = () => {
    setFilterSubject('');
    setFilterLevel('');
    setFilterType('');
  };

  return (
    <div className="page-container2">
      <div className="requests-tab-container">
        <div className="filters-bar">
          <select value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)}>
            <option value="">جميع المواد</option>
            {allSubjects.map(sub => <option key={sub} value={sub}>{sub}</option>)}
          </select>
          <select value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)}>
            <option value="">جميع المراحل</option>
            {allLevels.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
          </select>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="">جميع الطلبات</option>
            <option value="public">طلبات عامة</option>
            <option value="private">طلبات خاصة بي</option>
          </select>
          <button className="reset-btn" onClick={handleResetFilters}>إعادة ضبط</button>
        </div>

        <div className="requests-grid">
          {filteredRequests.length > 0 ? (
            filteredRequests.map(req => <RequestCard key={req.id} request={req} />)
          ) : (
            <p className="no-results">لا توجد طلبات تطابق معايير البحث.</p>
          )}
        </div>
      </div>
    </div>
  );
}