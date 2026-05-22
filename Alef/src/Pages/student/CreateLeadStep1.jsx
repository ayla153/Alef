import React, { useState } from "react";
import "../../styles/sstyle/CreateLeadStep1.css";
import Header from "../../components/Header";

const CreateLeadStep1 = ({ formData, updateForm, onNext }) => {
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;

    updateForm({
      [name]: value,
    });

    setErrors({
      ...errors,
      [name]: "",
    });
  };

  const validateForm = () => {
    let newErrors = {};

    if (!formData.subject) {
      newErrors.subject = "الرجاء اختيار المادة الدراسية";
    }

    if (!formData.grade) {
      newErrors.grade = "الرجاء اختيار المرحلة الدراسية";
    }

    if (!formData.helpType) {
      newErrors.helpType = "الرجاء اختيار نوع المساعدة";
    }

    if (!formData.teachingMethod) {
      newErrors.teachingMethod = "الرجاء اختيار طريقة التدريس";
    }

    if (formData.teachingMethod === "in-person" && !formData.location.trim()) {
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

  return (
    <div className="createLeadStep1_appContainer fade-in" dir="rtl">
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

          <div className="createLeadStep1_formCard">
            <div className="createLeadStep1_formSection">
              <h3 className="createLeadStep1_sectionTitle">
                <span className="createLeadStep1_sectionIcon">
                  <span className="material-symbols-outlined">menu_book</span>
                </span>
                معلومات الدرس
              </h3>

              <div className="createLeadStep1_formGrid">
                {/* المادة الدراسية */}
                <label className="createLeadStep1_formGroup">
                  <span className="createLeadStep1_formLabel">
                    المادة الدراسية
                  </span>

                  <div className="createLeadStep1_inputWrapper">
                    <select
                      name="subject"
                      className="createLeadStep1_formControl"
                      value={formData.subject}
                      onChange={handleChange}
                    >
                      <option value="" disabled>
                        اختر المادة (مثال: رياضيات)
                      </option>

                      <option>الرياضيات</option>
                      <option>الفيزياء</option>
                      <option>الكيمياء</option>
                      <option>الأحياء</option>
                      <option>اللغة العربية</option>
                      <option>اللغة الإنجليزية</option>
                      <option>جغرافيا</option>
                      <option>التاريخ</option>
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

                {/* المرحلة الدراسية */}
                <label className="createLeadStep1_formGroup">
                  <span className="createLeadStep1_formLabel">
                    المرحلة الدراسية
                  </span>

                  <div className="createLeadStep1_inputWrapper">
                    <select
                      name="grade"
                      className="createLeadStep1_formControl"
                      value={formData.grade}
                      onChange={handleChange}
                    >
                      <option value="" disabled>
                        اختر المرحلة الدراسية
                      </option>

                      <option>الصف الأول</option>
                      <option>الصف الثاني</option>
                      <option>الصف الثالث</option>
                      <option>الصف الرابع</option>
                      <option>الصف الخامس</option>
                      <option>الصف السادس</option>
                      <option>الصف السابع</option>
                      <option>الصف الثامن</option>
                      <option>الصف التاسع</option>
                      <option>الصف العاشر</option>
                      <option>الصف الحادي عشر</option>
                      <option>الصف الثاني عشر</option>
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

                {/* نوع المساعدة */}
                <label className="createLeadStep1_formGroup">
                  <span className="createLeadStep1_formLabel">
                    نوع المساعدة
                  </span>

                  <div className="createLeadStep1_inputWrapper">
                    <select
                      name="helpType"
                      className="createLeadStep1_formControl"
                      value={formData.helpType}
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

                {/* طريقة التدريس */}
                <label className="createLeadStep1_formGroup">
                  <span className="createLeadStep1_formLabel">
                    طريقة التدريس
                  </span>

                  <div className="createLeadStep1_inputWrapper">
                    <select
                      name="teachingMethod"
                      className="createLeadStep1_formControl"
                      value={formData.teachingMethod}
                      onChange={handleChange}
                    >
                      <option value="" disabled>
                        اختر الطريقة المفضلة
                      </option>

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

                {/* الموقع */}
                <label className="createLeadStep1_formGroup">
                  <span className="createLeadStep1_formLabel">الموقع</span>

                  <div className="createLeadStep1_inputWrapper">
                    <input
                      type="text"
                      name="location"
                      className="createLeadStep1_formControl"
                      value={formData.location}
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

                {/* جنس المعلم */}
                <label className="createLeadStep1_formGroup">
                  <span className="createLeadStep1_formLabel">
                    جنس المعلم المفضل (اختياري)
                  </span>

                  <div className="createLeadStep1_inputWrapper">
                    <select
                      name="teacherGender"
                      className="createLeadStep1_formControl"
                      value={formData.teacherGender}
                      onChange={handleChange}
                    >
                      <option value="" disabled>
                        اختر الجنس (اختياري)
                      </option>

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
