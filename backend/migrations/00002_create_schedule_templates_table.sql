-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS schedule_templates(
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    version INT NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS schedule_template_shifts(
    id BIGSERIAL PRIMARY KEY,
    template_id BIGINT NOT NULL REFERENCES schedule_templates(id) ON DELETE CASCADE,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    required_assistant_number INT NOT NULL
);

CREATE TABLE IF NOT EXISTS schedule_template_shift_applicable_days(
    id BIGSERIAL PRIMARY KEY,
    shift_id BIGINT NOT NULL REFERENCES schedule_template_shifts(id) ON DELETE CASCADE,
    day INT NOT NULL
)
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS schedule_template_shift_applicable_days;

DROP TABLE IF EXISTS schedule_template_shifts;

DROP TABLE IF EXISTS schedule_templates;
-- +goose StatementEnd
