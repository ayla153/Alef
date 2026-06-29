export function isLeadAvailable(lead) {
  if (lead.lead_status !== 'open') return false;
  if (!lead.accepting_applications) return false;
  if (!lead.isPrivate && lead.max_applications != null) {
    return (lead.pending_offer_count ?? 0) < lead.max_applications;
  }
  return true;
}

export function matchesBudget(lead, budgetMin, budgetMax) {
  const filterMin = budgetMin !== '' ? Number(budgetMin) : null;
  const filterMax = budgetMax !== '' ? Number(budgetMax) : null;
  if (filterMin == null && filterMax == null) return true;

  const leadMin = lead.min_expected_fee ?? 0;
  const leadMax = lead.max_expected_fee ?? Infinity;
  const min = filterMin ?? 0;
  const max = filterMax ?? Infinity;
  return leadMax >= min && leadMin <= max;
}

export function slotsFillRatio(lead) {
  if (!lead.max_applications) return 0;
  return (lead.pending_offer_count ?? 0) / lead.max_applications;
}

export function filterAndSortLeads(leads, { subjectId, levelId, budgetMin, budgetMax, availableOnly, sortBy }) {
  let result = leads.filter((lead) => {
    if (subjectId && String(lead.subject_id) !== String(subjectId)) return false;
    if (levelId && String(lead.level_id) !== String(levelId)) return false;
    if (!matchesBudget(lead, budgetMin, budgetMax)) return false;
    if (availableOnly && !isLeadAvailable(lead)) return false;
    return true;
  });

  if (sortBy === 'slots_filling') {
    result = [...result].sort((a, b) => {
      const ratioDiff = slotsFillRatio(b) - slotsFillRatio(a);
      if (ratioDiff !== 0) return ratioDiff;
      return new Date(b.created_at) - new Date(a.created_at);
    });
  } else {
    result = [...result].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
  }

  return result;
}
