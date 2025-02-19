-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS availability_submissions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    schedule_plan_id BIGINT NOT NULL REFERENCES schedule_plans(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    version INT NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS availability_submission_items (
    id BIGSERIAL PRIMARY KEY,
    availability_submission_id BIGINT NOT NULL REFERENCES availability_submissions(id) ON DELETE CASCADE,
    schedule_template_shift_id BIGINT NOT NULL REFERENCES schedule_template_shifts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS availability_submission_item_available_days (
    id BIGSERIAL PRIMARY KEY,
    availability_submission_item_id BIGINT NOT NULL REFERENCES availability_submission_items(id) ON DELETE CASCADE,
    day_of_week INT NOT NULL
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS availability_submission_item_available_days;

DROP TABLE IF EXISTS availability_submission_items;

DROP TABLE IF EXISTS availability_submissions;
-- +goose StatementEnd
