import { useState } from 'react';
import { FaQuestionCircle, FaChevronDown } from 'react-icons/fa';
import '../styles/FAQItem.css';

export default function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className={`faq-card ${isOpen ? 'open' : ''}`}>
      <div className="faq-question" onClick={() => setIsOpen(!isOpen)}>
        <div className="question-text">
          <FaQuestionCircle className="question-icon" />
          <span>{question}</span>
        </div>
        <div className={`arrow-icon ${isOpen ? 'rotated' : ''}`}>
          <FaChevronDown />
        </div>
      </div>
      <div className="faq-answer-wrapper">
        <div className="faq-answer">{answer}</div>
      </div>
    </div>
  );
}