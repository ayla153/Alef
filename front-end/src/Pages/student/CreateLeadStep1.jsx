import React, { useState } from "react";
import "../../styles/sstyle/CreateLeadStep1.css";
import Header from "../../components/Header";

// ─── بيانات المواد والمراحل ───────────────────────────────────
// subject_id و level_id: الأرقام بتتطابق مع IDs الباك
// لو عندك endpoint لجلبهم ديناميكياً، استبدل هدول الـ arrays
// بـ useEffect + fetch وخلّي باقي الكود كما هو

const SUBJECTS = [
  { id: 1, label: "الرياضيات" },
  { id: 2, label: "الفيزياء" },
  { id: 3, label: "الكيمياء" },
  { id: 4, label: "الأحياء" },
  { id: 5, label: "اللغة العربية" },
  { id: 6, label: "اللغة الإنجليزية" },
  { id: 7, label: "جغرافيا" },
  { id: 8, label: "التاريخ" },
];

const LEVELS = [
  { id: 1, label: "الصف الأول" },
  { id: 2, label: "الصف الثاني" },
  { id: 3, label: "الصف الثالث" },
  { id: 4, label: "الصف الرابع" },
  { id: 5, label: "الصف الخامس" },
  { id: 6, label: "الصف السادس" },
  { id: 7, label: "الصف السابع" },
  { id: 8, label: "الصف الثامن" },
  { id: 9, label: "الصف التاسع" },
  { id: 10, label: "الصف العاشر" },
  { id: 11, label: "الصف الحادي عشر" },
  { id: 12, label: "الصف الثاني عشر" },
];

// ─── Mapping الـ select values للـ API ───────────────────────

/**
 * teachingMethod (قيمة الـ select في الواجهة) → tution_type (الباك)
 * "online"     → "online"
 * "in-person"  → "offline"
 */
const TEACHING_METHOD_TO_API = {
  online: "online",
  "in-person": "offline",
};

/**
 * teacherGender (قيمة الـ select) → preferred_gender (الباك)
 * "ذكر"    → "male"
 * "أنثى"   → "female"
 * "لا يهم" → null
 */
const GENDER_TO_API = {
  ذكر: "male",
  أنثى: "female",
  "لا يهم": null,
};

// ─────────────────────────────────────────────────────────────

const CreateLeadStep1 = ({ formData, updateForm, onNext }) => {
  const [errors, setErrors] = useState({});

  // ─── المعالجات ──────────────────────────────────────────────

  /**
   * handleSubjectChange
   * يحفظ subject_id (رقم للباك) + subject_label (للعرض)
   */
  const handleSubjectChange = (e) => {
    const selectedId = Number(e.target.value);
    const selectedItem = SUBJECTS.find((s) => s.id === selectedId);
    updateForm({
      subject_id: selectedId,
      subject_label: selectedItem?.label || "",
    });
    setErrors((prev) => ({ ...prev, subject: "" }));
  };

  /**
   * handleLevelChange
   * يحفظ level_id (رقم للباك) + level_label (للعرض)
   */
  const handleLevelChange = (e) => {
    const selectedId = Number(e.target.value);
    const selectedItem = LEVELS.find((l) => l.id === selectedId);
    updateForm({
      level_id: selectedId,
      level_label: selectedItem?.label || "",
    });
    setErrors((prev) => ({ ...prev, grade: "" }));
  };

  /**
   * handleTeachingMethodChange
   * يحفظ teachingMethod (للعرض) + tution_type (للباك)
   */
  const handleTeachingMethodChange = (e) => {
    const val = e.target.value; // "online" | "in-person"
    updateForm({
      teachingMethod: val,
      tution_type: TEACHING_METHOD_TO_API[val] ?? val,
    });
    setErrors((prev) => ({ ...prev, teachingMethod: "" }));
  };

  /**
   * handleGenderChange
   * يحفظ teacherGender (للعرض) + preferred_gender (للباك)
   */
  const handleGenderChange = (e) => {
    const val = e.target.value; // "ذكر" | "أنثى" | "لا يهم"
    updateForm({
      teacherGender: val,
      preferred_gender: Object.prototype.hasOwnProperty.call(GENDER_TO_API, val)
        ? GENDER_TO_API[val]
        : null,
    });
  };

  /**
   * handleChange — للحقول العادية (location, helpType…)
   * هدول ما بتنبعت للباك لكن بنخليها بالـ state للـ UX
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    updateForm({ [name]: value });
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // ─── Validation ─────────────────────────────────────────────

  const validateForm = () => {
    const newErrors = {};

    // subject_id: لازم رقم موجب
    if (!formData.subject_id || formData.subject_id <= 0) {
      newErrors.subject = "الرجاء اختيار المادة الدراسية";
    }

    // level_id: لازم رقم موجب
    if (!formData.level_id || formData.level_id <= 0) {
      newErrors.grade = "الرجاء اختيار المرحلة الدراسية";
    }

    // helpType: حقل واجهة فقط — بس بنتحقق منه لأن الواجهة بتطلبه
    if (!formData.helpType) {
      newErrors.helpType = "الرجاء اختيار نوع المساعدة";
    }

    // tution_type: لازم يكون محدد
    if (!formData.tution_type && !formData.teachingMethod) {
      newErrors.teachingMethod = "الرجاء اختيار طريقة التدريس";
    }

    // location: مطلوب فقط لو حضوري
    if (
      formData.teachingMethod === "in-person" &&
      !formData.location?.trim()
    ) {
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
  // الـ JSX — نفس الواجهة بالكامل، فقط بدّلنا الـ handlers والـ values
  // ─────────────────────────────────────────────────────────────

  return (
    <div className="createLeadStep1_appContainer " dir="rtl">
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
              <span className="createLeadStep1_progressText">
                الخطوة 1 من 3
              </span>

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
                  <span className="createLeadStep1_formLabel">
                    المادة الدراسية
                  </span>

                  <div className="createLeadStep1_inputWrapper">
                    <select
                      name="subject_id"
                      className="createLeadStep1_formControl"
                      value={formData.subject_id || ""}
                      onChange={handleSubjectChange}
                    >
                      <option value="" disabled>
                        اختر المادة (مثال: رياضيات)
                      </option>

                      {SUBJECTS.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.label}
                        </option>
                      ))}
                    </select>

                    <span className="material-symbols-outlined createLeadStep1_inputIcon">
                      expand_more
                    </span>
                  </div>

                  {errors.subject && (
                    <span className="createLeadStep1_errorText">
                      {errors.subject}
                    </span>
                  )}
                </label>

                {/* المرحلة الدراسية — level_id */}
                <label className="createLeadStep1_formGroup">
                  <span className="createLeadStep1_formLabel">
                    المرحلة الدراسية
                  </span>

                  <div className="createLeadStep1_inputWrapper">
                    <select
                      name="level_id"
                      className="createLeadStep1_formControl"
                      value={formData.level_id || ""}
                      onChange={handleLevelChange}
                    >
                      <option value="" disabled>
                        اختر المرحلة الدراسية
                      </option>

                      {LEVELS.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.label}
                        </option>
                      ))}
                    </select>

                    <span className="material-symbols-outlined createLeadStep1_inputIcon">
                      expand_more
                    </span>
                  </div>

                  {errors.grade && (
                    <span className="createLeadStep1_errorText">
                      {errors.grade}
                    </span>
                  )}
                </label>

                {/* نوع المساعدة — help_type */}
                <label className="createLeadStep1_formGroup">
                  <span className="createLeadStep1_formLabel">
                    نوع المساعدة
                  </span>

                  <div className="createLeadStep1_inputWrapper">
                    <select
                      name="helpType"
                      className="createLeadStep1_formControl"
                      value={formData.helpType || ""}
                      onChange={handleChange}
                    >
                      <option value="" disabled>
                        اختر نوع المساعدة
                      </option>

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
                    <span className="createLeadStep1_errorText">
                      {errors.helpType}
                    </span>
                  )}
                </label>

                {/* طريقة التدريس — tution_type */}
                <label className="createLeadStep1_formGroup">
                  <span className="createLeadStep1_formLabel">
                    طريقة التدريس
                  </span>

                  <div className="createLeadStep1_inputWrapper">
                    <select
                      name="teachingMethod"
                      className="createLeadStep1_formControl"
                      value={formData.teachingMethod || ""}
                      onChange={handleTeachingMethodChange}
                    >
                      <option value="" disabled>
                        اختر الطريقة المفضلة
                      </option>

                      {/* القيم بالـ select هي قيم الواجهة */}
                      {/* الـ handler يحوّلها تلقائياً لقيم الباك */}
                      <option value="online">عن بعد (أونلاين)</option>
                      <option value="in-person">حضوري</option>
                    </select>

                    <span className="material-symbols-outlined createLeadStep1_inputIcon">
                      school
                    </span>
                  </div>

                  {errors.teachingMethod && (
                    <span className="createLeadStep1_errorText">
                      {errors.teachingMethod}
                    </span>
                  )}
                </label>

                {/* الموقع — واجهة فقط، ما بينبعت للباك */}
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
                    <span className="createLeadStep1_errorText">
                      {errors.location}
                    </span>
                  )}
                </label>

                {/* جنس المعلم — preferred_gender */}
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
                      <option value="" disabled>
                        اختر الجنس (اختياري)
                      </option>

                      {/* القيم العربية تتحول تلقائياً في handleGenderChange */}
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