package repository

import (
	"context"
	"time"

	"github.com/sysu-ecnc-dev/shift-manager/backend/internal/domain"
)

func (r *Repository) InsertSchedulePlan(plan *domain.SchedulePlan) error {
	query := `
		INSERT INTO schedule_plans (
			name,
			description,
			submission_start_time,
			submission_end_time,
			active_start_time,
			active_end_time
		) VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, created_at, version
	`

	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(r.cfg.Database.QueryTimeout)*time.Second)
	defer cancel()

	params := []any{plan.Name, plan.Description, plan.SubmissionStartTime, plan.SubmissionEndTime, plan.ActiveStartTime, plan.ActiveEndTime}
	dst := []any{&plan.ID, &plan.CreatedAt, &plan.Version}
	if err := r.dbpool.QueryRowContext(ctx, query, params...).Scan(dst...); err != nil {
		return err
	}

	return nil
}

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

func (r *Repository) GetSchedulePlanByID(id int64) (*domain.SchedulePlan, error) {
	query := `
		SELECT 
			name, 
			description, 
			submission_start_time, 
			submission_end_time, 
			active_start_time, 
			active_end_time, 
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
		&plan.CreatedAt,
		&plan.Version,
	}

	if err := r.dbpool.QueryRowContext(ctx, query, id).Scan(dst...); err != nil {
		return nil, err
	}

	return plan, nil
}
