import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrashAlt, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import '../../styles/Admin/AdminSubjectsStagesTab.css';
import { getSubjects, createSubject, updateSubject, deleteSubject } from '../../api/adminSubjects';
import { getLevels, createLevel, updateLevel, deleteLevel } from '../../api/adminLevels';
import { getErrorMessage } from '../../utils/apiErrors';

// عربي + إنجليزي + أرقام + مسافات (مطابق للباك إند)
const TITLE_PATTERN = /^[\u0600-\u06FFa-zA-Z0-9\s\-']+$/;

function isValidTitle(value) {
  const trimmed = value.trim();
  return trimmed.length > 0 && TITLE_PATTERN.test(trimmed);
}

export default function AdminSubjectsStagesTab() {
  const [subjects, setSubjects] = useState([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);
  const [subjectsError, setSubjectsError] = useState('');

  const [levels, setLevels] = useState([]);
  const [isLoadingLevels, setIsLoadingLevels] = useState(true);
  const [levelsError, setLevelsError] = useState('');

  const [newSubject, setNewSubject] = useState('');
  const [newLevelTitle, setNewLevelTitle] = useState('');
  const [editingSubjectId, setEditingSubjectId] = useState(null);
  const [editingSubjectValue, setEditingSubjectValue] = useState('');
  const [editingLevelId, setEditingLevelId] = useState(null);
  const [editingLevelValue, setEditingLevelValue] = useState('');

  useEffect(() => {
    const fetchSubjects = async () => {
      setIsLoadingSubjects(true);
      setSubjectsError('');
      try {
        const response = await getSubjects();
        setSubjects(response.data);
      } catch (err) {
        setSubjectsError(getErrorMessage(err));
      } finally {
        setIsLoadingSubjects(false);
      }
    };

    const fetchLevels = async () => {
      setIsLoadingLevels(true);
      setLevelsError('');
      try {
        const response = await getLevels();
        setLevels(response.data);
      } catch (err) {
        setLevelsError(getErrorMessage(err));
      } finally {
        setIsLoadingLevels(false);
      }
    };

    fetchSubjects();
    fetchLevels();
  }, []);

  const addSubject = async () => {
    const value = newSubject.trim();
    if (!value) return;

    if (!isValidTitle(value)) {
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

    if (!isValidTitle(value)) {
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

  const addLevel = async () => {
    const value = newLevelTitle.trim();
    if (!value) return;

    if (!isValidTitle(value)) {
      setLevelsError('اسم المرحلة غير صالح. استخدم حروفاً عربية أو إنجليزية (مثال: المرحلة الابتدائية).');
      return;
    }

    if (levels.find((l) => l.level_title === value)) {
      setLevelsError('هذه المرحلة مضافة بالفعل');
      return;
    }

    setLevelsError('');
    try {
      const response = await createLevel({ level_title: value });
      setLevels((prev) => [...prev, response.data]);
      setNewLevelTitle('');
    } catch (err) {
      setLevelsError(getErrorMessage(err));
    }
  };

  const deleteLevelHandler = async (levelId) => {
    setLevelsError('');
    try {
      await deleteLevel(levelId);
      setLevels((prev) => prev.filter((l) => l.level_id !== levelId));
    } catch (err) {
      setLevelsError(getErrorMessage(err));
    }
  };

  const startEditLevel = (levelId, value) => {
    setEditingLevelId(levelId);
    setEditingLevelValue(value);
  };

  const saveEditLevel = async () => {
    const value = editingLevelValue.trim();
    if (!value) return;

    if (!isValidTitle(value)) {
      setLevelsError('اسم المرحلة غير صالح. استخدم حروفاً عربية أو إنجليزية (مثال: المرحلة الثانوية).');
      return;
    }

    setLevelsError('');
    try {
      const response = await updateLevel(editingLevelId, { level_title: value });
      setLevels((prev) => prev.map((l) => (l.level_id === editingLevelId ? response.data : l)));
    } catch (err) {
      setLevelsError(getErrorMessage(err));
    } finally {
      setEditingLevelId(null);
      setEditingLevelValue('');
    }
  };

  const cancelEditLevel = () => {
    setEditingLevelId(null);
    setEditingLevelValue('');
  };

  return (
    <div className="admin-subjects-stages-tab">
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
          <button type="button" onClick={addSubject}><FaPlus /> إضافة مادة</button>
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
                    <button type="button" onClick={saveEditSubject}><FaSave /></button>
                    <button type="button" onClick={cancelEditSubject}><FaTimes /></button>
                  </div>
                ) : (
                  <>
                    <span className="item-name">{subject.subject_title}</span>
                    <div className="item-actions">
                      <button type="button" onClick={() => startEditSubject(subject.subject_id, subject.subject_title)}><FaEdit /></button>
                      <button type="button" onClick={() => deleteSubjectHandler(subject.subject_id)}><FaTrashAlt /></button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="stages-section">
        <h2>المراحل الدراسية</h2>
        <p className="admin-inline-alert admin-inline-alert--info">
          المراحل محفوظة على السيرفر وتُستخدم في طلبات الطلاب وتسجيل المعلّمين. يمكنك إدخال الاسم بالعربية أو الإنجليزية.
        </p>
        {levelsError && (
          <div className="admin-inline-alert admin-inline-alert--error" role="alert">
            {levelsError}
          </div>
        )}
        <div className="add-item-row">
          <input
            type="text"
            placeholder="مثال: المرحلة الابتدائية أو Grade9"
            value={newLevelTitle}
            onChange={(e) => setNewLevelTitle(e.target.value)}
          />
          <button type="button" onClick={addLevel}><FaPlus /> إضافة مرحلة</button>
        </div>

        {isLoadingLevels ? (
          <p>جارِ تحميل المراحل...</p>
        ) : (
          <div className="items-grid">
            {levels.length === 0 && (
              <p className="empty-hint">لا توجد مراحل بعد. أضف مرحلة جديدة أعلاه.</p>
            )}
            {levels.map((level) => (
              <div key={level.level_id} className="item-card">
                {editingLevelId === level.level_id ? (
                  <div className="edit-mode">
                    <input
                      type="text"
                      value={editingLevelValue}
                      onChange={(e) => setEditingLevelValue(e.target.value)}
                    />
                    <button type="button" onClick={saveEditLevel}><FaSave /></button>
                    <button type="button" onClick={cancelEditLevel}><FaTimes /></button>
                  </div>
                ) : (
                  <>
                    <span className="item-name">{level.level_title}</span>
                    <div className="item-actions">
                      <button type="button" onClick={() => startEditLevel(level.level_id, level.level_title)}><FaEdit /></button>
                      <button type="button" onClick={() => deleteLevelHandler(level.level_id)}><FaTrashAlt /></button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
