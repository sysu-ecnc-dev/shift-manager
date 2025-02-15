package repository

import (
	"context"
	"time"

	"github.com/sysu-ecnc-dev/shift-manager/backend/internal/domain"
)

func (r *Repository) GetAllSchedulePlans() ([]*domain.SchedulePlan, error) {
	query := `
		SELECT 
			id, 
			name, 
			description, 
			submission_start_time, 
			submission_end_time, 
			active_start_time, 
			active_end_time,
			schedule_template_id,
			created_at, 
			version
		FROM schedule_plans
	`

	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(r.cfg.Database.QueryTimeout)*time.Second)
	defer cancel()

	rows, err := r.dbpool.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	plans := []*domain.SchedulePlan{}
	for rows.Next() {
		var plan domain.SchedulePlan
		dst := []any{
			&plan.ID,
			&plan.Name,
			&plan.Description,
			&plan.SubmissionStartTime,
			&plan.SubmissionEndTime,
			&plan.ActiveStartTime,
			&plan.ActiveEndTime,
			&plan.ScheduleTemplateID,
			&plan.CreatedAt,
			&plan.Version,
		}
		if err := rows.Scan(dst...); err != nil {
			return nil, err
		}
		plans = append(plans, &plan)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return plans, nil
}

func (r *Repository) UpdateSchedulePlan(plan *domain.SchedulePlan) error {
	// 最好不要让用户更新所使用的模板，不然后续会带来很多麻烦
	query := `
		UPDATE schedule_plans 
		SET
			name = $1,
			description = $2,
			submission_start_time = $3,
			submission_end_time = $4,
			active_start_time = $5,
			active_end_time = $6,
			version = version + 1
		WHERE id = $7 AND version = $8
		RETURNING version
	`

	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(r.cfg.Database.QueryTimeout)*time.Second)
	defer cancel()

	params := []any{
		plan.Name,
		plan.Description,
		plan.SubmissionStartTime,
		plan.SubmissionEndTime,
		plan.ActiveStartTime,
		plan.ActiveEndTime,
		plan.ID,
		plan.Version,
	}

	if err := r.dbpool.QueryRowContext(ctx, query, params...).Scan(&plan.Version); err != nil {
		return err
	}

	return nil
}

func (r *Repository) CreateSchedulePlan(plan *domain.SchedulePlan) error {
	query := `
		INSERT INTO schedule_plans (
			name,
			description,
			submission_start_time,
			submission_end_time,
			active_start_time,
			active_end_time,
			schedule_template_id
		) VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, created_at, version
	`

	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(r.cfg.Database.QueryTimeout)*time.Second)
	defer cancel()

	params := []any{
		plan.Name,
		plan.Description,
		plan.SubmissionStartTime,
		plan.SubmissionEndTime,
		plan.ActiveStartTime,
		plan.ActiveEndTime,
		plan.ScheduleTemplateID,
	}
	dst := []any{&plan.ID, &plan.CreatedAt, &plan.Version}
	if err := r.dbpool.QueryRowContext(ctx, query, params...).Scan(dst...); err != nil {
		return err
	}

	return nil
}

func (r *Repository) GetSchedulePlanByID(id int64) (*domain.SchedulePlan, error) {
	query := `
		SELECT 
			name, 
			description, 
			submission_start_time, 
			submission_end_time, 
			active_start_time, 
			active_end_time, 
			schedule_template_id,
			created_at, 
			version
		FROM schedule_plans
		WHERE id = $1
	`

	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(r.cfg.Database.QueryTimeout)*time.Second)
	defer cancel()

	plan := &domain.SchedulePlan{
		ID: id,
	}

	dst := []any{
		&plan.Name,
		&plan.Description,
		&plan.SubmissionStartTime,
		&plan.SubmissionEndTime,
		&plan.ActiveStartTime,
		&plan.ActiveEndTime,
		&plan.ScheduleTemplateID,
		&plan.CreatedAt,
		&plan.Version,
	}

	if err := r.dbpool.QueryRowContext(ctx, query, id).Scan(dst...); err != nil {
		return nil, err
	}

	return plan, nil
}

func (r *Repository) DeleteSchedulePlan(id int64) error {
	query := `
		DELETE FROM schedule_plans WHERE id = $1
	`

	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(r.cfg.Database.QueryTimeout)*time.Second)
	defer cancel()

	if _, err := r.dbpool.ExecContext(ctx, query, id); err != nil {
		return err
	}

	return nil
}

func (r *Repository) GetLatestAvailableSchedulePlanID() (int64, error) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(r.cfg.Database.QueryTimeout)*time.Second)
	defer cancel()

	query := `
		SELECT id FROM schedule_plans WHERE submission_end_time > NOW()
		ORDER BY created_at DESC
		LIMIT 1
	`

	var id int64
	if err := r.dbpool.QueryRowContext(ctx, query).Scan(&id); err != nil {
		return 0, err
	}

	return id, nil
}
