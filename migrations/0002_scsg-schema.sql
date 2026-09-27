-- Migration number: 0002 	 2026-09-27T04:37:19.957Z
-- ============================================================
-- SGSC D1 schema
-- PostgreSQL/Supabase -> Cloudflare D1
-- ============================================================

CREATE TABLE houses (
    id TEXT PRIMARY KEY NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    no TEXT NOT NULL DEFAULT '',
    name TEXT NOT NULL DEFAULT '',
    name_th TEXT NOT NULL DEFAULT '',
    color_label TEXT NOT NULL DEFAULT '',
    cls TEXT NOT NULL DEFAULT '',
    personality TEXT NOT NULL DEFAULT '',
    intro TEXT NOT NULL DEFAULT '',
    captain TEXT NOT NULL DEFAULT '',
    captain_role TEXT NOT NULL DEFAULT '',
    sort INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE house_scores (
    id TEXT PRIMARY KEY NOT NULL,
    house_slug TEXT NOT NULL,
    month TEXT NOT NULL,
    score REAL NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (house_slug)
        REFERENCES houses(slug)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    UNIQUE (house_slug, month),

    CHECK (
        month IN (
            'JUN',
            'JUL',
            'AUG',
            'SEP',
            'OCT',
            'NOV',
            'DEC'
        )
    )
);

CREATE TABLE honors (
    id TEXT PRIMARY KEY NOT NULL,
    month TEXT NOT NULL UNIQUE,
    house_of_month TEXT NOT NULL DEFAULT '',
    character_house TEXT NOT NULL DEFAULT ''
);

CREATE TABLE members (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL DEFAULT '',
    role TEXT NOT NULL DEFAULT '',
    org TEXT NOT NULL DEFAULT 'SG',
    org_label TEXT NOT NULL DEFAULT '',
    klass TEXT NOT NULL DEFAULT '',
    duties TEXT NOT NULL DEFAULT '',
    photo_url TEXT NOT NULL DEFAULT '',
    sort INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CHECK (
        org IN (
            'SG',
            'HOUSE',
            'CLUB',
            'CLASS'
        )
    )
);

CREATE TABLE congress_board (
    id TEXT PRIMARY KEY NOT NULL,
    role TEXT NOT NULL DEFAULT '',
    from_org TEXT NOT NULL DEFAULT '',
    person_name TEXT NOT NULL DEFAULT '',
    klass TEXT NOT NULL DEFAULT '',
    photo_url TEXT NOT NULL DEFAULT '',
    sort INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE advisory_board (
    id TEXT PRIMARY KEY NOT NULL,
    person_name TEXT NOT NULL DEFAULT '',
    role TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    photo_url TEXT NOT NULL DEFAULT '',
    sort INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE clubs (
    id TEXT PRIMARY KEY NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL DEFAULT '',
    name_th TEXT NOT NULL DEFAULT '',
    tagline TEXT NOT NULL DEFAULT '',
    about TEXT NOT NULL DEFAULT '',
    cls TEXT NOT NULL DEFAULT '',
    head TEXT NOT NULL DEFAULT '',
    member_count INTEGER NOT NULL DEFAULT 0,

    -- JSON encoded string array
    activities TEXT NOT NULL DEFAULT '[]',

    sort INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CHECK (json_valid(activities))
);

CREATE TABLE news (
    id TEXT PRIMARY KEY NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL DEFAULT '',
    cat TEXT NOT NULL DEFAULT 'SGSC',
    date_label TEXT NOT NULL DEFAULT '',
    intro TEXT NOT NULL DEFAULT '',

    -- JSON encoded string array
    body TEXT NOT NULL DEFAULT '[]',

    related TEXT NOT NULL DEFAULT '',
    house_slug TEXT NOT NULL DEFAULT '',
    cover_url TEXT NOT NULL DEFAULT '',

    published INTEGER NOT NULL DEFAULT 1,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CHECK (json_valid(body)),
    CHECK (published IN (0, 1))
);

CREATE TABLE radio_slots (
    id TEXT PRIMARY KEY NOT NULL,

    legacy_day TEXT,
    legacy_slot TEXT,

    date TEXT,
    start_time TEXT,

    state TEXT NOT NULL DEFAULT 'AVAILABLE',
    note TEXT NOT NULL DEFAULT '',

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CHECK (
        state IN (
            'AVAILABLE',
            'PENDING',
            'BOOKED',
            'CLOSED'
        )
    ),

    CHECK (
        (date IS NULL AND start_time IS NULL)
        OR
        (date IS NOT NULL AND start_time IS NOT NULL)
    )
);

CREATE UNIQUE INDEX radio_slots_date_start_time_key
ON radio_slots(date, start_time)
WHERE date IS NOT NULL
  AND start_time IS NOT NULL;

CREATE INDEX radio_slots_schedule_idx
ON radio_slots(date, start_time, state)
WHERE date IS NOT NULL
  AND start_time IS NOT NULL;

CREATE TABLE radio_bookings (
    id TEXT PRIMARY KEY NOT NULL,

    legacy_day TEXT,
    legacy_slot TEXT,

    slot_id TEXT,

    requester TEXT NOT NULL DEFAULT '',
    student_id TEXT NOT NULL DEFAULT '',
    klass TEXT NOT NULL DEFAULT '',
    song TEXT NOT NULL DEFAULT '',
    message TEXT NOT NULL DEFAULT '',
    additional_info TEXT NOT NULL DEFAULT '',

    status TEXT NOT NULL DEFAULT 'PENDING',

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (slot_id)
        REFERENCES radio_slots(id)
        ON DELETE RESTRICT,

    CHECK (
        status IN (
            'PENDING',
            'APPROVED',
            'REJECTED',
            'COMPLETED',
            'CANCELLED'
        )
    )
);

CREATE UNIQUE INDEX radio_bookings_one_active_slot_idx
ON radio_bookings(slot_id)
WHERE slot_id IS NOT NULL
  AND status IN ('PENDING', 'APPROVED');

CREATE INDEX radio_bookings_slot_created_idx
ON radio_bookings(slot_id, created_at DESC);

CREATE TABLE radio_rules (
    id TEXT PRIMARY KEY NOT NULL,
    text TEXT NOT NULL DEFAULT '',
    sort INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE complaints (
    id TEXT PRIMARY KEY NOT NULL,

    subject TEXT NOT NULL DEFAULT '',
    cat TEXT NOT NULL DEFAULT 'OTHER',
    detail TEXT NOT NULL DEFAULT '',

    reporter TEXT NOT NULL DEFAULT '',
    klass TEXT NOT NULL DEFAULT '',
    contact TEXT NOT NULL DEFAULT '',

    anonymous INTEGER NOT NULL DEFAULT 0,

    status TEXT NOT NULL DEFAULT 'NEW',
    admin_note TEXT NOT NULL DEFAULT '',

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CHECK (anonymous IN (0, 1))
);

CREATE TABLE site_settings (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL DEFAULT ''
);

CREATE TABLE audit_log (
    id TEXT PRIMARY KEY NOT NULL,
    action TEXT NOT NULL DEFAULT '',
    actor TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Cloudflare Access application users.
-- Replaces Supabase auth.user_roles later.
CREATE TABLE admin_users (
    email TEXT PRIMARY KEY NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    enabled INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CHECK (enabled IN (0, 1))
);

-- ============================================================
-- Useful indexes
-- ============================================================

CREATE INDEX houses_sort_idx
ON houses(sort);

CREATE INDEX members_sort_idx
ON members(sort);

CREATE INDEX members_org_idx
ON members(org, sort);

CREATE INDEX congress_board_sort_idx
ON congress_board(sort);

CREATE INDEX advisory_board_sort_idx
ON advisory_board(sort);

CREATE INDEX clubs_sort_idx
ON clubs(sort);

CREATE INDEX news_public_idx
ON news(published, created_at DESC);

CREATE INDEX complaints_status_created_idx
ON complaints(status, created_at DESC);

CREATE INDEX audit_log_created_idx
ON audit_log(created_at DESC);