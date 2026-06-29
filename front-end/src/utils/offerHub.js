import { translateSubject, translateLevel, formatDate } from './translations';

export const SOURCE_TABS = [
  { value: '', label: 'الكل', icon: 'all' },
  { value: 'private', label: 'طلبات خاصة', icon: 'private' },
  { value: 'public', label: 'عروض عامة', icon: 'public' },
];

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

export function hasContactExchange(item) {
  return item?.outcome === 'contact_shared' && Boolean(item?.studentPhone);
}

function derivePrivateOutcome(lead) {
  const phone = lead.student_phone_number?.trim() || null;
  if (lead.lead_status === 'closed_matched' && phone) {
    return 'contact_shared';
  }
  const apps = lead.applications || [];
  if (apps.some((a) => a.contact_revealed_at) && phone) {
    return 'contact_shared';
  }
  if (lead.lead_status === 'closed_expired') return 'lead_closed_expired';
  if (lead.lead_status === 'closed_empty') return 'lead_closed_empty';
  const myApp = apps[apps.length - 1];
  if (myApp?.application_status === 'rejected') return 'rejected';
  return 'pending';
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
    const phone = lead.student_phone_number?.trim() || null;
    const isMatchedContact = lead.lead_status === 'closed_matched' && Boolean(phone);
    const response = getTutorResponse({ privateLead: lead });
    const hasResponded = Boolean(response?.message || response?.proposedFee != null);

    if (!isMatchedContact && !hasResponded) continue;

    const outcome = derivePrivateOutcome(lead);
    const tutorResponse = response || {
      message: null,
      firstSessionNote: null,
      proposedFee: null,
      sentAt: lead.closed_at || lead.created_at,
    };

    items.push({
      key: `private-${lead.post_requirements_id}`,
      source: 'private',
      outcome,
      leadId: lead.post_requirements_id,
      title: lead.title,
      studentName: lead.student_name?.trim() || 'طالب',
      studentPhone: outcome === 'contact_shared' ? phone : null,
      subjectLabel: subjectLabel(lead.subject_id, lead.level_id, subjectsMap, levelsMap),
      sortAt: tutorResponse.sentAt || lead.closed_at || lead.created_at,
      offer: null,
      privateLead: lead,
      tutorResponse,
    });
  }

  return items.sort(
    (a, b) => new Date(b.sortAt || 0) - new Date(a.sortAt || 0)
  );
}

/** Contacts hub: matched private leads + public offers where numbers were shared. */
export function buildContactHubItems(offers = [], inboxLeads = [], subjectsMap = {}, levelsMap = {}) {
  const items = [];

  for (const offer of offers) {
    if (offer.outcome !== 'contact_shared' || !offer.student_phone_number) continue;

    items.push({
      key: `offer-${offer.lead_application_id}`,
      source: 'public',
      outcome: 'contact_shared',
      leadId: offer.post_requirements_id,
      title: offer.lead_title,
      studentName: 'طالب',
      description: offer.lead_description || null,
      studentPhone: offer.student_phone_number,
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
    const phone = lead.student_phone_number?.trim() || null;
    if (lead.lead_status !== 'closed_matched' || !phone) continue;

    const response = getTutorResponse({ privateLead: lead });
    const tutorResponse = response || {
      message: null,
      firstSessionNote: null,
      proposedFee: null,
      sentAt: lead.closed_at || lead.created_at,
    };

    items.push({
      key: `private-${lead.post_requirements_id}`,
      source: 'private',
      outcome: 'contact_shared',
      leadId: lead.post_requirements_id,
      title: lead.title,
      studentName: lead.student_name?.trim() || 'طالب',
      description: lead.description || null,
      studentPhone: phone,
      subjectLabel: subjectLabel(lead.subject_id, lead.level_id, subjectsMap, levelsMap),
      sortAt: tutorResponse.sentAt || lead.closed_at || lead.created_at,
      offer: null,
      privateLead: lead,
      tutorResponse,
    });
  }

  return items.sort(
    (a, b) => new Date(b.sortAt || 0) - new Date(a.sortAt || 0)
  );
}

export function filterHubItems(items, outcomeFilter, sourceFilter = '') {
  let result = items;
  if (sourceFilter) {
    result = result.filter((item) => item.source === sourceFilter);
  }
  if (!outcomeFilter) return result;
  if (outcomeFilter === 'closed') {
    return result.filter(
      (item) =>
        item.outcome === 'lead_closed_empty' || item.outcome === 'lead_closed_expired'
    );
  }
  return result.filter((item) => item.outcome === outcomeFilter);
}

export function hubFilterCount(items, outcomeFilter, sourceFilter = '') {
  return filterHubItems(items, outcomeFilter, sourceFilter).length;
}

export function computeHubStats(items) {
  return {
    total: items.length,
    private: items.filter((i) => i.source === 'private').length,
    public: items.filter((i) => i.source === 'public').length,
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
