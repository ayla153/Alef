import { getSubjects, getLevels } from '../api/tutorRegistration';

let subjectsCache = null;
let levelsCache = null;

export async function fetchTutorCatalog() {
  if (!subjectsCache) {
    const subjectsRes = await getSubjects();
    const map = {};
    subjectsRes.data.forEach((sub) => {
      map[sub.subject_id] = sub.subject_title;
    });
    subjectsCache = map;
  }

  if (!levelsCache) {
    const levelsRes = await getLevels();
    const map = {};
    levelsRes.data.forEach((level) => {
      map[level.level_id] = level.level_title;
    });
    levelsCache = map;
  }

  const subjectsList = Object.entries(subjectsCache).map(([id, title]) => ({
    subject_id: Number(id),
    subject_title: title,
  }));

  const levelsList = Object.entries(levelsCache).map(([id, title]) => ({
    level_id: Number(id),
    level_title: title,
  }));

  return {
    subjectsMap: subjectsCache,
    levelsMap: levelsCache,
    subjectsList,
    levelsList,
  };
}

export function enrichLeadWithCatalog(lead, subjectsMap, levelsMap) {
  return {
    ...lead,
    subjectTitle: subjectsMap[lead.subject_id] || null,
    levelTitle: levelsMap[lead.level_id] || null,
  };
}
