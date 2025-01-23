-- +goose Up
-- +goose StatementBegin
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE
);

INSERT INTO roles (name) VALUES ('普通助理'), ('资深助理'), ('黑心');
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS roles;

DROP EXTENSION IF EXISTS "uuid-ossp";
-- +goose StatementEnd
