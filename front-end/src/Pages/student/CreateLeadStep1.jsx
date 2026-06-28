<<<<<<< HEAD
import  { useState } from "react";
=======
import React, { useState, useEffect } from "react";
>>>>>>> 08fb0ef8590864a2a7562696d77c458ea0db2dda
import "../../styles/sstyle/CreateLeadStep1.css";
import Header from "../../components/Header";
import api from "../../api/api.js";

// ─── ترجمة المواد للعربية ────────────────────────────────────
const SUBJECT_TRANSLATIONS = {
  Mathematics: "الرياضيات",
  Physics: "الفيزياء",
  Chemistry: "الكيمياء",
  Biology: "الأحياء",
  English: "اللغة الإنجليزية",
  Arabic: "اللغة العربية",
  History: "التاريخ",
  Geography: "الجغرافيا",
  ComputerScience: "علم الحاسوب",
};

const LEVEL_TRANSLATIONS = {
  Grade1: "الصف الأول",
  Grade2: "الصف الثاني",
  Grade3: "الصف الثالث",
  Grade4: "الصف الرابع",
  Grade5: "الصف الخامس",
  Grade6: "الصف السادس",
  Grade7: "الصف السابع",
  Grade8: "الصف الثامن",
  Grade9: "الصف التاسع",
  Grade10: "الصف العاشر",
  Grade11: "الصف الحادي عشر",
  Grade12: "الصف الثاني عشر",
};

const translateSubject = (title) => SUBJECT_TRANSLATIONS[title] || title;
const translateLevel = (title) => LEVEL_TRANSLATIONS[title] || title;

// ─── Mapping الـ select values للـ API ───────────────────────
const TEACHING_METHOD_TO_API = {
  online: "online",
  "in-person": "offline",
};

const GENDER_TO_API = {
  ذكر: "male",
  أنثى: "female",
  "لا يهم": null,
};

const CreateLeadStep1 = ({ formData, updateForm, onNext }) => {
  const [errors, setErrors] = useState({});
  const [subjects, setSubjects] = useState([]);
  const [levels, setLevels] = useState([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [catalogError, setCatalogError] = useState("");

  // ─── جلب المواد والمراحل من الباك ───────────────────────────
  useEffect(() => {
    const fetchCatalog = async () => {
      setLoadingCatalog(true);
      setCatalogError("");
      try {
        const [subjectsRes, levelsRes] = await Promise.all([
          api.get("/subjects/"),
          api.get("/levels/"),
        ]);
        setSubjects(subjectsRes.data);
        setLevels(levelsRes.data);
      } catch (err) {
        setCatalogError("تعذّر تحميل المواد والمراحل، يرجى تحديث الصفحة");
      } finally {
        setLoadingCatalog(false);
      }
    };

    fetchCatalog();
  }, []);

  // ─── المعالجات ──────────────────────────────────────────────

  const handleSubjectChange = (e) => {
    const selectedId = Number(e.target.value);
    const selectedItem = subjects.find((s) => s.subject_id === selectedId);
    updateForm({
      subject_id: selectedId,
      subject_label: selectedItem?.subject_title || "",
    });
    setErrors((prev) => ({ ...prev, subject: "" }));
  };

  const handleLevelChange = (e) => {
    const selectedId = Number(e.target.value);
    const selectedItem = levels.find((l) => l.level_id === selectedId);
    updateForm({
      level_id: selectedId,
      level_label: selectedItem?.level_title || "",
    });
    setErrors((prev) => ({ ...prev, grade: "" }));
  };

  const handleTeachingMethodChange = (e) => {
    const val = e.target.value;
    updateForm({
      teachingMethod: val,
      tution_type: TEACHING_METHOD_TO_API[val] ?? val,
    });
    setErrors((prev) => ({ ...prev, teachingMethod: "" }));
  };

  const handleGenderChange = (e) => {
    const val = e.target.value;
    updateForm({
      teacherGender: val,
      preferred_gender: Object.prototype.hasOwnProperty.call(GENDER_TO_API, val)
        ? GENDER_TO_API[val]
        : null,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateForm({ [name]: value });
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // ─── Validation ─────────────────────────────────────────────

  const validateForm = () => {
    const newErrors = {};

    if (!formData.subject_id || formData.subject_id <= 0) {
      newErrors.subject = "الرجاء اختيار المادة الدراسية";
    }

    if (!formData.level_id || formData.level_id <= 0) {
      newErrors.grade = "الرجاء اختيار المرحلة الدراسية";
    }

    if (!formData.helpType) {
      newErrors.helpType = "الرجاء اختيار نوع المساعدة";
    }

    if (!formData.tution_type && !formData.teachingMethod) {
      newErrors.teachingMethod = "الرجاء اختيار طريقة التدريس";
    }

    if (formData.teachingMethod === "in-person" && !formData.location?.trim()) {
      newErrors.location = "الموقع مطلوب عند اختيار التدريس الحضوري";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext();
    }
  };

  // ─────────────────────────────────────────────────────────────

  return (
    <div className="createLeadStep1_appContainer" dir="rtl">
      <Header />

      <main className="createLeadStep1_mainContent">
        <div className="createLeadStep1_contentWrapper">
          <div className="createLeadStep1_pageHeader">
            <div className="createLeadStep1_pageTitleGroup">
              <h2 className="createLeadStep1_pageTitle">إنشاء طلب جديد</h2>
              <p className="createLeadStep1_pageSubtitle">
                أدخل معلوماتك للعثور على المعلم المثالي
              </p>
            </div>

            <div className="createLeadStep1_progressContainer">
              <span className="createLeadStep1_progressText">الخطوة 1 من 3</span>
              <div className="createLeadStep1_progressBarBg">
                <div className="createLeadStep1_progressBarFill"></div>
              </div>
            </div>
          </div>

          <div className="createLeadStep1_infoBanner">
            <span className="material-symbols-outlined">info</span>
            <div>
              <strong>هل تريد طلباً خاصاً لمعلم معين؟</strong>
              <p>
                اذهب إلى <a href="/tutors">صفحة الأساتذة</a> واختر معلمك
                أولاً، ثم أرسل الطلب من حسابه الشخصي مباشرة.
              </p>
            </div>
          </div>

          <div className="createLeadStep1_formCard">
            {/* رسالة خطأ التحميل */}
            {catalogError && (
              <div style={{ color: "#dc2626", marginBottom: "12px", textAlign: "center" }}>
                {catalogError}
              </div>
            )}

            <div className="createLeadStep1_formSection">
              <h3 className="createLeadStep1_sectionTitle">
                <span className="createLeadStep1_sectionIcon">
                  <span className="material-symbols-outlined">menu_book</span>
                </span>
                معلومات الدرس
              </h3>

              <div className="createLeadStep1_formGrid">

                {/* المادة الدراسية — subject_id */}
                <label className="createLeadStep1_formGroup">
                  <span className="createLeadStep1_formLabel">المادة الدراسية</span>
                  <div className="createLeadStep1_inputWrapper">
                    <select
                      name="subject_id"
                      className="createLeadStep1_formControl"
                      value={formData.subject_id || ""}
                      onChange={handleSubjectChange}
                      disabled={loadingCatalog}
                    >
                      <option value="" disabled>
                        {loadingCatalog ? "جارِ التحميل..." : "اختر المادة (مثال: رياضيات)"}
                      </option>
                      {subjects.map((s) => (
                        <option key={s.subject_id} value={s.subject_id}>
                          {translateSubject(s.subject_title)}
                        </option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined createLeadStep1_inputIcon">
                      expand_more
                    </span>
                  </div>
                  {errors.subject && (
                    <span className="createLeadStep1_errorText">{errors.subject}</span>
                  )}
                </label>

                {/* المرحلة الدراسية — level_id */}
                <label className="createLeadStep1_formGroup">
                  <span className="createLeadStep1_formLabel">المرحلة الدراسية</span>
                  <div className="createLeadStep1_inputWrapper">
                    <select
                      name="level_id"
                      className="createLeadStep1_formControl"
                      value={formData.level_id || ""}
                      onChange={handleLevelChange}
                      disabled={loadingCatalog}
                    >
                      <option value="" disabled>
                        {loadingCatalog ? "جارِ التحميل..." : "اختر المرحلة الدراسية"}
                      </option>
                      {levels.map((l) => (
                        <option key={l.level_id} value={l.level_id}>
                          {translateLevel(l.level_title)}
                        </option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined createLeadStep1_inputIcon">
                      expand_more
                    </span>
                  </div>
                  {errors.grade && (
                    <span className="createLeadStep1_errorText">{errors.grade}</span>
                  )}
                </label>

                {/* نوع المساعدة */}
                <label className="createLeadStep1_formGroup">
                  <span className="createLeadStep1_formLabel">نوع المساعدة</span>
                  <div className="createLeadStep1_inputWrapper">
                    <select
                      name="helpType"
                      className="createLeadStep1_formControl"
                      value={formData.helpType || ""}
                      onChange={handleChange}
                    >
                      <option value="" disabled>اختر نوع المساعدة</option>
                      <option>شرح درس معين</option>
                      <option>مراجعة شاملة</option>
                      <option>حل واجبات</option>
                      <option>تحضير للاختبارات</option>
                    </select>
                    <span className="material-symbols-outlined createLeadStep1_inputIcon">
                      help_outline
                    </span>
                  </div>
                  {errors.helpType && (
                    <span className="createLeadStep1_errorText">{errors.helpType}</span>
                  )}
                </label>

                {/* طريقة التدريس */}
                <label className="createLeadStep1_formGroup">
                  <span className="createLeadStep1_formLabel">طريقة التدريس</span>
                  <div className="createLeadStep1_inputWrapper">
                    <select
                      name="teachingMethod"
                      className="createLeadStep1_formControl"
                      value={formData.teachingMethod || ""}
                      onChange={handleTeachingMethodChange}
                    >
                      <option value="" disabled>اختر الطريقة المفضلة</option>
                      <option value="online">عن بعد (أونلاين)</option>
                      <option value="in-person">حضوري</option>
                    </select>
                    <span className="material-symbols-outlined createLeadStep1_inputIcon">
                      school
                    </span>
                  </div>
                  {errors.teachingMethod && (
                    <span className="createLeadStep1_errorText">{errors.teachingMethod}</span>
                  )}
                </label>

                {/* الموقع */}
                <label className="createLeadStep1_formGroup">
                  <span className="createLeadStep1_formLabel">الموقع</span>
                  <div className="createLeadStep1_inputWrapper">
                    <input
                      type="text"
                      name="location"
                      className="createLeadStep1_formControl"
                      value={formData.location || ""}
                      onChange={handleChange}
                      placeholder={
                        formData.teachingMethod === "online"
                          ? "غير مطلوب للتدريس الأونلاين"
                          : "أدخل الحي أو المدينة"
                      }
                      disabled={formData.teachingMethod === "online"}
                    />
                    <span className="material-symbols-outlined createLeadStep1_inputIcon">
                      location_on
                    </span>
                  </div>
                  {errors.location && (
                    <span className="createLeadStep1_errorText">{errors.location}</span>
                  )}
                </label>

                {/* جنس المعلم */}
                <label className="createLeadStep1_formGroup">
                  <span className="createLeadStep1_formLabel">
                    جنس المعلم المفضل (اختياري)
                  </span>
                  <div className="createLeadStep1_inputWrapper">
                    <select
                      name="teacherGender"
                      className="createLeadStep1_formControl"
                      value={formData.teacherGender || ""}
                      onChange={handleGenderChange}
                    >
                      <option value="" disabled>اختر الجنس (اختياري)</option>
                      <option>ذكر</option>
                      <option>أنثى</option>
                      <option>لا يهم</option>
                    </select>
                    <span className="material-symbols-outlined createLeadStep1_inputIcon">
                      person
                    </span>
                  </div>
                </label>

              </div>
            </div>

            <div className="createLeadStep1_formActions">
              <button className="createLeadStep1_btnCancel">
                إلغاء والعودة
              </button>
              <button
                className="createLeadStep1_btnPrimary"
                onClick={handleNext}
                disabled={loadingCatalog}
              >
                <span>التالي</span>
                <span className="material-symbols-outlined createLeadStep1_rtlIcon">
                  arrow_forward
                </span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateLeadStep1;