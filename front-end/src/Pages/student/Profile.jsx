import { useState, useEffect } from "react";
import Header from "../../components/Header";
import LogoutButton from "../../components/LogoutButton";
import "../../styles/sstyle/Profile.css";
import "../../styles/sstyle/EditProfile.css";
import defaultAvatar from "../../assets/user-avatar.jpg";
import api from "../../api/api";
export default function Profile() {
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // تصحيح: الـ enum الحقيقي بالباك هو high_1/2/3 وليس secondary_1/2/3
  const gradeMap = {
    "الصف الأول": "primary_1",
    "الصف الثاني": "primary_2",
    "الصف الثالث": "primary_3",
    "الصف الرابع": "primary_4",
    "الصف الخامس": "primary_5",
    "الصف السادس": "primary_6",

    "الصف السابع": "middle_1",
    "الصف الثامن": "middle_2",
    "الصف التاسع": "middle_3",

    "الصف العاشر": "high_1",
    "الصف الحادي عشر": "high_2",
    "الصف الثاني عشر": "high_3",
  };

  const gradeLabels = {
    primary_1: "الصف الأول",
    primary_2: "الصف الثاني",
    primary_3: "الصف الثالث",
    primary_4: "الصف الرابع",
    primary_5: "الصف الخامس",
    primary_6: "الصف السادس",

    middle_1: "الصف السابع",
    middle_2: "الصف الثامن",
    middle_3: "الصف التاسع",

    high_1: "الصف العاشر",
    high_2: "الصف الحادي عشر",
    high_3: "الصف الثاني عشر",
  };

  const [user, setUser] = useState({
    fullName: "",
    email: "",
    phone: "",
    avatar: "",
    grade: "",
    joinYear: "",
    date_birth: "",
    age: "",
    address: "",
  });

  const [editUser, setEditUser] = useState({
    fullName: "",
    email: "",
    phone: "",
    avatar: "",
    grade: "",
    joinYear: "",
    date_birth: "",
    age: "",
    address: "",
  });

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await api.get("/students/me");

        const data = res.data;

        const mappedUser = {
          fullName: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
          email: data.email || "",
          phone: data.phone_number || "",
          avatar: data.student_photo || "",
          grade: gradeLabels[data.grade_level] || data.grade_level,
          joinYear: data.registered_at
            ? new Date(data.registered_at).getFullYear()
            : "",
          date_birth: data.date_birth || "",
          age: calculateAge(data.date_birth).toString(),
          // ملاحظة: لا يوجد حقل address ضمن StudentOut بالباك حالياً.
          // العنوان يُدار عبر endpoint منفصل: /addresses/student/me
          address: "",
        };

        setUser(mappedUser);
        setEditUser(mappedUser);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, []);

  const calculateAge = (date_birth) => {
    if (!date_birth) return "";

    const birth = new Date(date_birth);
    const today = new Date();

    let age = today.getFullYear() - birth.getFullYear();

    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    return age;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setEditUser((prev) => ({
      ...prev,
      [name]: value,
      // إعادة حساب العمر فوراً عند تغيير تاريخ الميلاد
      ...(name === "date_birth" ? { age: calculateAge(value).toString() } : {}),
    }));
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, "").slice(0, 9);

    setEditUser((prev) => ({
      ...prev,
      phone: "+963" + value,
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      setEditUser((prev) => ({
        ...prev,
        avatar: reader.result,
      }));
    };

    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaveError(null);

    const [first_name, ...rest] = editUser.fullName.split(" ");
    const last_name = rest.join(" ") || "";

    // grade_level يجب أن يطابق القيم المسموحة بالـ enum بالباك بالضبط
    // (primary_1..6, middle_1..3, high_1..3)
    const mappedGrade = gradeMap[editUser.grade] || editUser.grade;

    const payload = {
      first_name,
      last_name,
      email: editUser.email,
      phone_number: editUser.phone,
      student_photo: editUser.avatar,
      date_birth: editUser.date_birth,
      grade_level: mappedGrade,
      // ملاحظة: لا نرسل address هنا لأن UpdateStudentRequest
      // لا يحتوي هذا الحقل أصلاً؛ العنوان له endpoint مستقل.
    };

    setSaving(true);

    try {
      await api.patch("/students/me", payload);

      setUser({
        ...editUser,
        grade: gradeLabels[mappedGrade] || editUser.grade,
        age: calculateAge(editUser.date_birth).toString(),
      });
      setEditMode(false);
    } catch (err) {
      console.error(err);

      const errData = err.response?.data;
      let msg = "فشل حفظ التعديلات";

      if (typeof errData?.detail === "string") {
        msg = errData.detail;
      } else if (Array.isArray(errData?.detail)) {
        // أخطاء الـ validation (422) بتجي كلائحة، منعرضها مفصّلة بالعربي
        msg = errData.detail
          .map((e) => `${e.loc?.[e.loc.length - 1] || ""}: ${e.msg}`)
          .join("، ");
      }

      setSaveError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditUser({ ...user });
    setSaveError(null);
    setEditMode(false);
  };

  if (loading) {
    return <div>جاري تحميل البيانات...</div>;
  }

  return (
    <div className="profile-page__wrapper" dir="rtl">
      <Header activeTab="home" avatar={user.avatar || defaultAvatar} />

      <main className="profile-page__main-content">
        <div className="profile-page__container-small">
          {!editMode && (
            <section className="profile-page__card">
              <div className="profile-page__header">
                <div className="profile-page__image-container">
                  <div
                    className="profile-page__avatar"
                    style={{
                      backgroundImage: `url(${user.avatar || defaultAvatar})`,
                    }}
                  ></div>
                </div>

                <div className="profile-page__info">
                  <h3>{user.fullName}</h3>

                  <p className="profile-page__join-date">
                    طالب مسجل منذ {user.joinYear}
                  </p>

                  <div className="profile-page__tags-container">
                    <span className="profile-page__tag profile-page__tag-blue">
                      <span className="material-symbols-outlined">school</span>
                      {user.grade}
                    </span>
                  </div>
                </div>

                <div className="profile-page__edit-action">
                  <button
                    className="profile-page__btn-primary"
                    onClick={() => setEditMode(true)}
                  >
                    <span className="material-symbols-outlined">edit</span>
                    <span>تعديل الملف الشخصي</span>
                  </button>
                </div>
              </div>

              <hr className="profile-page__separator" />

              <div className="profile-page__info-grid">
                {[
                  {
                    icon: "person",
                    label: "الاسم الكامل",
                    value: user.fullName,
                  },
                  {
                    icon: "school",
                    label: "المرحلة الدراسية",
                    value: user.grade,
                  },
                  {
                    icon: "cake",
                    label: "العمر",
                    value: user.age,
                  },
                  {
                    icon: "call",
                    label: "رقم الهاتف",
                    value: user.phone,
                    ltr: true,
                  },
                  {
                    icon: "mail",
                    label: "البريد الإلكتروني",
                    value: user.email,
                  },
                  {
                    icon: "location_on",
                    label: "العنوان",
                    value: user.address,
                  },
                ].map((item, i) => (
                  <div className="profile-page__info-item" key={i}>
                    <div className="profile-page__info-icon">
                      <span className="material-symbols-outlined">
                        {item.icon}
                      </span>
                    </div>

                    <div>
                      <label>{item.label}</label>

                      <p className={item.ltr ? "ltr-text" : ""}>{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {!editMode && (
            <div className="profile-page__logout-action">
              <LogoutButton />
            </div>
          )}

          {editMode && (
            <section className="profile-page__form-card">
              {saveError && (
                <div
                  style={{
                    background: "#fee2e2",
                    color: "#dc2626",
                    padding: "12px 16px",
                    borderRadius: "8px",
                    marginBottom: "16px",
                    textAlign: "center",
                    fontWeight: "bold",
                  }}
                >
                  {saveError}
                </div>
              )}

              <form onSubmit={handleSave}>
                <div className="profile-page__image-edit">
                  <div className="profile-page__image-wrapper-edit">
                    <div
                      className="profile-page__avatar-large-edit"
                      style={{
                        backgroundImage: `url(${
                          editUser.avatar || defaultAvatar
                        })`,
                      }}
                    ></div>

                    <label
                      htmlFor="avatar-upload"
                      className="profile-page__camera-btn"
                    >
                      <span className="material-symbols-outlined">
                        camera_alt
                      </span>

                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={handleAvatarChange}
                      />
                    </label>
                  </div>

                  <div className="text-center">
                    <h3>{editUser.fullName}</h3>
                    <p>تعديل صورة الملف الشخصي</p>
                  </div>
                </div>

                <div className="profile-page__inputs-grid">
                  {[
                    {
                      label: "الاسم الكامل",
                      name: "fullName",
                      icon: "person",
                      type: "text",
                    },
                    {
                      label: "تاريخ الميلاد",
                      name: "date_birth",
                      icon: "cake",
                      type: "date",
                    },
                    {
                      label: "المرحلة الدراسية",
                      name: "grade",
                      icon: "school",
                      type: "text",
                    },
                    {
                      label: "البريد الإلكتروني",
                      name: "email",
                      icon: "mail",
                      type: "email",
                    },
                    {
                      label: "العنوان",
                      name: "address",
                      icon: "location_on",
                      type: "text",
                    },
                  ].map((item, i) => (
                    <div className="profile-page__form-group" key={i}>
                      <label>{item.label}</label>

                      <div className="profile-page__input-wrapper">
                        <span className="material-symbols-outlined profile-page__field-icon">
                          {item.icon}
                        </span>

                        <input
                          name={item.name}
                          type={item.type}
                          value={editUser[item.name] || ""}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  ))}

                  <div className="profile-page__form-group profile-page__ltr-input">
                    <label>رقم الهاتف</label>

                    <div className="profile-page__input-wrapper">
                      <span className="material-symbols-outlined profile-page__field-icon">
                        call
                      </span>

                      <input
                        name="phone"
                        type="tel"
                        value={editUser.phone || ""}
                        onChange={handlePhoneChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="profile-page__form-actions">
                  <button
                    className="profile-page__btn-primary"
                    type="submit"
                    disabled={saving}
                  >
                    <span className="material-symbols-outlined">save</span>
                    <span>{saving ? "جارٍ الحفظ..." : "حفظ التعديلات"}</span>
                  </button>

                  <button
                    type="button"
                    className="profile-page__btn-outline"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    <span>إلغاء</span>
                  </button>
                </div>
              </form>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}