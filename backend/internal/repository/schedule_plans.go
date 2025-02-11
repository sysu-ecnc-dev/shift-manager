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
