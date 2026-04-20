import { useState } from 'react';
import { FaUser, FaUserTag, FaPhone, FaEnvelope, FaLock, FaCheckCircle, FaArrowLeft, FaTimesCircle } from 'react-icons/fa';
import '../styles/CreateAccountStep1.css';
import logo from '../assets/Alef-logo.jpg';

export default function CreateAccountStep1() {
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [phonenumber, setPhonenumber] = useState('');
  const [tutoremail, setTutoremail] = useState('');
  const [tutorpassword, setTutorpassword] = useState('');
  const [coniformtutorpassword, setConiformtutorpassword] = useState('');

  return (
    <div className="page-container2">
      <header className="steponeheader">
        <div className="logoAndtitle">
          <img className="Alef-logo" src={logo} alt="logo" />
          إنشاء حساب مُعلّم - منصَّة ألِف
        </div>
      </header>
      <div className="content">
        <div className="titleforstep1">
          <h2>أهلاً بكُم في مِنصَّتنا التَّعليميَّة !</h2>
          <p className="welcom">يرجى إدخال بياناتك الشخصية الأساسية للبدء في إعداد ملفك الشخصي.</p>
          <div className="progress-bar-wrapper">
            <p className="personalinfo">الخطوةُ 1 من 4 : بيانات التّدريس</p>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '25%' }}></div>
            </div>
          </div>
        </div>
        <form className="tutorform">
          <div className="tutorinputs">
            <div>
              <label className="toturlabels" htmlFor="firstname"><FaUser className="input-icon" /> الاسم الأوّل</label>
              <input className="tutorinput" id="firstname" placeholder="أدخل اسمك الأوّل" required value={firstname} onChange={(e) => setFirstname(e.target.value)} />
            </div>
            <div>
              <label className="toturlabels" htmlFor="lastname"><FaUserTag className="input-icon" /> الاسم الأخير</label>
              <input className="tutorinput" id="lastname" placeholder="أدخل اسمك الأخير" required value={lastname} onChange={(e) => setLastname(e.target.value)} />
            </div>
          </div>
          <div className="tutorinputs">
            <div>
              <label className="toturlabels" htmlFor="phonenumber"><FaPhone className="input-icon" /> رقم الهاتف</label>
              <input className="tutorinput" type="tel" id="phonenumber" placeholder="+963 900 000 000" required value={phonenumber} onChange={(e) => setPhonenumber(e.target.value)} />
            </div>
            <div>
              <label className="toturlabels" htmlFor="tutoremail"><FaEnvelope className="input-icon" /> البريد الإلكتروني</label>
              <input className="tutorinput" id="tutoremail" placeholder="user@gmail.com" required value={tutoremail} onChange={(e) => setTutoremail(e.target.value)} />
            </div>
          </div>
          <div className="tutorinputs">
            <div>
              <label className="toturlabels" htmlFor="tutorpassword"><FaLock className="input-icon" /> كلمة السّر</label>
              <input className="tutorinput" id="tutorpassword" placeholder="كلمة السّر" required value={tutorpassword} onChange={(e) => setTutorpassword(e.target.value)} type="password" />
            </div>
            <div>
              <label className="toturlabels" htmlFor="coniformtutorpassword"><FaCheckCircle className="input-icon" /> تأكيد كلمة السّر</label>
              <input className="tutorinput" id="coniformtutorpassword" placeholder="تأكيد كلمة السّر" required value={coniformtutorpassword} onChange={(e) => setConiformtutorpassword(e.target.value)} type="password" />
            </div>
          </div>
          <div className="tutorbuttons">
              <button className="movetostep2"><FaArrowLeft className="btn-icon" /> متابعة للخطوة التالية</button>
              <button className="cancele"><FaTimesCircle className="btn-icon" /> إلغاء</button>
          </div>
          <p className="haveaccount">لديك حساب بالفعل ؟ <a href="#">تسجيل الدخول</a></p>
        </form>
      </div>
    </div>
  );
}