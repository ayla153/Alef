import { useState } from "react";
import Header from "../components/Header";
import "../styles/Profile.css";
import "../styles/EditProfile.css";
import defaultAvatar from "../assets/user-avatar.jpg";

export default function Profile() {
  const [editMode, setEditMode] = useState(false);

  const [user, setUser] = useState({
    name: "هدى",
    fullName: "هدى الطبال",
    stage: "المرحلة الثانوية",
    grade: "الصف الثاني عشر",
    age: 22,
    phone: "+963939576940",
    email: "hudaaltabbal@example.com",
    address: "حمص الوعر",
    joinYear: 2026,
    avatar: "",
  });

  const [editUser, setEditUser] = useState({ ...user });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "age") {
      const num = value.replace(/\D/g, "").slice(0, 2);
      setEditUser((prev) => ({ ...prev, age: num }));
    } else {
      setEditUser((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, "").slice(0, 9);
    setEditUser((prev) => ({ ...prev, phone: "+963" + value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setEditUser((prev) => ({ ...prev, avatar: imageUrl }));
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    const phoneWithoutCode = editUser.phone.replace("+963", "");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (phoneWithoutCode.length !== 9) {
      alert("رقم الهاتف يجب أن يكون 9 أرقام");
      return;
    }
    if (!emailRegex.test(editUser.email)) {
      alert("الرجاء إدخال بريد إلكتروني صحيح");
      return;
    }

    setUser(editUser);
    setEditMode(false);
  };

  const handleCancel = () => {
    setEditUser({ ...user });
    setEditMode(false);
  };

  return (
    <div className="page-wrapper" dir="rtl">
      <Header activeTab="home" avatar={user.avatar || defaultAvatar} />

      <main className="main-content">
        <div className="container-small">
          {!editMode && (
            <section className="profile-card">
              <div className="profile-header">
                <div className="profile-image-container">
                  <div
                    className="profile-avatar"
                    style={{
                      backgroundImage: `url(${user.avatar || defaultAvatar})`,
                    }}
                  ></div>
                </div>

                <div className="profile-info">
                  <h3>{user.name}</h3>
                  <p className="join-date">طالب مسجل منذ {user.joinYear}</p>

                  <div className="tags-container">
                    <span className="tag tag-blue">
                      <span className="material-symbols-outlined">school</span>
                      {user.stage}
                    </span>
                  </div>
                </div>

                <div className="edit-action">
                  <button
                    className="btn-primary"
                    onClick={() => setEditMode(true)}
                  >
                    <span className="material-symbols-outlined">edit</span>
                    <span>تعديل الملف الشخصي</span>
                  </button>
                </div>
              </div>

              <hr className="separator" />

              <div className="info-grid">
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
                  { icon: "cake", label: "العمر", value: user.age },
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
                  <div className="info-item" key={i}>
                    <div className="info-icon">
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
            <section className="form-card">
              <form onSubmit={handleSave}>
                <div className="profile-image-edit">
                  <div className="image-wrapper">
                    <div
                      className="avatar-large"
                      style={{
                        backgroundImage: `url(${editUser.avatar || defaultAvatar})`,
                      }}
                    ></div>

                    <label htmlFor="avatar-upload" className="camera-btn">
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
                    <h3>{editUser.name}</h3>
                    <p>تعديل صورة الملف الشخصي</p>
                  </div>
                </div>

                <div className="inputs-grid">
                  {[
                    {
                      label: "الاسم الكامل",
                      name: "fullName",
                      icon: "person",
                      type: "text",
                    },
                    {
                      label: "العمر",
                      name: "age",
                      icon: "cake",
                      type: "number",
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
                    <div className="form-group" key={i}>
                      <label>{item.label}</label>
                      <div className="input-wrapper">
                        <span className="material-symbols-outlined field-icon">
                          {item.icon}
                        </span>
                        <input
                          name={item.name}
                          type={item.type}
                          value={editUser[item.name]}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  ))}

                  <div className="form-group ltr-input">
                    <label>رقم الهاتف</label>
                    <div className="input-wrapper">
                      <span className="material-symbols-outlined field-icon">
                        call
                      </span>
                      <input
                        name="phone"
                        type="tel"
                        value={editUser.phone}
                        onChange={handlePhoneChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button className="btn-primary" type="submit">
                    <span className="material-symbols-outlined">save</span>
                    <span>حفظ التعديلات</span>
                  </button>

                  <button
                    type="button"
                    className="btn-outline"
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
