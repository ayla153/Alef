import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Admin/AdminAcceptedTeachersTab.css';

const mockAccepted = [
  {
    id: 2,
    firstname: 'سارة',
    lastname: 'خالد',
    email: 'sara@example.com',
    phone: '+963911111111',
    yearsExperience: 8,
    subjects: [{ name: 'لغة عربية', years: 8 }],
    bio: 'مدرسة لغة عربية متميزة، خبرة 8 سنوات في تدريس المراحل المتوسطة والثانوية.',
    certificates: ['شهادة ماجستير لغة عربية.pdf'],
    teachingMethods: { online: true, offline: true },
    stagesPrices: [
      { stage: 'المرحلة الابتدائية', price: 250000 },
      { stage: 'المرحلة المتوسطة', price: 350000 },
      { stage: 'المرحلة الثانوية', price: 450000 }
    ]
  }
];

export default function AdminAcceptedTeachersTab() {
  const [teachers, setTeachers] = useState(mockAccepted);
  const navigate = useNavigate();

  const handleViewTeacher = (id) => {
    navigate(`/admin/teacher/${id}`);
  };

  const handleDeleteTeacher = (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المعلم؟ لا يمكن التراجع عن هذا الإجراء.')) {
      setTeachers(prev => prev.filter(teacher => teacher.id !== id));
      // هنا يمكن إضافة استدعاء API للحذف من الخادم
    }
  };

  return (
    <div className="accepted-teachers-tab">
      <div className="teachers-table">
        <div className="table-header">
          <span>المعلم</span>
          <span>البريد الإلكتروني</span>
          <span>الهاتف</span>
          <span>سنوات الخبرة</span>
          <span>المواد</span>
          <span>الإجراءات</span>
        </div>
        {teachers.map(teacher => (
          <div key={teacher.id} className="table-row">
            <span>{teacher.firstname} {teacher.lastname}</span>
            <span>{teacher.email}</span>
            <span>{teacher.phone}</span>
            <span>{teacher.yearsExperience}</span>
            <span>{teacher.subjects.map(s => s.name).join(', ')}</span>
            <div className="action-buttons">
              <button className="view-btn" onClick={() => handleViewTeacher(teacher.id)}>عرض الملف</button>
              <button className="delete-btn" onClick={() => handleDeleteTeacher(teacher.id)}>حذف</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}