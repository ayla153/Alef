import '../../styles/tstyle/RecentRequeste.css'
import { FaCheckCircle, FaTrashAlt } from 'react-icons/fa';

export default function RecentRequeste({ request, onConfirm, onDelete }){
 const {
    studentName = 'طالب',
    studentImage = 'https://randomuser.me/api/portraits/men/1.jpg',
    stage = 'المرحلة الثانوية',
    subject = 'الرياضيات',
  } = request || {};
   return(
    <div className="recent-request-card">
      <div className="student-image">
        <img src={studentImage} alt={studentName} />
      </div>
      <div className="request-info">
        <h4 className="student-name">{studentName}</h4>
        <p className="request-details">
          <span className="detail-label">المرحلة:</span> {stage}
        </p>
        <p className="request-details">
          <span className="detail-label">المادة:</span> {subject}
        </p>
      </div>
      <div className="request-actions">
        <button className="action-btn confirm-btn" onClick={onConfirm} title="تأكيد">
          <FaCheckCircle />
        </button>
        <button className="action-btn delete-btn" onClick={onDelete} title="حذف">
          <FaTrashAlt />
        </button>
      </div>
    </div>
   )
}