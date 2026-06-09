--
-- PostgreSQL database dump
--

\restrict XHjHXnz4zjHIO3EKkrWptt7Guq6c5dsUHP9qSrqQkmuYsHUngMVSmdwImQkhI98

-- Dumped from database version 14.19 (Homebrew)
-- Dumped by pg_dump version 14.19 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: cities; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: areas; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: students; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.students (student_id, first_name, last_name, date_birth, email, password, phone_number, student_photo, registered_at, grade_level) VALUES (2, 'Omar', 'Student', '2011-06-20 00:00:00', 'student2@example.com', '$2b$12$6xwx76sJ5uD0ca95zuQwU.1WmTgpg/MVNW3Lrgxo21uVL0W5vcKGW', '0599000002', NULL, '2026-06-08 20:17:38.714809', 'middle_2');
INSERT INTO public.students (student_id, first_name, last_name, date_birth, email, password, phone_number, student_photo, registered_at, grade_level) VALUES (1, 'shahd', 'abbara', '2010-01-15 00:00:00', 'student1@example.com', '$2b$12$6.PDQa6HrtTRbCPvD3ND/ekaDfHpFMaRR//7tw4TjBJCKEN3DADlm', '0987654321', 'string', '2026-06-08 20:17:38.714809', 'high_3');


--
-- Data for Name: tutors; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.tutors (tutor_id, first_name, last_name, email, password, date_birth, phone_number, tutor_photo, tutor_video, bio, total_experience_years, registered_at, tution_type, verified) VALUES (1, 'Ahmed', 'Tutor', 'tutor1@example.com', '$2b$12$6xwx76sJ5uD0ca95zuQwU.1WmTgpg/MVNW3Lrgxo21uVL0W5vcKGW', '1990-03-10 00:00:00', '0599111001', NULL, NULL, 'Math specialist, 8 years experience.', 8, '2026-06-08 20:17:38.714809', 'both', true);
INSERT INTO public.tutors (tutor_id, first_name, last_name, email, password, date_birth, phone_number, tutor_photo, tutor_video, bio, total_experience_years, registered_at, tution_type, verified) VALUES (2, 'Layla', 'Tutor', 'tutor2@example.com', '$2b$12$6xwx76sJ5uD0ca95zuQwU.1WmTgpg/MVNW3Lrgxo21uVL0W5vcKGW', '1992-07-22 00:00:00', '0599111002', NULL, NULL, 'Physics and math tutor.', 5, '2026-06-08 20:17:38.714809', 'online', true);
INSERT INTO public.tutors (tutor_id, first_name, last_name, email, password, date_birth, phone_number, tutor_photo, tutor_video, bio, total_experience_years, registered_at, tution_type, verified) VALUES (3, 'Khaled', 'Tutor', 'tutor3@example.com', '$2b$12$6xwx76sJ5uD0ca95zuQwU.1WmTgpg/MVNW3Lrgxo21uVL0W5vcKGW', '1988-11-05 00:00:00', '0599111003', NULL, NULL, 'English and math.', 6, '2026-06-08 20:17:38.714809', 'online', true);


--
-- Data for Name: addresses; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: admins; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.admins (admin_id, first_name, last_name, email, password) VALUES (1, 'Demo', 'Admin', 'admin@example.com', '$2b$12$0gCExRPhvCFqG4AKix0wyOQ1Xm6pL2GoNZtcWwp.dbRwyizpKRv.u');


--
-- Data for Name: alembic_version; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.alembic_version (version_num) VALUES ('e7b2c4d91f05');


--
-- Data for Name: favorites; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: levels; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.levels (level_id, level_title) VALUES (1, 'Primary');
INSERT INTO public.levels (level_id, level_title) VALUES (2, 'Middle');
INSERT INTO public.levels (level_id, level_title) VALUES (3, 'High');
INSERT INTO public.levels (level_id, level_title) VALUES (5, 'Tawjihi');
INSERT INTO public.levels (level_id, level_title) VALUES (6, 'Tawjihi');
INSERT INTO public.levels (level_id, level_title) VALUES (7, 'Tawjihi');


--
-- Data for Name: subjects; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.subjects (subject_id, subject_title, subject_description) VALUES (1, 'Mathematics', 'Core math subject');
INSERT INTO public.subjects (subject_id, subject_title, subject_description) VALUES (2, 'English', 'Language and writing');
INSERT INTO public.subjects (subject_id, subject_title, subject_description) VALUES (3, 'Physics', 'Science fundamentals');
INSERT INTO public.subjects (subject_id, subject_title, subject_description) VALUES (5, 'Mathematics', 'Math tutoring for all levels');
INSERT INTO public.subjects (subject_id, subject_title, subject_description) VALUES (6, 'Mathematics', 'Math tutoring for all levels');
INSERT INTO public.subjects (subject_id, subject_title, subject_description) VALUES (7, 'Mathematics', 'Math tutoring for all levels');


--
-- Data for Name: post_requirements; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.post_requirements (post_requirements_id, title, description, foundation_tution, tution_type, expected_fee, created_at, expired_at, preferred_gender, student_id, subject_id, level_id, lead_status, is_public, accepting_applications, closed_at, max_applications) VALUES (2, 'Physics-style math — middle school', 'Weekly sessions, exam-style practice.', false, 'both', 20, '2026-06-03 20:17:38.714809', '2026-07-03 20:17:38.714809', 'female', 1, 1, 1, 'open', true, true, NULL, 5);
INSERT INTO public.post_requirements (post_requirements_id, title, description, foundation_tution, tution_type, expected_fee, created_at, expired_at, preferred_gender, student_id, subject_id, level_id, lead_status, is_public, accepting_applications, closed_at, max_applications) VALUES (3, 'English conversation — closed with offers', 'Student closed after receiving offers.', false, 'online', 30, '2026-05-29 20:17:38.714809', '2026-06-28 20:17:38.714809', NULL, 1, 1, 1, 'closed_shortlist', true, false, '2026-06-07 20:17:38.714809', 5);
INSERT INTO public.post_requirements (post_requirements_id, title, description, foundation_tution, tution_type, expected_fee, created_at, expired_at, preferred_gender, student_id, subject_id, level_id, lead_status, is_public, accepting_applications, closed_at, max_applications) VALUES (5, 'Private — tutor accepted', 'Tutor tapped accept contact; student has not closed yet.', false, 'online', 40, '2026-06-05 20:17:38.714809', '2026-07-05 20:17:38.714809', NULL, 2, 1, 1, 'open', false, false, NULL, 5);
INSERT INTO public.post_requirements (post_requirements_id, title, description, foundation_tution, tution_type, expected_fee, created_at, expired_at, preferred_gender, student_id, subject_id, level_id, lead_status, is_public, accepting_applications, closed_at, max_applications) VALUES (6, 'Private — matched and closed', 'Student closed as matched after tutor accept.', false, 'online', 45, '2026-05-25 20:17:38.714809', '2026-06-24 20:17:38.714809', NULL, 2, 1, 1, 'closed_matched', false, false, '2026-06-06 20:17:38.714809', 5);
INSERT INTO public.post_requirements (post_requirements_id, title, description, foundation_tution, tution_type, expected_fee, created_at, expired_at, preferred_gender, student_id, subject_id, level_id, lead_status, is_public, accepting_applications, closed_at, max_applications) VALUES (7, 'E2E new public lead', 'Integration test public lead from student2', false, 'online', 30, '2026-06-08 17:25:01.930072', '2026-07-08 17:25:01.930072', NULL, 2, 1, 1, 'closed_empty', true, false, '2026-06-08 17:25:02.485411', 5);
INSERT INTO public.post_requirements (post_requirements_id, title, description, foundation_tution, tution_type, expected_fee, created_at, expired_at, preferred_gender, student_id, subject_id, level_id, lead_status, is_public, accepting_applications, closed_at, max_applications) VALUES (4, 'Private request from profile', 'Interested in regular sessions with this tutor only.', false, 'offline', 35, '2026-06-07 20:17:38.714809', '2026-07-07 20:17:38.714809', NULL, 1, 1, 1, 'closed_matched', false, false, '2026-06-08 17:25:02.498916', 5);
INSERT INTO public.post_requirements (post_requirements_id, title, description, foundation_tution, tution_type, expected_fee, created_at, expired_at, preferred_gender, student_id, subject_id, level_id, lead_status, is_public, accepting_applications, closed_at, max_applications) VALUES (1, 'Math tutor needed — Tawjihi', 'Looking for help with calculus and past papers. Prefer evening sessions.', false, 'online', 25, '2026-06-06 20:17:38.714809', '2026-07-06 20:17:38.714809', NULL, 1, 1, 1, 'closed_shortlist', true, false, '2026-06-08 17:25:16.459964', 5);
INSERT INTO public.post_requirements (post_requirements_id, title, description, foundation_tution, tution_type, expected_fee, created_at, expired_at, preferred_gender, student_id, subject_id, level_id, lead_status, is_public, accepting_applications, closed_at, max_applications) VALUES (8, 'Accept closes test', 'test', false, 'online', 30, '2026-06-08 17:38:34.582489', '2026-07-08 17:38:34.582489', NULL, 1, 2, 1, 'closed_matched', false, false, '2026-06-08 17:38:34.616777', 5);


--
-- Data for Name: lead_applications; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.lead_applications (lead_application_id, proposed_fee, first_session_note, message, application_status, contact_revealed_at, created_at, post_requirements_id, tutor_id) VALUES (1, 22, 'Next Saturday 10am', '5 years at this level. Happy to do a trial session.', 'pending', NULL, '2026-06-07 20:17:38.714809', 2, 1);
INSERT INTO public.lead_applications (lead_application_id, proposed_fee, first_session_note, message, application_status, contact_revealed_at, created_at, post_requirements_id, tutor_id) VALUES (3, 28, 'Monday 4pm', 'Native-level practice and IELTS prep.', 'pending', '2026-06-07 20:17:38.714809', '2026-05-31 20:17:38.714809', 3, 1);
INSERT INTO public.lead_applications (lead_application_id, proposed_fee, first_session_note, message, application_status, contact_revealed_at, created_at, post_requirements_id, tutor_id) VALUES (4, 25, 'Flexible', 'Grammar and writing focus.', 'rejected', NULL, '2026-06-01 20:17:38.714809', 3, 2);
INSERT INTO public.lead_applications (lead_application_id, proposed_fee, first_session_note, message, application_status, contact_revealed_at, created_at, post_requirements_id, tutor_id) VALUES (5, 40, 'Sunday morning', 'أوافق على التواصل', 'pending', '2026-06-08 18:17:38.714809', '2026-06-08 18:17:38.714809', 5, 1);
INSERT INTO public.lead_applications (lead_application_id, proposed_fee, first_session_note, message, application_status, contact_revealed_at, created_at, post_requirements_id, tutor_id) VALUES (6, 45, 'Done', 'أوافق على التواصل', 'pending', '2026-06-03 20:17:38.714809', '2026-06-03 20:17:38.714809', 6, 1);
INSERT INTO public.lead_applications (lead_application_id, proposed_fee, first_session_note, message, application_status, contact_revealed_at, created_at, post_requirements_id, tutor_id) VALUES (2, 18, 'Weekday evenings', 'Can start this week with structured worksheets.', 'rejected', NULL, '2026-06-08 08:17:38.714809', 2, 2);
INSERT INTO public.lead_applications (lead_application_id, proposed_fee, first_session_note, message, application_status, contact_revealed_at, created_at, post_requirements_id, tutor_id) VALUES (9, 35, 'Saturday', 'أوافق على التواصل', 'pending', '2026-06-08 17:25:01.854821', '2026-06-08 17:25:01.854821', 4, 1);
INSERT INTO public.lead_applications (lead_application_id, proposed_fee, first_session_note, message, application_status, contact_revealed_at, created_at, post_requirements_id, tutor_id) VALUES (7, 24, 'Sunday 5pm', 'E2E test offer from tutor1', 'pending', '2026-06-08 17:25:16.459964', '2026-06-08 17:25:01.765913', 1, 1);
INSERT INTO public.lead_applications (lead_application_id, proposed_fee, first_session_note, message, application_status, contact_revealed_at, created_at, post_requirements_id, tutor_id) VALUES (8, 22, 'Monday 6pm', 'E2E offer tutor2', 'pending', '2026-06-08 17:25:16.459964', '2026-06-08 17:25:01.799192', 1, 2);
INSERT INTO public.lead_applications (lead_application_id, proposed_fee, first_session_note, message, application_status, contact_revealed_at, created_at, post_requirements_id, tutor_id) VALUES (10, 30, 'Flexible', 'أوافق على التواصل', 'pending', '2026-06-08 17:38:34.616777', '2026-06-08 17:38:34.616777', 8, 3);


--
-- Data for Name: lead_targets; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.lead_targets (lead_target_id, post_requirements_id, tutor_id) VALUES (1, 4, 1);
INSERT INTO public.lead_targets (lead_target_id, post_requirements_id, tutor_id) VALUES (2, 5, 1);
INSERT INTO public.lead_targets (lead_target_id, post_requirements_id, tutor_id) VALUES (3, 6, 1);
INSERT INTO public.lead_targets (lead_target_id, post_requirements_id, tutor_id) VALUES (4, 8, 3);


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: tutor_subjects; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (1, false, false, false, true, 5, 30, 1, 1, 1);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (2, false, false, false, true, 5, 30, 1, 1, 2);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (3, false, false, false, true, 5, 30, 1, 1, 3);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (4, false, false, false, true, 5, 30, 1, 1, 5);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (5, false, false, false, true, 5, 30, 1, 1, 6);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (6, false, false, false, true, 5, 30, 1, 1, 7);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (7, false, false, false, true, 5, 30, 2, 1, 1);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (8, false, false, false, true, 5, 30, 2, 1, 2);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (9, false, false, false, true, 5, 30, 2, 1, 3);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (10, false, false, false, true, 5, 30, 2, 1, 5);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (11, false, false, false, true, 5, 30, 2, 1, 6);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (12, false, false, false, true, 5, 30, 2, 1, 7);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (13, false, false, false, true, 5, 30, 3, 1, 1);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (14, false, false, false, true, 5, 30, 3, 1, 2);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (15, false, false, false, true, 5, 30, 3, 1, 3);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (16, false, false, false, true, 5, 30, 3, 1, 5);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (17, false, false, false, true, 5, 30, 3, 1, 6);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (18, false, false, false, true, 5, 30, 3, 1, 7);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (19, false, false, false, true, 5, 30, 1, 2, 1);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (20, false, false, false, true, 5, 30, 1, 2, 2);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (21, false, false, false, true, 5, 30, 1, 2, 3);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (22, false, false, false, true, 5, 30, 1, 2, 5);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (23, false, false, false, true, 5, 30, 1, 2, 6);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (24, false, false, false, true, 5, 30, 1, 2, 7);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (25, false, false, false, true, 5, 30, 2, 2, 1);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (26, false, false, false, true, 5, 30, 2, 2, 2);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (27, false, false, false, true, 5, 30, 2, 2, 3);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (28, false, false, false, true, 5, 30, 2, 2, 5);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (29, false, false, false, true, 5, 30, 2, 2, 6);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (30, false, false, false, true, 5, 30, 2, 2, 7);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (31, false, false, false, true, 5, 30, 3, 2, 1);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (32, false, false, false, true, 5, 30, 3, 2, 2);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (33, false, false, false, true, 5, 30, 3, 2, 3);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (34, false, false, false, true, 5, 30, 3, 2, 5);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (35, false, false, false, true, 5, 30, 3, 2, 6);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (36, false, false, false, true, 5, 30, 3, 2, 7);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (37, false, false, false, true, 5, 30, 1, 3, 1);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (38, false, false, false, true, 5, 30, 1, 3, 2);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (39, false, false, false, true, 5, 30, 1, 3, 3);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (40, false, false, false, true, 5, 30, 1, 3, 5);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (41, false, false, false, true, 5, 30, 1, 3, 6);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (42, false, false, false, true, 5, 30, 1, 3, 7);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (43, false, false, false, true, 5, 30, 2, 3, 1);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (44, false, false, false, true, 5, 30, 2, 3, 2);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (45, false, false, false, true, 5, 30, 2, 3, 3);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (46, false, false, false, true, 5, 30, 2, 3, 5);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (47, false, false, false, true, 5, 30, 2, 3, 6);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (48, false, false, false, true, 5, 30, 2, 3, 7);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (49, false, false, false, true, 5, 30, 3, 3, 1);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (50, false, false, false, true, 5, 30, 3, 3, 2);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (51, false, false, false, true, 5, 30, 3, 3, 3);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (52, false, false, false, true, 5, 30, 3, 3, 5);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (53, false, false, false, true, 5, 30, 3, 3, 6);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (54, false, false, false, true, 5, 30, 3, 3, 7);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (55, false, false, false, true, 5, 30, 1, 5, 1);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (56, false, false, false, true, 5, 30, 1, 5, 2);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (57, false, false, false, true, 5, 30, 1, 5, 3);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (58, false, false, false, true, 5, 30, 1, 5, 5);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (59, false, false, false, true, 5, 30, 1, 5, 6);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (60, false, false, false, true, 5, 30, 1, 5, 7);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (61, false, false, false, true, 5, 30, 2, 5, 1);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (62, false, false, false, true, 5, 30, 2, 5, 2);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (63, false, false, false, true, 5, 30, 2, 5, 3);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (64, false, false, false, true, 5, 30, 2, 5, 5);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (65, false, false, false, true, 5, 30, 2, 5, 6);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (66, false, false, false, true, 5, 30, 2, 5, 7);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (67, false, false, false, true, 5, 30, 3, 5, 1);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (68, false, false, false, true, 5, 30, 3, 5, 2);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (69, false, false, false, true, 5, 30, 3, 5, 3);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (70, false, false, false, true, 5, 30, 3, 5, 5);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (71, false, false, false, true, 5, 30, 3, 5, 6);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (72, false, false, false, true, 5, 30, 3, 5, 7);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (73, false, false, false, true, 5, 30, 1, 6, 1);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (74, false, false, false, true, 5, 30, 1, 6, 2);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (75, false, false, false, true, 5, 30, 1, 6, 3);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (76, false, false, false, true, 5, 30, 1, 6, 5);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (77, false, false, false, true, 5, 30, 1, 6, 6);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (78, false, false, false, true, 5, 30, 1, 6, 7);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (79, false, false, false, true, 5, 30, 2, 6, 1);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (80, false, false, false, true, 5, 30, 2, 6, 2);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (81, false, false, false, true, 5, 30, 2, 6, 3);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (82, false, false, false, true, 5, 30, 2, 6, 5);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (83, false, false, false, true, 5, 30, 2, 6, 6);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (84, false, false, false, true, 5, 30, 2, 6, 7);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (85, false, false, false, true, 5, 30, 3, 6, 1);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (86, false, false, false, true, 5, 30, 3, 6, 2);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (87, false, false, false, true, 5, 30, 3, 6, 3);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (88, false, false, false, true, 5, 30, 3, 6, 5);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (89, false, false, false, true, 5, 30, 3, 6, 6);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (90, false, false, false, true, 5, 30, 3, 6, 7);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (91, false, false, false, true, 5, 30, 1, 7, 1);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (92, false, false, false, true, 5, 30, 1, 7, 2);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (93, false, false, false, true, 5, 30, 1, 7, 3);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (94, false, false, false, true, 5, 30, 1, 7, 5);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (95, false, false, false, true, 5, 30, 1, 7, 6);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (96, false, false, false, true, 5, 30, 1, 7, 7);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (97, false, false, false, true, 5, 30, 2, 7, 1);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (98, false, false, false, true, 5, 30, 2, 7, 2);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (99, false, false, false, true, 5, 30, 2, 7, 3);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (100, false, false, false, true, 5, 30, 2, 7, 5);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (101, false, false, false, true, 5, 30, 2, 7, 6);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (102, false, false, false, true, 5, 30, 2, 7, 7);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (103, false, false, false, true, 5, 30, 3, 7, 1);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (104, false, false, false, true, 5, 30, 3, 7, 2);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (105, false, false, false, true, 5, 30, 3, 7, 3);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (106, false, false, false, true, 5, 30, 3, 7, 5);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (107, false, false, false, true, 5, 30, 3, 7, 6);
INSERT INTO public.tutor_subjects (tutor_subject_id, foundation, elementory_stage, middle_stage, high_stage, experience_years, price_per_hour, tutor_id, subject_id, level_id) VALUES (108, false, false, false, true, 5, 30, 3, 7, 7);


--
-- Name: addresses_address_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.addresses_address_id_seq', 1, false);


--
-- Name: admins_admin_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.admins_admin_id_seq', 1, true);


--
-- Name: areas_area_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.areas_area_id_seq', 1, false);


--
-- Name: auth_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.auth_sessions_id_seq', 1, false);


--
-- Name: cities_city_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.cities_city_id_seq', 1, false);


--
-- Name: favorites_favorite_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.favorites_favorite_id_seq', 1, false);


--
-- Name: lead_applications_lead_application_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.lead_applications_lead_application_id_seq', 10, true);


--
-- Name: lead_targets_lead_target_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.lead_targets_lead_target_id_seq', 4, true);


--
-- Name: levels_level_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.levels_level_id_seq', 7, true);


--
-- Name: post_requirements_post_requirements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.post_requirements_post_requirements_id_seq', 8, true);


--
-- Name: reviews_review_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.reviews_review_id_seq', 1, false);


--
-- Name: students_student_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.students_student_id_seq', 2, true);


--
-- Name: subjects_subject_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.subjects_subject_id_seq', 7, true);


--
-- Name: tutor_subjects_tutor_subject_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tutor_subjects_tutor_subject_id_seq', 108, true);


--
-- Name: tutors_tutor_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tutors_tutor_id_seq', 3, true);


--
-- PostgreSQL database dump complete
--

\unrestrict XHjHXnz4zjHIO3EKkrWptt7Guq6c5dsUHP9qSrqQkmuYsHUngMVSmdwImQkhI98

