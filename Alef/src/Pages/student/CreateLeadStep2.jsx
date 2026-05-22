import React, { useState } from "react";
import "../../styles/sstyle/CreateLeadStep2.css";
import Header from "../../components/Header";

const CreateLeadStep2 = ({ formData, updateForm, onNext, onBack }) => {
  const [budgetValue, setBudgetValue] = useState(500);
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

    if (!formData.weeklyClasses) {
      newErrors.weeklyClasses = "الرجاء إدخال عدد الحصص الأسبوعية";
    }

    if (!formData.time) {
      newErrors.time = "الرجاء اختيار الوقت المناسب";
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
    <div className="createLeadStep2_appContainer" dir="rtl">
      <Header />

      {/* Main Content */}
      <main className="createLeadStep2_mainContent">
        <div className="createLeadStep2_contentWrapper">
          {/* Page Header & Progress */}
          <div className="createLeadStep2_pageHeader">
            <div className="createLeadStep2_pageTitleGroup">
              <h2 className="createLeadStep2_pageTitle">
                الخطوة 2: المواعيد والميزانية
              </h2>
              <p className="createLeadStep2_pageSubtitle">
                حدد جدولك الزمني والميزانية المناسبة لك
              </p>
            </div>

            <div className="createLeadStep2_progressContainer">
              <span className="createLeadStep2_progressText">
                الخطوة 2 من 3
              </span>
              <div className="createLeadStep2_progressBarBg">
                <div
                  className="createLeadStep2_progressBarFill"
                  style={{ width: "66%" }}
                ></div>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div className="createLeadStep2_formCard">
            <div className="createLeadStep2_formSection">
              <h3 className="createLeadStep2_sectionTitle">
                <span className="createLeadStep2_sectionIcon">
                  <span className="material-symbols-outlined">schedule</span>
                </span>
                تفاصيل الوقت والميزانية
              </h3>

              <div className="createLeadStep2_formGrid">
                {/* Field 1 */}
                <label className="createLeadStep2_formGroup">
                  <span className="createLeadStep2_formLabel">
                    كم حصة تحتاج أسبوعياً؟
                  </span>

                  <div className="createLeadStep2_inputWrapper">
                    <input
                      type="number"
                      min="1"
                      max="7"
                      defaultValue="1"
                      name="weeklyClasses"
                      value={formData.weeklyClasses}
                      onChange={handleChange}
                      className="createLeadStep2_formControl"
                    />
                    <span className="createLeadStep2_inputSuffix">حصص</span>
                  </div>

                  {errors.weeklyClasses && (
                    <span className="createLeadStep2_errorText">
                      {errors.weeklyClasses}
                    </span>
                  )}
                </label>

                {/* Field 2 */}
                <label className="createLeadStep2_formGroup">
                  <span className="createLeadStep2_formLabel">
                    الوقت المناسب
                  </span>

                  <div className="createLeadStep2_inputWrapper">
                    <input
                      type="time"
                      name="time"
                      value={formData.time}
                      onChange={handleChange}
                      className="createLeadStep2_formControl"
                    />
                    <span className="material-symbols-outlined createLeadStep2_inputIcon">
                      schedule
                    </span>
                  </div>

                  {errors.time && (
                    <span className="createLeadStep2_errorText">
                      {errors.time}
                    </span>
                  )}
                </label>

                {/* Field 3 (بدون validation حسب طلبك) */}
                <div className="createLeadStep2_formGroup createLeadStep2_fullWidth createLeadStep2_budgetGroup">
                  <div className="createLeadStep2_budgetHeader">
                    <span className="createLeadStep2_formLabel">
                      الميزانية المناسبة (للحصة الواحدة)
                    </span>

                    <span className="createLeadStep2_budgetValue">
                      50 - {budgetValue} ل.س
                    </span>
                  </div>

                  <div className="createLeadStep2_sliderWrapper">
                    <input
                      type="range"
                      min="100"
                      max="1000"
                      step="10"
                      value={budgetValue}
                      onChange={(e) => {
                        setBudgetValue(e.target.value);

                        updateForm({
                          budget: e.target.value,
                        });
                      }}
                      className="createLeadStep2_rangeSlider"
                    />

                    <div className="createLeadStep2_sliderLabels">
                      <span>100 ل.س</span>
                      <span>1000 ل.س</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="createLeadStep2_formActions">
              <button className="createLeadStep2_btnCancel" onClick={onBack}>
                السابق
              </button>

              <button
                className="createLeadStep2_btnPrimary"
                onClick={handleNext}
              >
                <span>التالي</span>
                <span className="material-symbols-outlined createLeadStep2_rtlIcon">
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

export default CreateLeadStep2;
