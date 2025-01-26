-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS schedule_template_meta(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    version INT NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS schedule_template_shifts(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID NOT NULL REFERENCES schedule_template_meta(id) ON DELETE CASCADE,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    required_assistant_number INT NOT NULL,
    applicable_days INT[] NOT NULL
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS schedule_template_shifts;

DROP TABLE IF EXISTS schedule_template_meta;
-- +goose StatementEnd
