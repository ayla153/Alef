import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrashAlt, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import '../../styles/Admin/AdminSubjectsStagesTab.css';
import { getSubjects, createSubject, updateSubject, deleteSubject } from '../../api/adminSubjects';
import { getErrorMessage } from '../../utils/apiErrors';

// قائمة المراحل تبقى محلية مؤقتاً: لا يوجد Endpoint بالباك إند لإدارة "مراحل" كـ CRUD ديناميكي.
// المراحل بالباك إند مجرد 3 أعلام ثابتة (elementory_stage / middle_stage / high_stage) مدمجة
// داخل بيانات tutor_subjects، وليست كياناً مستقلاً يمكن إضافة/حذف/تعديل عناصر منه.
// لازم يضاف Endpoint مخصص بالباك إند حتى يصير هاد القسم فعلياً متصل.
const initialStages = [
  { id: 1, name: 'المرحلة الابتدائية', details: 'السنة 5 - الأكمل 11-15' },
  { id: 2, name: 'المرحلة المتوسطة', details: 'العام 6 - الأكمل 14-18' },
  { id: 3, name: 'المرحلة الثانوية', details: 'السنة 9 - الأكمل 12-14' }
];

// عربي + إنجليزي + أرقام + مسافات (مطابق للباك إند)
const SUBJECT_TITLE_PATTERN = /^[\u0600-\u06FFa-zA-Z0-9\s\-']+$/;

function isValidSubjectTitle(value) {
  const trimmed = value.trim();
  return trimmed.length > 0 && SUBJECT_TITLE_PATTERN.test(trimmed);
}

export default function AdminSubjectsStagesTab() {
  const [subjects, setSubjects] = useState([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);
  const [subjectsError, setSubjectsError] = useState('');

  const [stages, setStages] = useState(initialStages);
  const [newSubject, setNewSubject] = useState('');
  const [newStageName, setNewStageName] = useState('');
  const [newStageDetails, setNewStageDetails] = useState('');
  const [editingSubjectId, setEditingSubjectId] = useState(null);
  const [editingSubjectValue, setEditingSubjectValue] = useState('');
  const [editingStageIndex, setEditingStageIndex] = useState(null);
  const [editingStageName, setEditingStageName] = useState('');
  const [editingStageDetails, setEditingStageDetails] = useState('');

  useEffect(() => {
    const fetchSubjects = async () => {
      setIsLoadingSubjects(true);
      setSubjectsError('');
      try {
        const response = await getSubjects();
        setSubjects(response.data); // كل عنصر: { subject_id, subject_title, subject_description }
      } catch (err) {
        setSubjectsError(getErrorMessage(err));
      } finally {
        setIsLoadingSubjects(false);
      }
    };

    fetchSubjects();
  }, []);

  // ===== دوال المواد (مربوطة فعلياً بالباك إند) =====
  const addSubject = async () => {
    const value = newSubject.trim();
    if (!value) return;

    if (!isValidSubjectTitle(value)) {
      setSubjectsError('اسم المادة غير صالح. استخدم حروفاً عربية أو إنجليزية مع أرقام أو مسافات (مثال: الرياضيات).');
      return;
    }

    if (subjects.find((s) => s.subject_title === value)) {
      setSubjectsError('هذه المادة مضافة بالفعل');
      return;
    }

    setSubjectsError('');
    try {
      const response = await createSubject({ subject_title: value });
      setSubjects((prev) => [...prev, response.data]);
      setNewSubject('');
    } catch (err) {
      setSubjectsError(getErrorMessage(err));
    }
  };

  const deleteSubjectHandler = async (subjectId) => {
    setSubjectsError('');
    try {
      await deleteSubject(subjectId);
      setSubjects((prev) => prev.filter((s) => s.subject_id !== subjectId));
    } catch (err) {
      setSubjectsError(getErrorMessage(err));
    }
  };

  const startEditSubject = (subjectId, value) => {
    setEditingSubjectId(subjectId);
    setEditingSubjectValue(value);
  };

  const saveEditSubject = async () => {
    const value = editingSubjectValue.trim();
    if (!value) return;

    if (!isValidSubjectTitle(value)) {
      setSubjectsError('اسم المادة غير صالح. استخدم حروفاً عربية أو إنجليزية (مثال: الفيزياء).');
      return;
    }

    setSubjectsError('');
    try {
      const response = await updateSubject(editingSubjectId, { subject_title: value });
      setSubjects((prev) => prev.map((s) => (s.subject_id === editingSubjectId ? response.data : s)));
    } catch (err) {
      setSubjectsError(getErrorMessage(err));
    } finally {
      setEditingSubjectId(null);
      setEditingSubjectValue('');
    }
  };

  const cancelEditSubject = () => {
    setEditingSubjectId(null);
    setEditingSubjectValue('');
  };

  // ===== دوال المراحل (محلية فقط حالياً - راجع الملاحظة أعلى الملف) =====
  const addStage = () => {
    if (newStageName.trim()) {
      const newId = stages.length > 0 ? Math.max(...stages.map((s) => s.id)) + 1 : 4;
      setStages([...stages, { id: newId, name: newStageName.trim(), details: newStageDetails.trim() }]);
      setNewStageName('');
      setNewStageDetails('');
    }
  };

  const deleteStage = (id) => {
    setStages(stages.filter((s) => s.id !== id));
  };

  const startEditStage = (stage) => {
    setEditingStageIndex(stage.id);
    setEditingStageName(stage.name);
    setEditingStageDetails(stage.details);
  };

  const saveEditStage = () => {
    if (editingStageName.trim()) {
      const updated = stages.map((s) =>
        s.id === editingStageIndex ? { ...s, name: editingStageName.trim(), details: editingStageDetails.trim() } : s
      );
      setStages(updated);
    }
    setEditingStageIndex(null);
    setEditingStageName('');
    setEditingStageDetails('');
  };

  const cancelEditStage = () => {
    setEditingStageIndex(null);
    setEditingStageName('');
    setEditingStageDetails('');
  };

  return (
    <div className="admin-subjects-stages-tab">
      {/* قسم المواد */}
      <div className="subjects-section">
        <h2>المواد الدراسية</h2>
        {subjectsError && (
          <div className="admin-inline-alert admin-inline-alert--error" role="alert">
            {subjectsError}
          </div>
        )}
        <div className="add-item-row">
          <input
            type="text"
            placeholder="مثال: الرياضيات أو Mathematics"
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
          />
          <button onClick={addSubject}><FaPlus /> إضافة مادة</button>
        </div>

        {isLoadingSubjects ? (
          <p>جارِ تحميل المواد...</p>
        ) : (
          <div className="items-grid">
            {subjects.map((subject) => (
              <div key={subject.subject_id} className="item-card">
                {editingSubjectId === subject.subject_id ? (
                  <div className="edit-mode">
                    <input
                      type="text"
                      value={editingSubjectValue}
                      onChange={(e) => setEditingSubjectValue(e.target.value)}
                    />
                    <button onClick={saveEditSubject}><FaSave /></button>
                    <button onClick={cancelEditSubject}><FaTimes /></button>
                  </div>
                ) : (
                  <>
                    <span className="item-name">{subject.subject_title}</span>
                    <div className="item-actions">
                      <button onClick={() => startEditSubject(subject.subject_id, subject.subject_title)}><FaEdit /></button>
                      <button onClick={() => deleteSubjectHandler(subject.subject_id)}><FaTrashAlt /></button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* قسم المراحل */}
      <div className="stages-section">
        <h2>المراحل الدراسية</h2>
        <p className="backend-limitation-note">
          * هذا القسم محلي مؤقتاً (غير محفوظ على السيرفر) — لا يوجد بالباك إند الحالي كيان مستقل لإدارة المراحل،
          فقط أعلام ثابتة (ابتدائي/متوسط/ثانوي) ضمن بيانات مواد كل معلّم. لازم إضافة Endpoint مخصص حتى يُحفظ فعلياً.
        </p>
        <div className="add-item-row">
          <input
            type="text"
            placeholder="اسم المرحلة الجديدة"
            value={newStageName}
            onChange={(e) => setNewStageName(e.target.value)}
          />
          <input
            type="text"
            placeholder="تفاصيل المرحلة (اختياري)"
            value={newStageDetails}
            onChange={(e) => setNewStageDetails(e.target.value)}
          />
          <button onClick={addStage}><FaPlus /> إضافة مرحلة</button>
        </div>
        <div className="items-grid">
          {stages.map((stage) => (
            <div key={stage.id} className="stage-card">
              {editingStageIndex === stage.id ? (
                <div className="edit-mode">
                  <input
                    type="text"
                    value={editingStageName}
                    onChange={(e) => setEditingStageName(e.target.value)}
                    placeholder="اسم المرحلة"
                  />
                  <input
                    type="text"
                    value={editingStageDetails}
                    onChange={(e) => setEditingStageDetails(e.target.value)}
                    placeholder="تفاصيل"
                  />
                  <button onClick={saveEditStage}><FaSave /></button>
                  <button onClick={cancelEditStage}><FaTimes /></button>
                </div>
              ) : (
                <>
                  <div className="stage-info">
                    <span className="stage-name">{stage.name}</span>
                    {stage.details && <span className="stage-details">{stage.details}</span>}
                  </div>
                  <div className="item-actions">
                    <button onClick={() => startEditStage(stage)}><FaEdit /></button>
                    <button onClick={() => deleteStage(stage.id)}><FaTrashAlt /></button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}