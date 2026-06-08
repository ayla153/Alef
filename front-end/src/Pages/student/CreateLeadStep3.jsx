import React, { useState } from "react";
import "../../styles/sstyle/CreateLeadStep3.css";
import Header from "../../components/Header";

const CreateLeadStep3 = ({ formData, updateForm, onBack, onSubmit, origin }) => {

  const [privacyType, setPrivacyType] = useState(
  origin === "teacher" ? "private" : "public"
);
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

    const desc = formData.request_description || "";

    if (!desc || desc.trim().length < 20) {
      newErrors.request_description =
        "يجب أن يكون الوصف على الأقل 20 حرف";
    }

    if (!privacyType) {
      newErrors.privacy_type = "الرجاء اختيار نوع الخصوصية";
    }

    if (privacyType === "private" && !selectedTeacher) {
  newErrors.selectedTeacher = "يجب اختيار معلم للطلب الخاص";
}

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      updateForm({
        privacy_type: privacyType,
      });

      onSubmit && onSubmit();
    }
  };

  return (
    <div className="cl3-app-container" dir="rtl">
      <Header />

      {/* Main Content */}
      <main className="cl3-main-content">
        <div className="cl3-content-wrapper">

          {/* Page Header & Progress */}
          <div className="cl3-page-header">
            <div className="cl3-page-title-group">
              <h2 className="cl3-page-title">
                الخطوة 3: تفاصيل الطلب والخصوصية
              </h2>
              <p className="cl3-page-subtitle">
                أكمل الخطوة الأخيرة لتأكيد طلبك وتحديد مستوى الخصوصية
              </p>
            </div>

            <div className="cl3-progress-container">
              <span className="cl3-progress-text">الخطوة 3 من 3</span>
              <div className="cl3-progress-bar-bg">
                <div
                  className="cl3-progress-bar-fill"
                  style={{ width: "100%" }}
                ></div>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div className="cl3-form-card">

            {/* Request Description Section */}
            <div className="cl3-form-section">
              <h3 className="cl3-section-title">
                <span className="cl3-section-icon">
                  <span className="material-symbols-outlined">
                    edit_note
                  </span>
                </span>
                وصف الطلب
              </h3>

              <div className="cl3-form-group full-width">
                <textarea
                  className="cl3-textarea-control"
                  id="request_description"
                  name="request_description"
                  value={formData.request_description}
                  onChange={handleChange}
                  placeholder="اشرح بالتفصيل المواضيع التي تحتاج لمساعدة فيها، الأهداف التعليمية، وأي تفضيلات أخرى..."
                ></textarea>

                <p className="cl3-textarea-hint">الحد الأدنى 20 حرفاً</p>

                {errors.request_description && (
                  <span className="cl3-error-text">
                    {errors.request_description}
                  </span>
                )}
              </div>
            </div>

            {/* Privacy Section */}
            <div className="cl3-form-section cl3-privacy-section-spacing">
              <h3 className="cl3-section-title">
                <span className="cl3-section-icon">
                  <span className="material-symbols-outlined">
                    lock_open
                  </span>
                </span>
                خصوصية النشر
              </h3>

              <div className="cl3-privacy-cards-grid">

                {/* Public */}
                <label className="cl3-privacy-card-label">
                  <input
                    type="radio"
                    name="privacy_type"
                    value="public"
                    className="cl3-privacy-card-radio"
                    checked={privacyType === "public"}
                    onChange={(e) => setPrivacyType(e.target.value)}
                  />

                  <div className="cl3-privacy-card-ui">
                    <div className="cl3-privacy-card-header">
                      <div className="cl3-privacy-icon">
                        <span className="material-symbols-outlined">
                          public
                        </span>
                      </div>
                      <div className="cl3-radio-circle"></div>
                    </div>

                    <div className="cl3-privacy-card-body">
                      <h4 className="cl3-privacy-card-title">
                        طلب عام
                      </h4>
                      <p className="cl3-privacy-card-desc">
                        سيظهر طلبك لجميع المعلمين المتاحين في المنصة لتقديم عروضهم.
                      </p>
                    </div>
                  </div>
                </label>

                {/* Private */}
                <label className="cl3-privacy-card-label">
                  <input
                    type="radio"
                    name="privacy_type"
                    value="private"
                    className="cl3-privacy-card-radio"
                    checked={privacyType === "private"}
                    onChange={(e) => setPrivacyType(e.target.value)}
                  />

                  <div className="cl3-privacy-card-ui">
                    <div className="cl3-privacy-card-header">
                      <div className="cl3-privacy-icon">
                        <span className="material-symbols-outlined">
                          lock
                        </span>
                      </div>
                      <div className="cl3-radio-circle"></div>
                    </div>

                    <div className="cl3-privacy-card-body">
                      <h4 className="cl3-privacy-card-title">
                        طلب خاص
                      </h4>
                      <p className="cl3-privacy-card-desc">
                        سيكون طلبك مخفياً ولن يراه إلا المعلمون الذين تختار التواصل معهم مباشرة.
                      </p>
                    </div>
                  </div>
                </label>

              </div>

              {errors.privacy_type && (
                <span className="cl3-error-text">
                  {errors.privacy_type}
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="cl3-form-actions">

              <button className="cl3-btn-cancel" onClick={onBack}>
                السابق
              </button>

              <button className="cl3-btn-primary" onClick={handleSubmit}>
                <span>تأكيد الطلب</span>
                <span className="material-symbols-outlined rtl-icon-none">
                  check_circle
                </span>
              </button>

            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateLeadStep3;