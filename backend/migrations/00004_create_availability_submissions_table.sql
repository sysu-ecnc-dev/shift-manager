-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS availability_submissions (
    id BIGSERIAL PRIMARY KEY,
    schedule_plan_id BIGINT NOT NULL REFERENCES schedule_plans(id),
    user_id BIGINT NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS availability_submission_items (
    id BIGSERIAL PRIMARY KEY,
    submission_id BIGINT NOT NULL REFERENCES availability_submissions(id) ON DELETE CASCADE,
    shift_id BIGINT NOT NULL REFERENCES schedule_template_shifts(id)
);

CREATE TABLE IF NOT EXISTS availability_submission_item_days (
    id BIGSERIAL PRIMARY KEY,
    item_id BIGINT NOT NULL REFERENCES availability_submission_items(id) ON DELETE CASCADE,
    day INT NOT NULL
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS availability_submission_item_days;
DROP TABLE IF EXISTS availability_submission_items;
DROP TABLE IF EXISTS availability_submissions;
-- +goose StatementEnd
