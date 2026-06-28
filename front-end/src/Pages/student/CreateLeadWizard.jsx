import React, { useState } from "react";
import CreateLeadStep1 from "./CreateLeadStep1";
import CreateLeadStep2 from "./CreateLeadStep2";
import CreateLeadStep3 from "./CreateLeadStep3";
import RequestSuccess from "./RequestSuccess";
import { useLocation } from "react-router-dom";
import api from "../../api/api.js";

const CreateLeadWizard = () => {
  const [step, setStep] = useState(1);
  const location = useLocation();

  const origin = location.state?.origin || "create";
  const tutorId = location.state?.tutor_id || null;

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    subject_id: "",
    level_id: "",
    tution_type: "",
    preferred_gender: null,
    foundation_tution: false,
    helpType: "",
    min_expected_fee: 50,
    max_expected_fee: 500,
    weeklyClasses: "1",
    title: "",
    description: "",
    privacy_type: origin === "teacher" ? "private" : "public",
    subject_label: "",
    level_label: "",
    teachingMethod: "",
    teacherGender: "",
    request_description: "",
    location: "",
  });

  const updateForm = (newData) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  // ── إرسال الطلب ──────────────────────────────────────────────
  // ملاحظة: نقرأ القيم مباشرة من formData بدل الاعتماد على updateForm
  // لأن setState غير متزامن وقد لا تكون القيم محدّثة عند الاستدعاء

  const submitForm = async () => {
    setLoading(true);
    setError(null);

    const isPrivate = origin === "teacher" && tutorId;
    const endpoint = isPrivate ? "/leads/private" : "/leads/public";

    // نقرأ description مباشرة من formData
    const description = (
      formData.request_description?.trim() ||
      formData.description?.trim() ||
      ""
    );

    // tution_type
    const tutionType = formData.tution_type
      ? formData.tution_type
      : formData.teachingMethod === "in-person"
      ? "offline"
      : formData.teachingMethod || "";

    // preferred_gender
    const preferredGender =
      formData.preferred_gender !== undefined && formData.preferred_gender !== ""
        ? formData.preferred_gender
        : formData.teacherGender === "ذكر"
        ? "male"
        : formData.teacherGender === "أنثى"
        ? "female"
        : null;

    const sharedBody = {
      title: formData.title?.trim() || formData.subject_label || "طلب درس خصوصي",
      description,
      foundation_tution: formData.foundation_tution,
      tution_type: tutionType,
      help_type: formData.helpType?.trim() || "",
      min_expected_fee: Number(formData.min_expected_fee) || 50,
      max_expected_fee: Number(formData.max_expected_fee) || 0,
      weekly_classes: Number(formData.weeklyClasses) || 1,
      preferred_gender: preferredGender,
      subject_id: Number(formData.subject_id),
      level_id: Number(formData.level_id),
    };

    // ── التحقق من الحقول المطلوبة ────────────────────────────
    if (!sharedBody.subject_id || sharedBody.subject_id <= 0) {
      setError("يرجى اختيار المادة الدراسية");
      setLoading(false);
      return;
    }
    if (!sharedBody.level_id || sharedBody.level_id <= 0) {
      setError("يرجى اختيار المرحلة الدراسية");
      setLoading(false);
      return;
    }
    if (!sharedBody.tution_type) {
      setError("يرجى اختيار طريقة التدريس");
      setLoading(false);
      return;
    }
    if (!sharedBody.help_type) {
      setError("يرجى اختيار نوع المساعدة");
      setLoading(false);
      return;
    }
    if (!sharedBody.weekly_classes || sharedBody.weekly_classes < 1) {
      setError("يرجى تحديد عدد الحصص الأسبوعية");
      setLoading(false);
      return;
    }
    if (!sharedBody.description || sharedBody.description.length < 20) {
      setError("يجب أن يكون الوصف على الأقل 20 حرف");
      setLoading(false);
      return;
    }

    const body = isPrivate
      ? {
          ...sharedBody,
          target_tutor_id: Number(tutorId),
          publish_public_copy: false,
        }
      : sharedBody;

    try {
      await api.post(endpoint, body);
      setSubmitted(true);
    } catch (err) {
      const errData = err.response?.data;
      let msg = "حدث خطأ أثناء إرسال الطلب";

      if (typeof errData?.detail === "string") {
        msg = errData.detail;
      } else if (Array.isArray(errData?.detail)) {
        msg = errData.detail.map((e) => e.msg).join("، ");
      }

      if (msg.includes("within the last 14 days")) {
        msg = "لا يمكن نشر طلب عام لهذه المادة خلال 14 يوماً. يمكنك التواصل مع معلّم عبر ملفه الشخصي مباشرة.";
      } else if (msg.includes("open private lead")) {
        msg = "لديك طلب خاص مفتوح، أنهِه أولاً";
      } else if (msg.includes("Application slots are full")) {
        msg = "التقديمات ممتلئة حالياً";
      } else if (msg.includes("already submitted an offer")) {
        msg = "قدّمت عرضاً على هذا الطلب مسبقاً";
      } else if (msg.includes("do not teach the subject")) {
        msg = "هذه المادة غير مضافة لملفك";
      } else if (msg.includes("Verified tutor account required")) {
        msg = "يجب إكمال توثيق حساب المعلّم";
      } else if (msg.includes("Not authenticated")) {
        msg = "انتهت جلستك، يرجى تسجيل الدخول مجدداً";
      }

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) return <RequestSuccess />;

  return (
    <div>
      {error && (
        <div
          style={{
            background: "#fee2e2",
            color: "#dc2626",
            padding: "12px 16px",
            borderRadius: "8px",
            margin: "16px",
            textAlign: "center",
            fontWeight: "bold",
          }}
          dir="rtl"
        >
          {error}
        </div>
      )}

      {step === 1 && (
        <CreateLeadStep1
          origin={origin}
          formData={formData}
          updateForm={updateForm}
          onNext={nextStep}
        />
      )}

      {step === 2 && (
        <CreateLeadStep2
          origin={origin}
          formData={formData}
          updateForm={updateForm}
          onNext={nextStep}
          onBack={prevStep}
        />
      )}

      {step === 3 && (
        <CreateLeadStep3
          origin={origin}
          formData={formData}
          updateForm={updateForm}
          onBack={prevStep}
          onSubmit={submitForm}
          loading={loading}
        />
      )}
    </div>
  );
};

export default CreateLeadWizard;