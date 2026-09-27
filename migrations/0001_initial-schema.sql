-- Migration number: 0001 	 2026-09-27T04:12:23.403Z
CREATE TABLE app_meta (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO app_meta (
    key,
    value
)
VALUES (
    'schema_version',
    '1'
);