# Admin panel — team notes

Brief overview of admin UI/API changes, naming, and things that often confuse people.

---

## 1. Routes & auth

| Route | File | Role |
|-------|------|------|
| `/admin/login` | `AdminLogin.jsx` | Admin login → `POST /auth/admin/login` |
| `/admin` | `AdminDashboard.jsx` | Main dashboard (tabs) |
| `/admin/request/:id` | `AdminRequestDetails.jsx` | Review / verify / ban / restore one tutor |
| `/admin/teacher/:id` | `AdminTeacherDetails.jsx` | Verified tutor profile (ban / restore) |
| `/admin/teacher/:id/report` | `AdminTeacherReport.jsx` | Activity & reviews report |

| File | Role |
|------|------|
| `src/components/AdminRouteGuard.jsx` | Redirects to `/admin/login` if no admin JWT |
| `src/api/auth.js` | `loginAdmin()` |

### Confusing bits
- Admin token uses JWT `role: admin` — same `axiosClient` + `authStorage` as student/tutor.
- `/admin/*` (except login) is wrapped in `<AdminRouteGuard>` in `App.jsx`.

---

## 2. Tab labels (Arabic UI)

| Old | New |
|-----|-----|
| إدارة الطلبات | **مراجعة الحسابات** |
| الأساتذة المقبولين | **المعلّمون الموثّقون** |

Account status in tables:

| Backend logic | UI label |
|---------------|----------|
| `!verified && !is_banned` | بانتظار التحقق |
| `verified && !is_banned` | موثّق |
| `is_banned` | محظور |

Helper: `src/utils/adminTutorStatus.js` — `getAdminTutorStatus()`, `isMarketplaceTutor()`.

---

## 3. مراجعة الحسابات (`AdminRequestsTab`)

| Stat card | Meaning |
|-----------|---------|
| بانتظار التحقق | `pending` count |
| موثّقون | `accepted` count |
| محظورون | `rejected` (= `is_banned`) |
| **التدقيق** | Pending accounts registered **> 7 days ago** |

- Filters: الكل · بانتظار التحقق · موثّقون · محظورون
- Row action: **تحقق** → `/admin/request/:id`
- Data: `GET /tutors/` (admin sees banned too); status computed on frontend

---

## 4. المعلّمون الموثّقون (`AdminAcceptedTeachersTab`)

- List: `verified === true && !is_banned` (via `isMarketplaceTutor`)
- Actions per row: **التقارير** · **الملف** · **حظر**

---

## 5. Account actions (verify / ban / restore)

| UI action | API | Effect |
|-----------|-----|--------|
| توثيق الحساب | `PUT /admins/tutors/{id}/verify?verified=true` | `verified=true` |
| حظر الحساب | `PUT /admins/tutors/{id}/ban` | `is_banned=true` — soft delete |
| استرجاع الحساب | `PUT /admins/tutors/{id}/restore` | `is_banned=false` |

Frontend: `src/api/adminTeachers.js` — `verifyTutor`, `banTutor`, `restoreTutor`.

### Ban (soft delete) — backend behaviour
Banned tutor:
- Hidden from student marketplace (`GET /tutors/` excludes banned for non-admin)
- Cannot submit offers or receive private leads
- Cannot log in / refresh token
- Data kept in DB (reviews, reports, history)

### Restore
- Clears `is_banned`; if still `verified`, returns to marketplace
- Re-sends verified notification if applicable

### Confusing bits
- **Do not use `deleteTutor`** for admin ban — prefer `banTutor`. Hard delete still exists but is not the main flow.
- Cannot verify a banned account until restored.
- `AdminRequestDetails`: actions live **inside the name/email card** (square buttons on the left in RTL).

---

## 6. Tutor report (`AdminTeacherReport`)

| API | `GET /admins/tutors/{id}/report` |
|-----|----------------------------------|
| Fields | `offers_submitted_count`, `private_leads_received_count`, `favorites_count`, `average_rating`, `reviews[]`, `last_seen_at`, `registered_at` |

Opened from **التقارير** button on verified teachers tab.

`last_seen_at` is inferred from notifications / offers / private leads — not true `last_login`.

---

## 7. Key files

| Area | Files |
|------|-------|
| Pages | `src/Pages/Admin/*` |
| API | `src/api/adminTeachers.js`, `src/api/tutorMapper.js` |
| Status helpers | `src/utils/adminTutorStatus.js` |
| Styles | `src/styles/Admin/*.css` |

### Backend (for context)
| File | Role |
|------|------|
| `app/api/routers/Admins/Admin_router.py` | Admin endpoints (report, ban, restore, verify) |
| `app/services/admin_service.py` | Business logic |
| `app/models/tutors.py` | `is_banned`, `banned_at` |
| Migration | `alembic/versions/e8f9a0b1c2d3_add_tutor_is_banned.py` |

---

## Quick “what do I import?”

| Need | Import |
|------|--------|
| Tutor list / details | `getAllTutors`, `getTutorById` from `api/adminTeachers.js` |
| Verify / ban / restore | `verifyTutor`, `banTutor`, `restoreTutor` |
| Report | `getTutorReport` |
| Status in UI | `getAdminTutorStatus`, `isMarketplaceTutor` from `utils/adminTutorStatus.js` |
| Admin login | `loginAdmin` from `api/auth.js` |

---

## Local dev checklist

1. Log in at **`/admin/login`** (admin account).
2. Ensure migration `e8f9a0b1c2d3` applied (`uv run alembic upgrade head` in `back-end/`).
3. `GET /tutors/` as admin returns banned tutors; student UI filters with `isMarketplaceTutor`.
