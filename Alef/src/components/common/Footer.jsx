import { useState } from 'react';
import { FaBuilding, FaLaptopCode, FaEnvelope, FaLinkedin, FaTwitter, FaFacebook, FaPaperPlane } from 'react-icons/fa';
import '../../styles/tstyle/Footer.css';
import logo from '../../assets/logo_noBG.png';

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    console.log('البريد المشترك:', email);
    alert('شكراً للاشتراك!');
    setEmail('');
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <img src={logo} alt="ألف" className="footer-logo" />
          <h3>ألف</h3>
          <p>تمكن الطلاب والمعلمين من التواصل والتعلم في بيئة رقمية حديثة من خلال منصة ألف.</p>
        </div>
        <div className="footer-links">
          <div className="footer-column">
            <h4><FaBuilding className="column-icon" /> الشركة</h4>
            <ul>
              <li><a href="#">من أجل التوظيف</a></li>
              <li><a href="#">المدونة</a></li>
              <li><a href="#">العمل بنا</a></li>
            </ul>
          </div>
          <div className="footer-column">
            <h4><FaLaptopCode className="column-icon" /> المنصة</h4>
            <ul>
              <li><a href="#">تجمع المعلمين</a></li>
              <li><a href="#">كيف تعمل</a></li>
              <li><a href="#">الإسعاف</a></li>
              <li><a href="#">الفصل الداخلي</a></li>
            </ul>
          </div>
          <div className="footer-column">
            <h4><FaEnvelope className="column-icon" /> اشترك معنا</h4>
            <p>احصل على آخر التحديثات ونصائح التعلم</p>
            <form className="subscribe-form" onSubmit={handleSubscribe}>
              <input type="email" placeholder="البريد الإلكتروني" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <button type="submit"><FaPaperPlane /> اشتراك</button>
            </form>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2024، أليف للتعليم جميع الحقوق محفوظة.</p>
      </div>
    </footer>
  );
}