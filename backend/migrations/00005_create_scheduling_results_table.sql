-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS scheduling_results (
    id BIGSERIAL PRIMARY KEY,
    schedule_plan_id INT NOT NULL REFERENCES schedule_plans(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS scheduling_results_items (
    id BIGSERIAL PRIMARY KEY,
    scheduling_result_id BIGINT NOT NULL REFERENCES scheduling_results(id) ON DELETE CASCADE,
    schedule_template_shift_id BIGINT NOT NULL REFERENCES schedule_template_shifts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS scheduling_results_item_assistants (
    id BIGSERIAL PRIMARY KEY,
    scheduling_results_item_id BIGINT NOT NULL REFERENCES scheduling_results_items(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS scheduling_results_item_assistants;

DROP TABLE IF EXISTS scheduling_results_items;

DROP TABLE IF EXISTS scheduling_results;
-- +goose StatementEnd
