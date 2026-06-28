import { translateSubject, translateLevel } from './translations';

/** Build a unified contact list from private inbox + public offers. */
export function buildTutorContacts(inboxLeads = [], publicOffers = [], subjectsMap = {}, levelsMap = {}) {
  const contacts = [];
  const seenPhones = new Set();

  for (const lead of inboxLeads) {
    if (lead.lead_status !== 'closed_matched' || !lead.student_phone_number) continue;
    const phone = lead.student_phone_number.trim();
    if (!phone || seenPhones.has(phone)) continue;
    seenPhones.add(phone);

    const subject = subjectsMap[lead.subject_id]?.subject_title;
    const level = levelsMap[lead.level_id]?.level_title;
    const subjectTitle = subject ? translateSubject(subject) : null;
    const levelTitle = level ? translateLevel(level) : null;
    const subjectLabel = [subjectTitle, levelTitle].filter(Boolean).join(' · ');

    contacts.push({
      key: `private-${lead.post_requirements_id}`,
      studentName: lead.student_name?.trim() || 'طالب',
      phone,
      subjectTitle,
      levelTitle,
      subjectLabel,
      source: 'private',
      title: lead.title,
      leadId: lead.post_requirements_id,
      sortAt: lead.closed_at || lead.created_at,
    });
  }

  for (const offer of publicOffers) {
    if (offer.outcome !== 'contact_shared' || !offer.student_phone_number) continue;
    const phone = offer.student_phone_number.trim();
    if (!phone || seenPhones.has(phone)) continue;
    seenPhones.add(phone);

    const subject = subjectsMap[offer.subject_id]?.subject_title;
    const level = levelsMap[offer.level_id]?.level_title;
    const subjectTitle = subject ? translateSubject(subject) : null;
    const levelTitle = level ? translateLevel(level) : null;
    const subjectLabel = [subjectTitle, levelTitle].filter(Boolean).join(' · ');

    contacts.push({
      key: `offer-${offer.lead_application_id}`,
      studentName: 'طالب',
      phone,
      subjectTitle,
      levelTitle,
      subjectLabel,
      source: 'public',
      title: offer.lead_title,
      leadId: offer.post_requirements_id,
      sortAt: offer.contact_revealed_at || offer.offer_created_at,
    });
  }

  return contacts.sort(
    (a, b) => new Date(b.sortAt || 0) - new Date(a.sortAt || 0)
  );
}
