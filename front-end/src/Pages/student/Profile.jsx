import { useState, useEffect } from "react";
import Header from "../../components/Header";
import "../../styles/sstyle/Profile.css";
import "../../styles/sstyle/EditProfile.css";
import defaultAvatar from "../../assets/user-avatar.jpg";
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
export default function Profile() {
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);

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

    "الصف العاشر": "secondary_1",
    "الصف الحادي عشر": "secondary_2",
    "الصف الثاني عشر": "secondary_3",
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

    secondary_1: "الصف العاشر",
    secondary_2: "الصف الحادي عشر",
    secondary_3: "الصف الثاني عشر",
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

        let age = "";

        if (data.date_birth) {
          const birthDate = new Date(data.date_birth);
          const today = new Date();

          age = today.getFullYear() - birthDate.getFullYear();

          const monthDiff = today.getMonth() - birthDate.getMonth();

          if (
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < birthDate.getDate())
          ) {
            age--;
          }
        }

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
          address: data.address || "",
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setEditUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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

    const [first_name, ...rest] = editUser.fullName.split(" ");
    const last_name = rest.join(" ") || "";

    const payload = {
      first_name,
      last_name,
      email: editUser.email,
      phone_number: editUser.phone,
      student_photo: editUser.avatar,
      date_birth: editUser.date_birth,
      grade_level: gradeMap[editUser.grade] || editUser.grade,
    };

    try {
      await api.patch("/students/me", payload);

      setUser(editUser);
      setEditMode(false);
    } catch (err) {
      console.error(err);
      alert("فشل الحفظ");
    }
  };

  const handleCancel = () => {
    setEditUser({ ...user });
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

          {editMode && (
            <section className="profile-page__form-card">
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
                  <button className="profile-page__btn-primary" type="submit">
                    <span className="material-symbols-outlined">save</span>
                    <span>حفظ التعديلات</span>
                  </button>

                  <button
                    type="button"
                    className="profile-page__btn-outline"
                    onClick={handleCancel}
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
