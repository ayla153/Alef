import React, { useCallback, useEffect, useRef, useState } from "react";
import "../../styles/sstyle/CreateLeadStep2.css";
import Header from "../../components/Header";

const SLIDER_MIN = 10000;
const SLIDER_MAX = 200000;
const SLIDER_STEP = 5000;
const THUMB_SIZE = 20;

const clampBudget = (value) =>
  Math.max(
    SLIDER_MIN,
    Math.min(Math.round(value / SLIDER_STEP) * SLIDER_STEP, SLIDER_MAX),
  );

const formatBudget = (value) => Number(value).toLocaleString("en-US");

const getThumbCenter = (trackWidth, value) => {
  const ratio = (value - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN);
  return ratio * (trackWidth - THUMB_SIZE) + THUMB_SIZE / 2;
};

const getTrackPercent = (trackWidth, value) => {
  if (!trackWidth) {
    return ((value - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * 100;
  }

  const center = getThumbCenter(trackWidth, value);
  const trackStart = THUMB_SIZE / 2;
  const trackLen = trackWidth - THUMB_SIZE;
  return ((center - trackStart) / trackLen) * 100;
};

const getTrackGradient = (trackWidth, min, max) => {
  const minPct = getTrackPercent(trackWidth, min);
  const maxPct = getTrackPercent(trackWidth, max);
  return `linear-gradient(to right, #dbeafe 0%, #dbeafe ${minPct}%, var(--primary) ${minPct}%, var(--primary) ${maxPct}%, #dbeafe ${maxPct}%, #dbeafe 100%)`;
};

const CreateLeadStep2 = ({ formData, updateForm, onNext, onBack }) => {
  const sliderRef = useRef(null);
  const [trackWidth, setTrackWidth] = useState(0);
  const [activeThumb, setActiveThumb] = useState(null);
  const [trackGradient, setTrackGradient] = useState(
    getTrackGradient(0, SLIDER_MIN, 100000),
  );

  const [minBudget, setMinBudget] = useState(() =>
    clampBudget(formData.min_expected_fee ?? SLIDER_MIN),
  );
  const [maxBudget, setMaxBudget] = useState(() =>
    clampBudget(formData.max_expected_fee ?? 100000),
  );
  const [errors, setErrors] = useState({});

  const updateTrack = useCallback(
    (width, min, max) => {
      setTrackWidth(width);
      setTrackGradient(getTrackGradient(width, min, max));
    },
    [],
  );

  const updateRangeBar = useCallback(() => {
    const node = sliderRef.current;
    if (!node) return;
    updateTrack(node.offsetWidth, minBudget, maxBudget);
  }, [minBudget, maxBudget, updateTrack]);

  useEffect(() => {
    const node = sliderRef.current;
    if (!node) return undefined;

    updateRangeBar();

    const observer = new ResizeObserver(updateRangeBar);
    observer.observe(node);
    return () => observer.disconnect();
  }, [updateRangeBar]);

  const syncBudget = (min, max) => {
    const nextMin = clampBudget(min);
    const nextMax = clampBudget(max);
    const safeMin = Math.min(nextMin, nextMax);
    const safeMax = Math.max(nextMin, nextMax);

    const node = sliderRef.current;
    if (node) {
      updateTrack(node.offsetWidth, safeMin, safeMax);
    }

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

  const trackInset = THUMB_SIZE / 2;

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

                <div className="createLeadStep2_formGroup createLeadStep2_fullWidth createLeadStep2_budgetGroup">
                  <div className="createLeadStep2_budgetHeader">
                    <span className="createLeadStep2_formLabel">
                      الميزانية المناسبة (للحصة الواحدة)
                    </span>

                    <span className="createLeadStep2_budgetValue">
                      {formatBudget(minBudget)} - {formatBudget(maxBudget)} ل.س
                    </span>
                  </div>

                  <div className="createLeadStep2_sliderWrapper">
                    <div
                      className="createLeadStep2_dualSlider"
                      ref={sliderRef}
                      style={{ "--slider-thumb-size": `${THUMB_SIZE}px` }}
                    >
                      <div
                        className="createLeadStep2_dualSliderTrack"
                        style={{
                          left: trackInset,
                          width: trackWidth ? trackWidth - THUMB_SIZE : undefined,
                          background: trackGradient,
                        }}
                      />

                      <input
                        type="range"
                        min={SLIDER_MIN}
                        max={SLIDER_MAX}
                        step={SLIDER_STEP}
                        value={minBudget}
                        onInput={(e) =>
                          syncBudget(Number(e.target.value), maxBudget)
                        }
                        onPointerDown={() => setActiveThumb("min")}
                        onPointerUp={() => setActiveThumb(null)}
                        onPointerCancel={() => setActiveThumb(null)}
                        className={`createLeadStep2_rangeSlider createLeadStep2_rangeSlider--min${
                          activeThumb === "min"
                            ? " createLeadStep2_rangeSlider--active"
                            : ""
                        }`}
                        aria-label="الحد الأدنى للميزانية"
                      />

                      <input
                        type="range"
                        min={SLIDER_MIN}
                        max={SLIDER_MAX}
                        step={SLIDER_STEP}
                        value={maxBudget}
                        onInput={(e) =>
                          syncBudget(minBudget, Number(e.target.value))
                        }
                        onPointerDown={() => setActiveThumb("max")}
                        onPointerUp={() => setActiveThumb(null)}
                        onPointerCancel={() => setActiveThumb(null)}
                        className={`createLeadStep2_rangeSlider createLeadStep2_rangeSlider--max${
                          activeThumb === "max"
                            ? " createLeadStep2_rangeSlider--active"
                            : ""
                        }`}
                        aria-label="الحد الأعلى للميزانية"
                      />
                    </div>

                    <div className="createLeadStep2_sliderLabels">
                      <span>{formatBudget(SLIDER_MIN)} ل.س</span>
                      <span>{formatBudget(SLIDER_MAX)} ل.س</span>
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
