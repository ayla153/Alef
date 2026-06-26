import React, { useState } from "react";
import CreateLeadStep1 from "./CreateLeadStep1";
import CreateLeadStep2 from "./CreateLeadStep2";
import CreateLeadStep3 from "./CreateLeadStep3";
import RequestSuccess from "./RequestSuccess";
import { useLocation } from "react-router-dom";
import api from "../../api/api.js"

const CreateLeadWizard = () => {
  const [step, setStep] = useState(1);
  const location = useLocation();

  // origin: "teacher" إذا جاي من بروفايل معلم، "create" إذا من تاب إنشاء
  const origin = location.state?.origin || "create";
  // tutor_id يجي من TeacherProfile لما يضغط "طلب درس"
  const tutorId = location.state?.tutor_id || null;

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    // Step 1 — يتطابق مع CreateLeadFields بالباك
    subject_id: "",        // رقم المادة من الـ API
    level_id: "",          // رقم المرحلة من الـ API
    tution_type: "",       // "online" | "offline" | "both"
    preferred_gender: null, // "male" | "female" | null
    foundation_tution: false,

    // Step 2
    expected_fee: 500,     // الميزانية بالأرقام

    // Step 3
    title: "",
    description: "",       // وصف الطلب — يتعبّأ من request_description
    privacy_type: origin === "teacher" ? "private" : "public",

    // ============================================================
    // حقول واجهة فقط — ما بتنبعت للباك
    // ============================================================
    // subject_label: اسم المادة للعرض بالـ select (ما بينبعت)
    subject_label: "",
    // level_label: اسم المرحلة للعرض (ما بينبعت)
    level_label: "",
    // teachingMethod: القيمة المؤقتة قبل التحويل لـ tution_type
    // "online" → "online" | "in-person" → "offline"
    teachingMethod: "",
    // teacherGender: القيمة المؤقتة قبل التحويل لـ preferred_gender
    // "ذكر" → "male" | "أنثى" → "female" | "لا يهم" → null
    teacherGender: "",
    // request_description: نص الـ textarea في Step3
    // بيتحوّل لـ description عند الإرسال
    request_description: "",
    // حقول ما بتنبعت للباك (Step 2 — واجهة فقط)
    weeklyClasses: "",
    time: "",
    location: "",
  });

  const updateForm = (newData) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  // ── تحويل قيم الواجهة لقيم الـ API ──────────────────────────

  /**
   * teachingMethod → tution_type
   * "online"     → "online"
   * "in-person"  → "offline"
   * "both"       → "both"  (لو الواجهة أضافته لاحقاً)
   */
  const mapTutionType = (teachingMethod) => {
    if (teachingMethod === "in-person") return "offline";
    if (teachingMethod === "online") return "online";
    if (teachingMethod === "both") return "both";
    return teachingMethod; // fallback لو جاي صح مسبقاً
  };

  /**
   * teacherGender → preferred_gender
   * "ذكر"   → "male"
   * "أنثى"  → "female"
   * "لا يهم" / "" / null → null
   */
  const mapPreferredGender = (teacherGender) => {
    if (teacherGender === "ذكر") return "male";
    if (teacherGender === "أنثى") return "female";
    return null;
  };

  // ── بناء جسم الطلب ───────────────────────────────────────────

  const buildRequestBody = () => {
    // الحقول المشتركة — يتطابقوا 1:1 مع CreateLeadFields بالباك
    return {
      // title: لو ما كتب المستخدم عنوان خاص رح نستخدم subject_label
      // الباك بيطلبها مش فاضية (1-100 حرف)
      title: formData.title?.trim() || formData.subject_label || "طلب درس خصوصي",

      // description: بيجي من textarea "request_description" بـ Step3
      description: formData.request_description?.trim() || formData.description?.trim() || "",

      foundation_tution: formData.foundation_tution,

      // tution_type: بنحوّل من teachingMethod إذا الحقل الأصلي فاضي
      tution_type: formData.tution_type
        ? formData.tution_type
        : mapTutionType(formData.teachingMethod),

      expected_fee: Number(formData.expected_fee) || 0,

      // preferred_gender: بنحوّل من teacherGender إذا ما انحدّد مسبقاً
      preferred_gender: formData.preferred_gender !== undefined && formData.preferred_gender !== ""
        ? formData.preferred_gender
        : mapPreferredGender(formData.teacherGender),

      // subject_id و level_id — لازم يكونوا أرقام موجبة
      subject_id: Number(formData.subject_id),
      level_id: Number(formData.level_id),
    };
  };

  // ── إرسال الطلب ──────────────────────────────────────────────

  const submitForm = async () => {
    setLoading(true);
    setError(null);

    const isPrivate = origin === "teacher" && tutorId;

    // الباك عنده endpointين منفصلين للعام والخاص
    const endpoint = isPrivate ? "/leads/private" : "/leads/public";

    const sharedBody = buildRequestBody();

    // التحقق من الحقول المطلوبة قبل الإرسال
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
    if (!sharedBody.description || sharedBody.description.length < 20) {
      setError("يجب أن يكون الوصف على الأقل 20 حرف");
      setLoading(false);
      return;
    }

    // الخاص يضيف target_tutor_id — العام بيبعت sharedBody فقط
    const body = isPrivate
      ? {
          ...sharedBody,
          target_tutor_id: Number(tutorId),
          publish_public_copy: false,
        }
      : sharedBody;

    try {
      // api instance بيحط الـ token تلقائياً من الـ interceptor
      await api.post(endpoint, body);
      setSubmitted(true);
    } catch (err) {
      // axios بيحط الـ response بـ err.response
      const errData = err.response?.data;
      let msg = "حدث خطأ أثناء إرسال الطلب";

      if (typeof errData?.detail === "string") {
        msg = errData.detail;
      } else if (Array.isArray(errData?.detail)) {
        msg = errData.detail.map((e) => e.msg).join("، ");
      }

      // ترجمة رسائل الباك للعربية
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