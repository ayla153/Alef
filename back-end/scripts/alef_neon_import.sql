-- =============================================================================
-- Alef — import local data into Neon (plain INSERT SQL)
-- Generated from local alef_db. Works in pgAdmin Query Tool and Neon SQL Editor.
--
-- PREREQUISITE (required — do this first or TRUNCATE/INSERT will fail):
--   From back-end/ with .env pointing at Neon:
--     uv run alembic upgrade head
--   Or start the API once (just run) so tables are created, then run migrations.
--
-- This file imports ROWS only. It does NOT create tables.
-- If you see: relation "lead_applications" does not exist
--   → schema is missing on the DB you connected to (wrong branch/DB, or migrations not run).
--
-- Verify in Query Tool before running this file:
--   SELECT table_name FROM information_schema.tables
--   WHERE table_schema = 'public' ORDER BY table_name;
-- You should see lead_applications, post_requirements, students, etc.
--
-- Connect to: neondb @ your Neon direct host (same DB as back-end/.env).
-- =============================================================================

BEGIN;

TRUNCATE TABLE
    lead_applications,
    lead_targets,
    post_requirements,
    tutor_subjects,
    favorites,
    reviews,
    addresses,
    students,
    tutors,
    subjects,
    levels,
    cities,
    areas,
    admins
RESTART IDENTITY CASCADE;

-- ---------------------------------------------------------------------------
-- Reference data
-- ---------------------------------------------------------------------------

INSERT INTO public.levels (level_id, level_title) VALUES (1, 'Primary');
INSERT INTO public.levels (level_id, level_title) VALUES (2, 'Middle');
INSERT INTO public.levels (level_id, level_title) VALUES (3, 'High');
INSERT INTO public.levels (level_id, level_title) VALUES (5, 'Tawjihi');
INSERT INTO public.levels (level_id, level_title) VALUES (6, 'Tawjihi');
INSERT INTO public.levels (level_id, level_title) VALUES (7, 'Tawjihi');

INSERT INTO public.subjects (subject_id, subject_title, subject_description) VALUES (1, 'Mathematics', 'Core math subject');
INSERT INTO public.subjects (subject_id, subject_title, subject_description) VALUES (2, 'English', 'Language and writing');
INSERT INTO public.subjects (subject_id, subject_title, subject_description) VALUES (3, 'Physics', 'Science fundamentals');
INSERT INTO public.subjects (subject_id, subject_title, subject_description) VALUES (5, 'Mathematics', 'Math tutoring for all levels');
INSERT INTO public.subjects (subject_id, subject_title, subject_description) VALUES (6, 'Mathematics', 'Math tutoring for all levels');
INSERT INTO public.subjects (subject_id, subject_title, subject_description) VALUES (7, 'Mathematics', 'Math tutoring for all levels');

-- ---------------------------------------------------------------------------
-- Users
-- ---------------------------------------------------------------------------

INSERT INTO public.admins (admin_id, first_name, last_name, email, password) VALUES (1, 'Demo', 'Admin', 'admin@example.com', '$2b$12$0gCExRPhvCFqG4AKix0wyOQ1Xm6pL2GoNZtcWwp.dbRwyizpKRv.u');

INSERT INTO public.students (student_id, first_name, last_name, date_birth, email, password, phone_number, student_photo, registered_at, grade_level) VALUES (1, 'shahd', 'abbara', '2010-01-15 00:00:00', 'student1@example.com', '$2b$12$6.PDQa6HrtTRbCPvD3ND/ekaDfHpFMaRR//7tw4TjBJCKEN3DADlm', '0987654321', 'string', '2026-06-08 20:17:38.714809', 'high_3');
INSERT INTO public.students (student_id, first_name, last_name, date_birth, email, password, phone_number, student_photo, registered_at, grade_level) VALUES (2, 'Omar', 'Student', '2011-06-20 00:00:00', 'student2@example.com', '$2b$12$6xwx76sJ5uD0ca95zuQwU.1WmTgpg/MVNW3Lrgxo21uVL0W5vcKGW', '0599000002', NULL, '2026-06-08 20:17:38.714809', 'middle_2');

INSERT INTO public.tutors (tutor_id, first_name, last_name, email, password, date_birth, phone_number, tutor_photo, tutor_video, bio, total_experience_years, registered_at, tution_type, verified) VALUES (1, 'Ahmed', 'Tutor', 'tutor1@example.com', '$2b$12$6xwx76sJ5uD0ca95zuQwU.1WmTgpg/MVNW3Lrgxo21uVL0W5vcKGW', '1990-03-10 00:00:00', '0599111001', NULL, NULL, 'Math specialist, 8 years experience.', 8, '2026-06-08 20:17:38.714809', 'both', true);
INSERT INTO public.tutors (tutor_id, first_name, last_name, email, password, date_birth, phone_number, tutor_photo, tutor_video, bio, total_experience_years, registered_at, tution_type, verified) VALUES (2, 'Layla', 'Tutor', 'tutor2@example.com', '$2b$12$6xwx76sJ5uD0ca95zuQwU.1WmTgpg/MVNW3Lrgxo21uVL0W5vcKGW', '1992-07-22 00:00:00', '0599111002', NULL, NULL, 'Physics and math tutor.', 5, '2026-06-08 20:17:38.714809', 'online', true);
INSERT INTO public.tutors (tutor_id, first_name, last_name, email, password, date_birth, phone_number, tutor_photo, tutor_video, bio, total_experience_years, registered_at, tution_type, verified) VALUES (3, 'Khaled', 'Tutor', 'tutor3@example.com', '$2b$12$6xwx76sJ5uD0ca95zuQwU.1WmTgpg/MVNW3Lrgxo21uVL0W5vcKGW', '1988-11-05 00:00:00', '0599111003', NULL, NULL, 'English and math.', 6, '2026-06-08 20:17:38.714809', 'online', true);

INSERT INTO public.alembic_version (version_num) VALUES ('e7b2c4d91f05');

-- ---------------------------------------------------------------------------
-- Leads
-- ---------------------------------------------------------------------------

INSERT INTO public.post_requirements (post_requirements_id, title, description, foundation_tution, tution_type, expected_fee, created_at, expired_at, preferred_gender, student_id, subject_id, level_id, lead_status, is_public, accepting_applications, closed_at, max_applications) VALUES (1, 'Math tutor needed — Tawjihi', 'Looking for help with calculus and past papers. Prefer evening sessions.', false, 'online', 25, '2026-06-06 20:17:38.714809', '2026-07-06 20:17:38.714809', NULL, 1, 1, 1, 'closed_shortlist', true, false, '2026-06-08 17:25:16.459964', 5);
INSERT INTO public.post_requirements (post_requirements_id, title, description, foundation_tution, tution_type, expected_fee, created_at, expired_at, preferred_gender, student_id, subject_id, level_id, lead_status, is_public, accepting_applications, closed_at, max_applications) VALUES (2, 'Physics-style math — middle school', 'Weekly sessions, exam-style practice.', false, 'both', 20, '2026-06-03 20:17:38.714809', '2026-07-03 20:17:38.714809', 'female', 1, 1, 1, 'open', true, true, NULL, 5);
INSERT INTO public.post_requirements (post_requirements_id, title, description, foundation_tution, tution_type, expected_fee, created_at, expired_at, preferred_gender, student_id, subject_id, level_id, lead_status, is_public, accepting_applications, closed_at, max_applications) VALUES (3, 'English conversation — closed with offers', 'Student closed after receiving offers.', false, 'online', 30, '2026-05-29 20:17:38.714809', '2026-06-28 20:17:38.714809', NULL, 1, 1, 1, 'closed_shortlist', true, false, '2026-06-07 20:17:38.714809', 5);
INSERT INTO public.post_requirements (post_requirements_id, title, description, foundation_tution, tution_type, expected_fee, created_at, expired_at, preferred_gender, student_id, subject_id, level_id, lead_status, is_public, accepting_applications, closed_at, max_applications) VALUES (4, 'Private request from profile', 'Interested in regular sessions with this tutor only.', false, 'offline', 35, '2026-06-07 20:17:38.714809', '2026-07-07 20:17:38.714809', NULL, 1, 1, 1, 'closed_matched', false, false, '2026-06-08 17:25:02.498916', 5);
INSERT INTO public.post_requirements (post_requirements_id, title, description, foundation_tution, tution_type, expected_fee, created_at, expired_at, preferred_gender, student_id, subject_id, level_id, lead_status, is_public, accepting_applications, closed_at, max_applications) VALUES (5, 'Private — tutor accepted', 'Tutor tapped accept contact; student has not closed yet.', false, 'online', 40, '2026-06-05 20:17:38.714809', '2026-07-05 20:17:38.714809', NULL, 2, 1, 1, 'open', false, false, NULL, 5);
INSERT INTO public.post_requirements (post_requirements_id, title, description, foundation_tution, tution_type, expected_fee, created_at, expired_at, preferred_gender, student_id, subject_id, level_id, lead_status, is_public, accepting_applications, closed_at, max_applications) VALUES (6, 'Private — matched and closed', 'Student closed as matched after tutor accept.', false, 'online', 45, '2026-05-25 20:17:38.714809', '2026-06-24 20:17:38.714809', NULL, 2, 1, 1, 'closed_matched', false, false, '2026-06-06 20:17:38.714809', 5);
INSERT INTO public.post_requirements (post_requirements_id, title, description, foundation_tution, tution_type, expected_fee, created_at, expired_at, preferred_gender, student_id, subject_id, level_id, lead_status, is_public, accepting_applications, closed_at, max_applications) VALUES (7, 'E2E new public lead', 'Integration test public lead from student2', false, 'online', 30, '2026-06-08 17:25:01.930072', '2026-07-08 17:25:01.930072', NULL, 2, 1, 1, 'closed_empty', true, false, '2026-06-08 17:25:02.485411', 5);
INSERT INTO public.post_requirements (post_requirements_id, title, description, foundation_tution, tution_type, expected_fee, created_at, expired_at, preferred_gender, student_id, subject_id, level_id, lead_status, is_public, accepting_applications, closed_at, max_applications) VALUES (8, 'Accept closes test', 'test', false, 'online', 30, '2026-06-08 17:38:34.582489', '2026-07-08 17:38:34.582489', NULL, 1, 2, 1, 'closed_matched', false, false, '2026-06-08 17:38:34.616777', 5);

INSERT INTO public.lead_applications (lead_application_id, proposed_fee, first_session_note, message, application_status, contact_revealed_at, created_at, post_requirements_id, tutor_id) VALUES (1, 22, 'Next Saturday 10am', '5 years at this level. Happy to do a trial session.', 'pending', NULL, '2026-06-07 20:17:38.714809', 2, 1);
INSERT INTO public.lead_applications (lead_application_id, proposed_fee, first_session_note, message, application_status, contact_revealed_at, created_at, post_requirements_id, tutor_id) VALUES (2, 18, 'Weekday evenings', 'Can start this week with structured worksheets.', 'rejected', NULL, '2026-06-08 08:17:38.714809', 2, 2);
INSERT INTO public.lead_applications (lead_application_id, proposed_fee, first_session_note, message, application_status, contact_revealed_at, created_at, post_requirements_id, tutor_id) VALUES (3, 28, 'Monday 4pm', 'Native-level practice and IELTS prep.', 'pending', '2026-06-07 20:17:38.714809', '2026-05-31 20:17:38.714809', 3, 1);
INSERT INTO public.lead_applications (lead_application_id, proposed_fee, first_session_note, message, application_status, contact_revealed_at, created_at, post_requirements_id, tutor_id) VALUES (4, 25, 'Flexible', 'Grammar and writing focus.', 'rejected', NULL, '2026-06-01 20:17:38.714809', 3, 2);
INSERT INTO public.lead_applications (lead_application_id, proposed_fee, first_session_note, message, application_status, contact_revealed_at, created_at, post_requirements_id, tutor_id) VALUES (5, 40, 'Sunday morning', 'أوافق على التواصل', 'pending', '2026-06-08 18:17:38.714809', '2026-06-08 18:17:38.714809', 5, 1);
INSERT INTO public.lead_applications (lead_application_id, proposed_fee, first_session_note, message, application_status, contact_revealed_at, created_at, post_requirements_id, tutor_id) VALUES (6, 45, 'Done', 'أوافق على التواصل', 'pending', '2026-06-03 20:17:38.714809', '2026-06-03 20:17:38.714809', 6, 1);
INSERT INTO public.lead_applications (lead_application_id, proposed_fee, first_session_note, message, application_status, contact_revealed_at, created_at, post_requirements_id, tutor_id) VALUES (7, 24, 'Sunday 5pm', 'E2E test offer from tutor1', 'pending', '2026-06-08 17:25:16.459964', '2026-06-08 17:25:01.765913', 1, 1);
INSERT INTO public.lead_applications (lead_application_id, proposed_fee, first_session_note, message, application_status, contact_revealed_at, created_at, post_requirements_id, tutor_id) VALUES (8, 22, 'Monday 6pm', 'E2E offer tutor2', 'pending', '2026-06-08 17:25:16.459964', '2026-06-08 17:25:01.799192', 1, 2);
INSERT INTO public.lead_applications (lead_application_id, proposed_fee, first_session_note, message, application_status, contact_revealed_at, created_at, post_requirements_id, tutor_id) VALUES (9, 35, 'Saturday', 'أوافق على التواصل', 'pending', '2026-06-08 17:25:01.854821', '2026-06-08 17:25:01.854821', 4, 1);
INSERT INTO public.lead_applications (lead_application_id, proposed_fee, first_session_note, message, application_status, contact_revealed_at, created_at, post_requirements_id, tutor_id) VALUES (10, 30, 'Flexible', 'أوافق على التواصل', 'pending', '2026-06-08 17:38:34.616777', '2026-06-08 17:38:34.616777', 8, 3);

INSERT INTO public.lead_targets (lead_target_id, post_requirements_id, tutor_id) VALUES (1, 4, 1);
INSERT INTO public.lead_targets (lead_target_id, post_requirements_id, tutor_id) VALUES (2, 5, 1);
INSERT INTO public.lead_targets (lead_target_id, post_requirements_id, tutor_id) VALUES (3, 6, 1);
INSERT INTO public.lead_targets (lead_target_id, post_requirements_id, tutor_id) VALUES (4, 8, 3);

-- ---------------------------------------------------------------------------
-- Tutor subjects (abbreviated: one row per tutor for Mathematics / Primary)
-- Full local matrix is in alef_data_inserts.sql if needed
-- ---------------------------------------------------------------------------

INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES
(1, false, false, false, true, 5, 30, 1, 1, 1),
(7, false, false, false, true, 5, 30, 2, 1, 1),
(13, false, false, false, true, 5, 30, 3, 1, 1),
(19, false, false, false, true, 5, 30, 1, 2, 1),
(25, false, false, false, true, 5, 30, 2, 2, 1),
(31, false, false, false, true, 5, 30, 3, 2, 1);

-- ---------------------------------------------------------------------------
-- Reset sequences
-- ---------------------------------------------------------------------------

SELECT setval('public.admins_admin_id_seq', 1, true);
SELECT setval('public.students_student_id_seq', 2, true);
SELECT setval('public.tutors_tutor_id_seq', 3, true);
SELECT setval('public.levels_level_id_seq', 7, true);
SELECT setval('public.subjects_subject_id_seq', 7, true);
SELECT setval('public.post_requirements_post_requirements_id_seq', 8, true);
SELECT setval('public.lead_applications_lead_application_id_seq', 10, true);
SELECT setval('public.lead_targets_lead_target_id_seq', 4, true);
SELECT setval('public.tutor_subjects_tutor_subject_id_seq', 108, true);

COMMIT;

-- Verify
SELECT 'students' AS tbl, COUNT(*) FROM students
UNION ALL SELECT 'tutors', COUNT(*) FROM tutors
UNION ALL SELECT 'subjects', COUNT(*) FROM subjects
UNION ALL SELECT 'post_requirements', COUNT(*) FROM post_requirements;
