-- =============================================================================
-- Alef leads — full wipe + reseed (PostgreSQL)
-- Password for all accounts: Test1234!
--
-- Run in Neon SQL Editor (or psql) against your Alef database.
-- Safe on empty or partially-seeded DBs: subjects/levels are upserted by title.
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1) Wipe leads + test users (keeps cities/areas/admins)
-- ---------------------------------------------------------------------------
TRUNCATE TABLE
    lead_applications,
    lead_targets,
    post_requirements,
    tutor_subjects,
    favorites,
    reviews,
    addresses,
    students,
    tutors
RESTART IDENTITY CASCADE;

-- ---------------------------------------------------------------------------
-- 2) Reference data (subjects / levels) — idempotent by title
-- ---------------------------------------------------------------------------
INSERT INTO subjects (subject_title, subject_description)
SELECT 'Mathematics', 'Math tutoring for all levels'
WHERE NOT EXISTS (
    SELECT 1 FROM subjects WHERE subject_title = 'Mathematics'
);

INSERT INTO levels (level_title)
SELECT 'Tawjihi'
WHERE NOT EXISTS (
    SELECT 1 FROM levels WHERE level_title = 'Tawjihi'
);

-- ---------------------------------------------------------------------------
-- 3) Test users
-- bcrypt hash for "Test1234!"
-- ---------------------------------------------------------------------------
INSERT INTO students (
    first_name, last_name, date_birth, email, password, phone_number,
    student_photo, registered_at, grade_level
) VALUES
(
    'Sara', 'Student',
    '2010-01-15'::timestamp,
    'student1@example.com',
    '$2b$12$6xwx76sJ5uD0ca95zuQwU.1WmTgpg/MVNW3Lrgxo21uVL0W5vcKGW',
    '0599000001',
    NULL,
    NOW(),
    'high_3'::student_grade_enum
),
(
    'Omar', 'Student',
    '2011-06-20'::timestamp,
    'student2@example.com',
    '$2b$12$6xwx76sJ5uD0ca95zuQwU.1WmTgpg/MVNW3Lrgxo21uVL0W5vcKGW',
    '0599000002',
    NULL,
    NOW(),
    'middle_2'::student_grade_enum
);

INSERT INTO tutors (
    first_name, last_name, email, password, date_birth, phone_number,
    tutor_photo, tutor_video, bio, total_experience_years,
    registered_at, tution_type, verified
) VALUES
(
    'Ahmed', 'Tutor',
    'tutor1@example.com',
    '$2b$12$6xwx76sJ5uD0ca95zuQwU.1WmTgpg/MVNW3Lrgxo21uVL0W5vcKGW',
    '1990-03-10'::timestamp,
    '0599111001',
    NULL, NULL,
    'Math specialist, 8 years experience.',
    8,
    NOW(),
    'both'::tuitiontypeenum,
    true
),
(
    'Layla', 'Tutor',
    'tutor2@example.com',
    '$2b$12$6xwx76sJ5uD0ca95zuQwU.1WmTgpg/MVNW3Lrgxo21uVL0W5vcKGW',
    '1992-07-22'::timestamp,
    '0599111002',
    NULL, NULL,
    'Physics and math tutor.',
    5,
    NOW(),
    'online'::tuitiontypeenum,
    true
),
(
    'Khaled', 'Tutor',
    'tutor3@example.com',
    '$2b$12$6xwx76sJ5uD0ca95zuQwU.1WmTgpg/MVNW3Lrgxo21uVL0W5vcKGW',
    '1988-11-05'::timestamp,
    '0599111003',
    NULL, NULL,
    'English and math.',
    6,
    NOW(),
    'online'::tuitiontypeenum,
    true
);

-- All verified tutors teach Mathematics / Tawjihi (needed for browse + offers)
INSERT INTO tutor_subjects (
    foundation, elementory_stage, middle_stage, high_stage,
    experience_years, price_per_hour, tutor_id, subject_id, level_id
)
SELECT
    false, false, false, true,
    5, 30, t.tutor_id, s.subject_id, l.level_id
FROM tutors t
CROSS JOIN subjects s
CROSS JOIN levels l
WHERE s.subject_title = 'Mathematics'
  AND l.level_title = 'Tawjihi';

-- ---------------------------------------------------------------------------
-- 4) Leads (student/tutor IDs 1–2 / 1–3 after RESTART IDENTITY above)
--    subject_id / level_id resolved by title — not hardcoded
-- ---------------------------------------------------------------------------

-- A) Public OPEN — browse + submit offer
INSERT INTO post_requirements (
    title, description, foundation_tution, tution_type, expected_fee,
    created_at, expired_at, preferred_gender,
    lead_status, is_public, accepting_applications, closed_at, max_applications,
    student_id, subject_id, level_id
) VALUES (
    'Math tutor needed — Tawjihi',
    'Looking for help with calculus and past papers. Prefer evening sessions.',
    false, 'online'::tuitiontypeenum, 25.0,
    NOW() - INTERVAL '2 days',
    NOW() + INTERVAL '28 days',
    NULL,
    'open'::leadstatusenum, true, true, NULL, 5,
    1,
    (SELECT subject_id FROM subjects WHERE subject_title = 'Mathematics' LIMIT 1),
    (SELECT level_id FROM levels WHERE level_title = 'Tawjihi' LIMIT 1)
);

-- B) Public OPEN — 2 pending offers
INSERT INTO post_requirements (
    title, description, foundation_tution, tution_type, expected_fee,
    created_at, expired_at, preferred_gender,
    lead_status, is_public, accepting_applications, closed_at, max_applications,
    student_id, subject_id, level_id
) VALUES (
    'Physics-style math — middle school',
    'Weekly sessions, exam-style practice.',
    false, 'both'::tuitiontypeenum, 20.0,
    NOW() - INTERVAL '5 days',
    NOW() + INTERVAL '25 days',
    'female'::gender_enum,
    'open'::leadstatusenum, true, true, NULL, 5,
    1,
    (SELECT subject_id FROM subjects WHERE subject_title = 'Mathematics' LIMIT 1),
    (SELECT level_id FROM levels WHERE level_title = 'Tawjihi' LIMIT 1)
);

INSERT INTO lead_applications (
    proposed_fee, first_session_note, message, application_status,
    contact_revealed_at, created_at, post_requirements_id, tutor_id
) VALUES
(
    22.0, 'Next Saturday 10am', '5 years at this level. Happy to do a trial session.',
    'pending'::leadapplicationstatusenum, NULL, NOW() - INTERVAL '1 day',
    (SELECT post_requirements_id FROM post_requirements
     WHERE title = 'Physics-style math — middle school' LIMIT 1),
    1
),
(
    18.0, 'Weekday evenings', 'Can start this week with structured worksheets.',
    'pending'::leadapplicationstatusenum, NULL, NOW() - INTERVAL '12 hours',
    (SELECT post_requirements_id FROM post_requirements
     WHERE title = 'Physics-style math — middle school' LIMIT 1),
    2
);

-- C) Public CLOSED_SHORTLIST — phones revealed for pending offers
INSERT INTO post_requirements (
    title, description, foundation_tution, tution_type, expected_fee,
    created_at, expired_at, preferred_gender,
    lead_status, is_public, accepting_applications, closed_at, max_applications,
    student_id, subject_id, level_id
) VALUES (
    'English conversation — closed with offers',
    'Student closed after receiving offers.',
    false, 'online'::tuitiontypeenum, 30.0,
    NOW() - INTERVAL '10 days',
    NOW() + INTERVAL '20 days',
    NULL,
    'closed_shortlist'::leadstatusenum, true, false,
    NOW() - INTERVAL '1 day', 5,
    1,
    (SELECT subject_id FROM subjects WHERE subject_title = 'Mathematics' LIMIT 1),
    (SELECT level_id FROM levels WHERE level_title = 'Tawjihi' LIMIT 1)
);

INSERT INTO lead_applications (
    proposed_fee, first_session_note, message, application_status,
    contact_revealed_at, created_at, post_requirements_id, tutor_id
) VALUES
(
    28.0, 'Monday 4pm', 'Native-level practice and IELTS prep.',
    'pending'::leadapplicationstatusenum, NOW() - INTERVAL '1 day', NOW() - INTERVAL '8 days',
    (SELECT post_requirements_id FROM post_requirements
     WHERE title = 'English conversation — closed with offers' LIMIT 1),
    1
),
(
    25.0, 'Flexible', 'Grammar and writing focus.',
    'rejected'::leadapplicationstatusenum, NULL, NOW() - INTERVAL '7 days',
    (SELECT post_requirements_id FROM post_requirements
     WHERE title = 'English conversation — closed with offers' LIMIT 1),
    2
);

-- D) Private OPEN — tutor inbox (student1)
INSERT INTO post_requirements (
    title, description, foundation_tution, tution_type, expected_fee,
    created_at, expired_at, preferred_gender,
    lead_status, is_public, accepting_applications, closed_at, max_applications,
    student_id, subject_id, level_id
) VALUES (
    'Private request from profile',
    'Interested in regular sessions with this tutor only.',
    false, 'offline'::tuitiontypeenum, 35.0,
    NOW() - INTERVAL '1 day',
    NOW() + INTERVAL '29 days',
    NULL,
    'open'::leadstatusenum, false, false, NULL, 5,
    1,
    (SELECT subject_id FROM subjects WHERE subject_title = 'Mathematics' LIMIT 1),
    (SELECT level_id FROM levels WHERE level_title = 'Tawjihi' LIMIT 1)
);

INSERT INTO lead_targets (post_requirements_id, tutor_id)
VALUES (
    (SELECT post_requirements_id FROM post_requirements
     WHERE title = 'Private request from profile' LIMIT 1),
    1
);

-- E) Private OPEN — tutor accepted contact (student2)
INSERT INTO post_requirements (
    title, description, foundation_tution, tution_type, expected_fee,
    created_at, expired_at, preferred_gender,
    lead_status, is_public, accepting_applications, closed_at, max_applications,
    student_id, subject_id, level_id
) VALUES (
    'Private — tutor accepted',
    'Tutor tapped accept contact; student has not closed yet.',
    false, 'online'::tuitiontypeenum, 40.0,
    NOW() - INTERVAL '3 days',
    NOW() + INTERVAL '27 days',
    NULL,
    'open'::leadstatusenum, false, false, NULL, 5,
    2,
    (SELECT subject_id FROM subjects WHERE subject_title = 'Mathematics' LIMIT 1),
    (SELECT level_id FROM levels WHERE level_title = 'Tawjihi' LIMIT 1)
);

INSERT INTO lead_targets (post_requirements_id, tutor_id)
VALUES (
    (SELECT post_requirements_id FROM post_requirements
     WHERE title = 'Private — tutor accepted' LIMIT 1),
    1
);

INSERT INTO lead_applications (
    proposed_fee, first_session_note, message, application_status,
    contact_revealed_at, created_at, post_requirements_id, tutor_id
) VALUES (
    40.0, 'Sunday morning', 'أوافق على التواصل',
    'pending'::leadapplicationstatusenum,
    NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '2 hours',
    (SELECT post_requirements_id FROM post_requirements
     WHERE title = 'Private — tutor accepted' LIMIT 1),
    1
);

-- F) Private CLOSED_MATCHED (student2)
INSERT INTO post_requirements (
    title, description, foundation_tution, tution_type, expected_fee,
    created_at, expired_at, preferred_gender,
    lead_status, is_public, accepting_applications, closed_at, max_applications,
    student_id, subject_id, level_id
) VALUES (
    'Private — matched and closed',
    'Student closed as matched after tutor accept.',
    false, 'online'::tuitiontypeenum, 45.0,
    NOW() - INTERVAL '14 days',
    NOW() + INTERVAL '16 days',
    NULL,
    'closed_matched'::leadstatusenum, false, false,
    NOW() - INTERVAL '2 days', 5,
    2,
    (SELECT subject_id FROM subjects WHERE subject_title = 'Mathematics' LIMIT 1),
    (SELECT level_id FROM levels WHERE level_title = 'Tawjihi' LIMIT 1)
);

INSERT INTO lead_targets (post_requirements_id, tutor_id)
VALUES (
    (SELECT post_requirements_id FROM post_requirements
     WHERE title = 'Private — matched and closed' LIMIT 1),
    1
);

INSERT INTO lead_applications (
    proposed_fee, first_session_note, message, application_status,
    contact_revealed_at, created_at, post_requirements_id, tutor_id
) VALUES (
    45.0, 'Done', 'أوافق على التواصل',
    'pending'::leadapplicationstatusenum,
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '5 days',
    (SELECT post_requirements_id FROM post_requirements
     WHERE title = 'Private — matched and closed' LIMIT 1),
    1
);

COMMIT;

-- ---------------------------------------------------------------------------
-- 5) Verify
-- ---------------------------------------------------------------------------
SELECT subject_id, subject_title FROM subjects;
SELECT level_id, level_title FROM levels;

SELECT
    pr.post_requirements_id,
    pr.title,
    pr.lead_status,
    pr.is_public,
    pr.subject_id,
    pr.level_id,
    s.email AS student_email,
    lt.tutor_id AS target_tutor_id,
    COUNT(la.lead_application_id) FILTER (WHERE la.application_status = 'pending') AS pending_offers
FROM post_requirements pr
JOIN students s ON s.student_id = pr.student_id
LEFT JOIN lead_targets lt ON lt.post_requirements_id = pr.post_requirements_id
LEFT JOIN lead_applications la ON la.post_requirements_id = pr.post_requirements_id
GROUP BY pr.post_requirements_id, pr.title, pr.lead_status, pr.is_public,
         pr.subject_id, pr.level_id, s.email, lt.tutor_id
ORDER BY pr.post_requirements_id;
