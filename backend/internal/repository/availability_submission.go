package repository

import (
	"context"
	"log/slog"
	"time"

	"github.com/sysu-ecnc-dev/shift-manager/backend/internal/domain"
)

func (r *Repository) InsertAvailabilitySubmission(submission *domain.AvailabilitySubmission) error {
	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(r.cfg.Database.TransactionTimeout)*time.Second)
	defer cancel()

	tx, err := r.dbpool.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer func() {
		_ = tx.Rollback()
	}()

	query := `
		INSERT INTO availability_submissions (schedule_plan_id, user_id)
		VALUES (
			(SELECT id FROM schedule_plans WHERE name = $1),
			(SELECT id FROM users WHERE username = $2)
		)
		RETURNING id, created_at
	`

	if err := tx.QueryRowContext(ctx, query, submission.SchedulePlanName, submission.Username).Scan(&submission.ID, &submission.CreatedAt); err != nil {
		return err
	}

	slog.Info("hello3")

	for _, shift := range submission.Items {
		query := `
			INSERT INTO availability_submission_items (submission_id, shift_id)
			VALUES ($1, $2)
			RETURNING id
		`

		var itemId int64
		if err := tx.QueryRowContext(ctx, query, submission.ID, shift.ShiftID).Scan(&itemId); err != nil {
			return err
		}

		for _, day := range shift.Days {
			query := `
				INSERT INTO availability_submission_item_days (item_id, day)
				VALUES ($1, $2)
			`

			if _, err := tx.ExecContext(ctx, query, itemId, day); err != nil {
				return err
			}
		}
	}

	if err := tx.Commit(); err != nil {
		return err
	}

	return nil
}

func (r *Repository) DeleteAvailabilitySubmission(username string, planName string) error {
	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(r.cfg.Database.QueryTimeout)*time.Second)
	defer cancel()

	query := `
		DELETE FROM availability_submissions
		WHERE user_id = (SELECT id FROM users WHERE username = $1)
		AND schedule_plan_id = (SELECT id FROM schedule_plans WHERE name = $2)
	`

	if _, err := r.dbpool.ExecContext(ctx, query, username, planName); err != nil {
		return err
	}

	return nil
}
