# Frontend team notes — recent changes

Brief overview of what changed under `front-end/`, why, and things that often confuse people.

---

## 1. API client & auth tokens

### What changed
| File | Role |
|------|------|
| `src/api/axiosClient.js` | **Main HTTP client** — base URL, attaches Bearer token, auto-refresh on 401 |
| `src/api/api.js` | Re-exports `axiosClient` only (`export { default } from './axiosClient'`) |
| `src/api/authStorage.js` | **New** — `access_token` + `refresh_token` in `localStorage`, JWT decode, `getAuthRole()` |
| `src/api/sessionManager.js` | **New** — session warning timer, `refreshSessionTokens()`, `logoutSession()` |
| `src/api/auth.js` | **New** — `loginStudent()`, `loginTutor()` (separate endpoints) |

### Why
- Before: some pages used raw `axios`, some used `localStorage.token`, registration used `access_token` → 401s and broken refresh.
- Now: import `api` from `api/api.js` (or `axiosClient` directly) everywhere for authenticated calls.

### Confusing bits
- **Registration tokens** still take priority in `axiosClient` during signup (`student_registration_token` / `tutor_registration_token`). Don’t mix registration flow with normal login on the same tab without clearing those keys.
- **`getAuthRole()`** reads `role` from the JWT (`student` | `tutor` | `admin`). Use this instead of guessing from the URL.
- After deploy, users with only the old `token` key need to **log in again** to get `refresh_token`.

---

## 2. Session expiry popup

| File | Role |
|------|------|
| `src/components/SessionExpiryPrompt.jsx` | Global modal ~2 min before access token expires |
| `src/styles/sstyle/SessionExpiryPrompt.css` | Styles |
| `src/App.jsx` | Mounts `<SessionExpiryPrompt />` above all routes |

### Why
Backend access tokens are short-lived; refresh token renews them. Users get a chance to stay logged in without silent logout.

### Confusing bits
- Must stay in **`App.jsx`**, not inside a single page — it listens for `session:expiring-soon` globally.
- Login/OTP must call **`saveAuthTokens()`** so timers and refresh work.

---

## 3. Login

| File / route | Role |
|--------------|------|
| `src/Pages/student/login.jsx` | **`/login`** — student form → `POST /auth/student/login` → `/home` |
| `src/api/auth.js` | `loginStudent()` (tutor login: `loginTutor()` if needed elsewhere) |

### Confusing bits
- **`/otp`** is **registration OTP only**, not password reset.
- Tutors who need a dedicated login page can use `loginTutor` + a separate route later; current `/login` is **student-only**.

---

## 4. Forgot password (two steps)

| File / route | Role |
|--------------|------|
| `src/Pages/student/ForgotPassword.jsx` | **`/forgot-password`** — enter email, request OTP |
| `src/Pages/student/ResetPassword.jsx` | **`/reset-password`** — step 1: verify OTP, step 2: new password |
| `src/api/passwordReset.js` | API + `sessionStorage` for email / reset token between steps |

### Backend calls (for context)
1. `POST /auth/password-reset/request` `{ email }`
2. `POST /auth/password-reset/verify` `{ email, otp }` → `password_reset_token`
3. `POST /auth/password-reset/confirm` `{ password_reset_token, new_password }`

### Why
OTP and new password are **not on one screen** — verify code first, then set password (matches backend token flow).

### Confusing bits
- **`dev_otp`** may appear in the API response in local dev (no SMTP) — shown on ForgotPassword for testing; also printed in backend terminal.
- Reset uses **`sessionStorage`** (`password_reset_email`, `password_reset_token`), not `localStorage`.
- Password reset is **by email** on the backend (finds student or tutor); login is still **role-specific**.

---

## 5. Tutors list (public catalog)

| File | Change |
|------|--------|
| `src/api/publicTutors.js` | `getPublicTutors()` → `GET /tutors/` (no auth required) |
| `src/Pages/student/TutorsPage.jsx` | Uses `getPublicTutors` instead of hardcoded `localhost` axios |
| `src/Pages/student/HomePage.jsx` | Same + only calls `/favorites/my-favorites` and `/leads/me` when `getAuthRole() === 'student'` |

### Why
- `/tutors/` is public; favorites and “my leads” need a **student** token — calling them as tutor caused 403 noise.
- Verified tutors only in list UI: `.filter(t => t.verified === true)` (backend may still return unverified for admin).

---

## 6. Create lead wizard (step 2 budget)

| File | Change |
|------|--------|
| `src/Pages/student/CreateLeadStep2.jsx` | **Dual slider** for `min_expected_fee` and `max_expected_fee` (50–1000 ل.س) |
| `src/Pages/student/CreateLeadWizard.jsx` | Payload sends `help_type`, `min_expected_fee`, `max_expected_fee`, `weekly_classes` |

### Field mapping (UI → API)
| UI | API |
|----|-----|
| `helpType` | `help_type` |
| min slider | `min_expected_fee` |
| max slider | `max_expected_fee` |
| `weeklyClasses` | `weekly_classes` |

### Confusing bits
- Time-of-day input is **commented out** in step 2 — not sent to backend yet.
- Old field name `expected_fee` is gone; use `max_expected_fee`.

---

## 7. Tutor profile (dashboard)

| File | Change |
|------|--------|
| `src/Pages/teacher/TutorProfile.jsx` | **View mode by default**; “تعديل الملف الشخصي” enters edit mode |
| `src/styles/TutorProfile.css` | `.profile-view-value`, `.edit-profile-btn` |

### Why
Page used to open as one big edit form; tutors only wanted to preview their profile.

### Confusing bits
- Subjects, stage prices, certificates still **don’t persist** on save — only personal fields + `tution_type` go to `PATCH /tutors/{id}`. Hints in UI are accurate.
- Photo upload only in **edit mode**; upload hits API immediately (`uploadTutorPhoto`).

---

## 8. Routes summary (`App.jsx`)

New or important paths:

```
/login              → Login (student)
/forgot-password    → ForgotPassword
/reset-password     → ResetPassword
/otp                → Registration OTP only
```

Existing student/tutor/admin routes unchanged.

---

## Quick “what do I import?”

| Need | Import |
|------|--------|
| HTTP with auth | `import api from '../api/api'` |
| Login | `loginStudent` / `loginTutor` from `api/auth.js` |
| Tokens / role | `saveAuthTokens`, `getAuthRole`, `clearAuthTokens` from `api/authStorage.js` |
| Logout | `logoutSession` from `api/sessionManager.js` |
| Public tutor list | `getPublicTutors` from `api/publicTutors.js` |
| Password reset | `passwordReset.js` |

---

## Local dev checklist

1. `VITE_API_BASE_URL` in `.env` (default `http://localhost:8000`).
2. Log in at **`/login`** (student account).
3. Password reset OTP: check API `dev_otp` or backend terminal if email isn’t configured.
4. Restart backend after API changes (`just start` without `--reload` won’t pick up code).

Questions → backend auth/OTP docs or `docs/leads-api-guide.md` for lead fields.
