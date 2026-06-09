import React, { useState } from "react";
import CreateLeadStep1 from "./CreateLeadStep1";
import CreateLeadStep2 from "./CreateLeadStep2";
import CreateLeadStep3 from "./CreateLeadStep3";
import RequestSuccess from "./RequestSuccess"; 
import { useLocation } from "react-router-dom";

const CreateLeadWizard = () => {
  const [step, setStep] = useState(1);

  const location = useLocation();

  const origin = location.state?.origin || "create";
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [submitted, setSubmitted] = useState(false);

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
    setSubmitted(true);

    // هنا لاحقاً تربطه API
    // axios.post(...)
  };

  return (
    <div>
      {submitted ? (
      <RequestSuccess />
    ) : (
      <>
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
          selectedTeacher={selectedTeacher}
          setSelectedTeacher={setSelectedTeacher}
        />
      )}
      </>
      )}
    </div>
  );
};

export default CreateLeadWizard;
