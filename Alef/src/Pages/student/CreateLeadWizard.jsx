import React, { useState } from "react";
import CreateLeadStep1 from "./CreateLeadStep1";
import CreateLeadStep2 from "./CreateLeadStep2";
import CreateLeadStep3 from "./CreateLeadStep3";

const CreateLeadWizard = () => {
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    subject: "",
    grade: "",
    helpType: "",
    teachingMethod: "",
    location: "",
    teacherGender: "",

    weeklyClasses: "",
    time: "",
    budget: "",

    request_description: "",
    privacy_type: "public",
  });

  const updateForm = (newData) => {
    setFormData((prev) => ({
      ...prev,
      ...newData,
    }));
  };

  const nextStep = () => {
    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setStep((prev) => prev - 1);
  };

  const submitForm = () => {
    console.log("FINAL FORM DATA:", formData);

    // هنا لاحقاً تربطه API
    // axios.post(...)
  };

  return (
    <div>
      {step === 1 && (
        <CreateLeadStep1
          formData={formData}
          updateForm={updateForm}
          onNext={nextStep}
        />
      )}

      {step === 2 && (
        <CreateLeadStep2
          formData={formData}
          updateForm={updateForm}
          onNext={nextStep}
          onBack={prevStep}
        />
      )}

      {step === 3 && (
        <CreateLeadStep3
          formData={formData}
          updateForm={updateForm}
          onBack={prevStep}
          onSubmit={submitForm}
        />
      )}
    </div>
  );
};

export default CreateLeadWizard;