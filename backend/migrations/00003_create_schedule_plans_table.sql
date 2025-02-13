-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS schedule_plans(
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    submission_start_time TIMESTAMPTZ NOT NULL,
    submission_end_time TIMESTAMPTZ NOT NULL,
    active_start_time TIMESTAMPTZ NOT NULL,
    active_end_time TIMESTAMPTZ NOT NULL,
    schedule_template_id BIGINT NOT NULL REFERENCES schedule_templates(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    version INT NOT NULL DEFAULT 1
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS schedule_plans;
-- +goose StatementEnd
