import { useState } from 'react';
import AdminHeader from './AdminHeader';
import AdminRequestsTab from './AdminRequestsTab';
import AdminAcceptedTeachersTab from './AdminAcceptedTeachersTab';
import AdminSubjectsStagesTab from './AdminSubjectsStagesTab';
import '../../styles/Admin/AdminDashboard.css';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('requests');

  return (
    <div className="admin-dashboard-container">
      <AdminHeader activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="admin-content">
        {activeTab === 'requests' && <AdminRequestsTab />}
        {activeTab === 'teachers' && <AdminAcceptedTeachersTab />}
        {activeTab === 'subjects-stages' && <AdminSubjectsStagesTab />}
      </div>
    </div>
  );
}