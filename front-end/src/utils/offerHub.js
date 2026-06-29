import { translateSubject, translateLevel, formatDate } from './translations';

export const HUB_FILTERS = [
  { value: '', label: 'الكل' },
  { value: 'pending', label: 'معلّقة' },
  { value: 'contact_shared', label: 'تم التواصل' },
  { value: 'rejected', label: 'مرفوضة' },
  { value: 'closed', label: 'منتهية' },
];

export const OUTCOME_META = {
  pending: { label: 'بانتظار قرار الطالب', cls: 'pending', short: 'معلّق' },
  contact_shared: { label: 'تم تبادل الأرقام', cls: 'shared', short: 'تواصل' },
  rejected: { label: 'مرفوض', cls: 'rejected', short: 'مرفوض' },
  lead_closed_empty: { label: 'أُغلق بلا تطابق', cls: 'closed', short: 'مغلق' },
  lead_closed_expired: { label: 'انتهت مدة الطلب', cls: 'closed', short: 'منتهٍ' },
};

function subjectLabel(subjectId, levelId, subjectsMap, levelsMap) {
  const subjectTitle = subjectsMap[subjectId] ? translateSubject(subjectsMap[subjectId]) : null;
  const levelTitle = levelsMap[levelId] ? translateLevel(levelsMap[levelId]) : null;
  return [subjectTitle, levelTitle].filter(Boolean).join(' · ');
}

/** Message / fee the tutor sent when accepting or offering. */
export function getTutorResponse(item) {
  if (item?.offer) {
    return {
      message: item.offer.message,
      firstSessionNote: item.offer.first_session_note,
      proposedFee: item.offer.proposed_fee,
      sentAt: item.offer.offer_created_at,
    };
  }

  const apps = item?.privateLead?.applications || [];
  const app =
    apps.find((a) => a.contact_revealed_at) ||
    apps[apps.length - 1];

  if (!app) return null;

  return {
    message: app.message,
    firstSessionNote: app.first_session_note,
    proposedFee: app.proposed_fee,
    sentAt: app.contact_revealed_at || app.created_at,
  };
}

export function buildOfferHubItems(offers = [], inboxLeads = [], subjectsMap = {}, levelsMap = {}) {
  const items = [];

  for (const offer of offers) {
    items.push({
      key: `offer-${offer.lead_application_id}`,
      source: 'public',
      outcome: offer.outcome,
      leadId: offer.post_requirements_id,
      title: offer.lead_title,
      studentName: 'طالب',
      studentPhone: offer.student_phone_number || null,
      subjectLabel: subjectLabel(offer.subject_id, offer.level_id, subjectsMap, levelsMap),
      sortAt: offer.contact_revealed_at || offer.offer_created_at,
      offer,
      privateLead: null,
      tutorResponse: {
        message: offer.message,
        firstSessionNote: offer.first_session_note,
        proposedFee: offer.proposed_fee,
        sentAt: offer.offer_created_at,
      },
    });
  }

  for (const lead of inboxLeads) {
    if (lead.lead_status !== 'closed_matched' || !lead.student_phone_number) continue;

    const response = getTutorResponse({ privateLead: lead });

    items.push({
      key: `private-${lead.post_requirements_id}`,
      source: 'private',
      outcome: 'contact_shared',
      leadId: lead.post_requirements_id,
      title: lead.title,
      studentName: lead.student_name?.trim() || 'طالب',
      studentPhone: lead.student_phone_number.trim(),
      subjectLabel: subjectLabel(lead.subject_id, lead.level_id, subjectsMap, levelsMap),
      sortAt: lead.closed_at || lead.created_at,
      offer: null,
      privateLead: lead,
      tutorResponse: response,
    });
  }

  return items.sort(
    (a, b) => new Date(b.sortAt || 0) - new Date(a.sortAt || 0)
  );
}

export function filterHubItems(items, filterValue) {
  if (!filterValue) return items;
  if (filterValue === 'closed') {
    return items.filter(
      (item) =>
        item.outcome === 'lead_closed_empty' || item.outcome === 'lead_closed_expired'
    );
  }
  return items.filter((item) => item.outcome === filterValue);
}

export function hubFilterCount(items, filterValue) {
  return filterHubItems(items, filterValue).length;
}

export function computeHubStats(items) {
  return {
    total: items.length,
    pending: items.filter((i) => i.outcome === 'pending').length,
    shared: items.filter((i) => i.outcome === 'contact_shared').length,
    rejected: items.filter((i) => i.outcome === 'rejected').length,
    closed: items.filter(
      (i) => i.outcome === 'lead_closed_empty' || i.outcome === 'lead_closed_expired'
    ).length,
  };
}

export function resolveFocusKey(items, { leadId }) {
  if (!leadId) return null;
  const id = Number(leadId);
  const match =
    items.find((item) => item.source === 'private' && item.leadId === id) ||
    items.find((item) => item.source === 'public' && item.leadId === id);
  return match?.key ?? null;
}

export function formatHubDate(value) {
  if (!value) return null;
  return formatDate(value);
}
