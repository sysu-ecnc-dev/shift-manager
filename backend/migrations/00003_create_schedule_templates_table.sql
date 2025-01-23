-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS schedule_templates_meta(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    version INT NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS schedule_template_shifts(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID NOT NULL REFERENCES schedule_templates_meta(id) ON DELETE CASCADE,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL
);

CREATE TABLE IF NOT EXISTS schedule_template_shift_applicable_days(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shift_id UUID NOT NULL REFERENCES schedule_template_shifts(id) ON DELETE CASCADE,
    day_of_week INT NOT NULL
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS schedule_template_shift_applicable_days;

DROP TABLE IF EXISTS schedule_template_shifts;

DROP TABLE IF EXISTS schedule_templates_meta;
-- +goose StatementEnd
