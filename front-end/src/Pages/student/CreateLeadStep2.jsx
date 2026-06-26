import React, { useState } from "react";
import "../../styles/sstyle/CreateLeadStep2.css";
import Header from "../../components/Header";

const SLIDER_MIN = 50;
const SLIDER_MAX = 1000;
const SLIDER_STEP = 10;

const CreateLeadStep2 = ({ formData, updateForm, onNext, onBack }) => {
  const [minBudget, setMinBudget] = useState(
    formData.min_expected_fee ?? SLIDER_MIN,
  );
  const [maxBudget, setMaxBudget] = useState(
    formData.max_expected_fee ?? 500,
  );
  const [errors, setErrors] = useState({});

  const minPercent =
    ((minBudget - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * 100;
  const maxPercent =
    ((maxBudget - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * 100;

  const syncBudget = (min, max) => {
    const nextMin = Math.max(SLIDER_MIN, Math.min(min, SLIDER_MAX));
    const nextMax = Math.max(SLIDER_MIN, Math.min(max, SLIDER_MAX));
    const safeMin = Math.min(nextMin, nextMax);
    const safeMax = Math.max(nextMin, nextMax);

    setMinBudget(safeMin);
    setMaxBudget(safeMax);
    updateForm({
      min_expected_fee: safeMin,
      max_expected_fee: safeMax,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateForm({ [name]: value });
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    const weekly = Number(formData.weeklyClasses);

    if (!weekly || weekly < 1 || weekly > 7) {
      newErrors.weeklyClasses = "الرجاء تحديد عدد الحصص (1-7)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    updateForm({
      weeklyClasses: formData.weeklyClasses || "1",
      min_expected_fee: minBudget,
      max_expected_fee: maxBudget,
    });

    if (validateForm()) {
      onNext();
    }
  };

  return (
    <div className="createLeadStep2_appContainer" dir="rtl">
      <Header />

      <main className="createLeadStep2_mainContent">
        <div className="createLeadStep2_contentWrapper">
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

          <div className="createLeadStep2_formCard">
            <div className="createLeadStep2_formSection">
              <h3 className="createLeadStep2_sectionTitle">
                <span className="createLeadStep2_sectionIcon">
                  <span className="material-symbols-outlined">schedule</span>
                </span>
                تفاصيل الوقت والميزانية
              </h3>

              <div className="createLeadStep2_formGrid">
                <label className="createLeadStep2_formGroup">
                  <span className="createLeadStep2_formLabel">
                    كم حصة تحتاج أسبوعياً؟
                  </span>

                  <div className="createLeadStep2_inputWrapper">
                    <input
                      type="number"
                      min="1"
                      max="7"
                      name="weeklyClasses"
                      value={formData.weeklyClasses || "1"}
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

                {/* الوقت المناسب — معطّل مؤقتاً (لا يُرسل للباك) */}
                {/*
                <label className="createLeadStep2_formGroup">
                  <span className="createLeadStep2_formLabel">
                    الوقت المناسب
                  </span>

                  <div className="createLeadStep2_inputWrapper createLeadStep2_inputWrapper--time">
                    <input
                      type="time"
                      name="time"
                      value={formData.time || ""}
                      onChange={handleChange}
                      className="createLeadStep2_formControl createLeadStep2_timeInput"
                      dir="ltr"
                      step="900"
                    />
                    <span className="material-symbols-outlined createLeadStep2_inputIcon createLeadStep2_timeIcon">
                      schedule
                    </span>
                  </div>
                </label>
                */}

                <div className="createLeadStep2_formGroup createLeadStep2_fullWidth createLeadStep2_budgetGroup">
                  <div className="createLeadStep2_budgetHeader">
                    <span className="createLeadStep2_formLabel">
                      الميزانية المناسبة (للحصة الواحدة)
                    </span>

                    <span className="createLeadStep2_budgetValue">
                      {minBudget} - {maxBudget} ل.س
                    </span>
                  </div>

                  <div className="createLeadStep2_sliderWrapper">
                    <div
                      className="createLeadStep2_dualSlider"
                      style={{
                        "--min-percent": minPercent,
                        "--max-percent": maxPercent,
                      }}
                    >
                      <div className="createLeadStep2_dualSliderTrack" />
                      <div className="createLeadStep2_dualSliderRange" />

                      <input
                        type="range"
                        min={SLIDER_MIN}
                        max={SLIDER_MAX}
                        step={SLIDER_STEP}
                        value={minBudget}
                        onChange={(e) =>
                          syncBudget(Number(e.target.value), maxBudget)
                        }
                        className="createLeadStep2_rangeSlider createLeadStep2_rangeSlider--min"
                        aria-label="الحد الأدنى للميزانية"
                      />

                      <input
                        type="range"
                        min={SLIDER_MIN}
                        max={SLIDER_MAX}
                        step={SLIDER_STEP}
                        value={maxBudget}
                        onChange={(e) =>
                          syncBudget(minBudget, Number(e.target.value))
                        }
                        className="createLeadStep2_rangeSlider createLeadStep2_rangeSlider--max"
                        aria-label="الحد الأعلى للميزانية"
                      />
                    </div>

                    <div className="createLeadStep2_sliderLabels">
                      <span>{SLIDER_MIN} ل.س</span>
                      <span>{SLIDER_MAX} ل.س</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

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
