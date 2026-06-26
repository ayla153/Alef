import React, { useEffect } from 'react';
import '../../styles/sstyle/RequestSuccess.css';
import Header from '../../components/Header';
import { useNavigate } from "react-router-dom";

export default function RequestSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const buttons = document.querySelectorAll('.rs-btn-animate');
    
    const handleMouseDown = (e) => e.currentTarget.style.transform = 'scale(0.95)';
    const handleMouseUp = (e) => e.currentTarget.style.transform = 'scale(1)';
    const handleMouseLeave = (e) => e.currentTarget.style.transform = 'scale(1)';

    buttons.forEach(button => {
      button.addEventListener('mousedown', handleMouseDown);
      button.addEventListener('mouseup', handleMouseUp);
      button.addEventListener('mouseleave', handleMouseLeave);
    });

    return () => {
      buttons.forEach(button => {
        button.removeEventListener('mousedown', handleMouseDown);
        button.removeEventListener('mouseup', handleMouseUp);
        button.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, []);

  return (
    <div className="rs-wrapper">
      <Header/>
      <main className="rs-main-content">
        <div className="rs-container fade-in-up">
          
          <div className="rs-success-checkmark">
            <div className="rs-pulse-ring">
              <div className="rs-icon-bg">
                <span className="material-symbols-outlined rs-check-icon" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
              </div>
            </div>
            <div className="rs-particle rs-particle-top"></div>
            <div className="rs-particle rs-particle-bottom"></div>
          </div>

          <div className="rs-text-space">
            <h1 className="rs-title">تم نشر طلبك بنجاح!</h1>
            <p className="rs-description">
              سيتم التواصل معك فور قبول أحد المعلمين لطلبك. يمكنك متابعة حالة طلباتك من صفحة "طلباتي".
            </p>
          </div>

          <div className="rs-action-buttons">
            <button onClick={() => navigate('/MyLeads')} className="rs-btn rs-btn-primary rs-btn-animate">
              <span className="material-symbols-outlined">assignment</span>
              <span>الذهاب إلى طلباتي</span>
            </button>
            
            <button onClick={() => navigate('/home')} className="rs-btn rs-btn-secondary rs-btn-animate">
              <span className="material-symbols-outlined">home</span>
              <span>العودة للرئيسية</span>
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}