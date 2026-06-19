import React, { useState } from 'react';
import { FaPlus, FaTrashAlt, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import '../../styles/Admin/AdminSubjectsStagesTab.css';

// قائمة المواد الأولية (كما وردت في الطلب)
const initialSubjects = [
  'الرياضيات', 'اللغة العربية', 'اللغة الانكليزية', 'اللغة الفرنسية',
  'العلوم', 'الفيزياء', 'الكيمياء', 'ديانة',
  'التاريخ', 'الجغرافية', 'الوطنية', 'معلوماتية'
];

// قائمة المراحل الأولية (مع التفاصيل)
const initialStages = [
  { id: 1, name: 'المرحلة الابتدائية', details: 'السنة 5 - الأكمل 11-15' },
  { id: 2, name: 'المرحلة المتوسطة', details: 'العام 6 - الأكمل 14-18' },
  { id: 3, name: 'المرحلة الثانوية', details: 'السنة 9 - الأكمل 12-14' }
];

export default function AdminSubjectsStagesTab() {
  const [subjects, setSubjects] = useState(initialSubjects);
  const [stages, setStages] = useState(initialStages);
  const [newSubject, setNewSubject] = useState('');
  const [newStageName, setNewStageName] = useState('');
  const [newStageDetails, setNewStageDetails] = useState('');
  const [editingSubjectIndex, setEditingSubjectIndex] = useState(null);
  const [editingSubjectValue, setEditingSubjectValue] = useState('');
  const [editingStageIndex, setEditingStageIndex] = useState(null);
  const [editingStageName, setEditingStageName] = useState('');
  const [editingStageDetails, setEditingStageDetails] = useState('');

  // دوال المواد
  const addSubject = () => {
    if (newSubject.trim() && !subjects.includes(newSubject.trim())) {
      setSubjects([...subjects, newSubject.trim()]);
      setNewSubject('');
    }
  };

  const deleteSubject = (index) => {
    setSubjects(subjects.filter((_, i) => i !== index));
  };

  const startEditSubject = (index, value) => {
    setEditingSubjectIndex(index);
    setEditingSubjectValue(value);
  };

  const saveEditSubject = () => {
    if (editingSubjectValue.trim() && !subjects.includes(editingSubjectValue.trim())) {
      const updated = [...subjects];
      updated[editingSubjectIndex] = editingSubjectValue.trim();
      setSubjects(updated);
    }
    setEditingSubjectIndex(null);
    setEditingSubjectValue('');
  };

  const cancelEditSubject = () => {
    setEditingSubjectIndex(null);
    setEditingSubjectValue('');
  };

  // دوال المراحل
  const addStage = () => {
    if (newStageName.trim()) {
      const newId = stages.length > 0 ? Math.max(...stages.map(s => s.id)) + 1 : 4;
      setStages([...stages, { id: newId, name: newStageName.trim(), details: newStageDetails.trim() }]);
      setNewStageName('');
      setNewStageDetails('');
    }
  };

  const deleteStage = (id) => {
    setStages(stages.filter(s => s.id !== id));
  };

  const startEditStage = (stage) => {
    setEditingStageIndex(stage.id);
    setEditingStageName(stage.name);
    setEditingStageDetails(stage.details);
  };

  const saveEditStage = () => {
    if (editingStageName.trim()) {
      const updated = stages.map(s => 
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
        <div className="add-item-row">
          <input
            type="text"
            placeholder="اسم المادة الجديدة"
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
          />
          <button onClick={addSubject}><FaPlus /> إضافة مادة</button>
        </div>
        <div className="items-grid">
          {subjects.map((subject, idx) => (
            <div key={idx} className="item-card">
              {editingSubjectIndex === idx ? (
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
                  <span className="item-name">{subject}</span>
                  <div className="item-actions">
                    <button onClick={() => startEditSubject(idx, subject)}><FaEdit /></button>
                    <button onClick={() => deleteSubject(idx)}><FaTrashAlt /></button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* قسم المراحل */}
      <div className="stages-section">
        <h2>المراحل الدراسية</h2>
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
          {stages.map(stage => (
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