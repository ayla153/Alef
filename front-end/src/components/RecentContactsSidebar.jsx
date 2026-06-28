import { FaAddressBook, FaArrowLeft } from 'react-icons/fa';
import ContactSidebarItem from './ContactSidebarItem';
import '../styles/StudentContacts.css';

const RECENT_LIMIT = 5;

export default function RecentContactsSidebar({
  contacts,
  onViewAll,
  onSelectContact,
  selectedKey,
}) {
  const recent = contacts.slice(0, RECENT_LIMIT);

  if (recent.length === 0) {
    return (
      <aside className="pr-contacts-sidebar pr-contacts-sidebar-empty">
        <h3 className="pcs-title">
          <FaAddressBook /> تواصلي
        </h3>
        <p className="pcs-empty">عندما توافق على طلب، يظهر رقم الطالب هنا.</p>
      </aside>
    );
  }

  return (
    <aside className="pr-contacts-sidebar">
      <div className="pcs-head">
        <h3 className="pcs-title">
          <FaAddressBook /> آخر التواصل
        </h3>
        <span className="pcs-count">{contacts.length}</span>
      </div>
      <p className="pcs-hint">آخر من شاركتَ أرقامهم معك</p>

      <div className="pcs-list">
        {recent.map((contact) => (
          <ContactSidebarItem
            key={contact.key}
            contact={contact}
            compact
            selected={selectedKey === contact.key}
            onClick={() => onSelectContact?.(contact)}
          />
        ))}
      </div>

      {contacts.length > RECENT_LIMIT && (
        <button type="button" className="pcs-view-all" onClick={onViewAll}>
          عرض الكل ({contacts.length}) <FaArrowLeft />
        </button>
      )}
      {contacts.length <= RECENT_LIMIT && contacts.length > 0 && (
        <button type="button" className="pcs-view-all" onClick={onViewAll}>
          تواصلي الكامل <FaArrowLeft />
        </button>
      )}
    </aside>
  );
}
