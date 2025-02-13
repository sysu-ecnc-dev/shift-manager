package repository

import (
	"context"
	"database/sql"
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

func (r *Repository) GetSubmissionByUsernameAndPlanName(username string, planName string) (*domain.AvailabilitySubmission, error) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(r.cfg.Database.QueryTimeout)*time.Second)
	defer cancel()

	res := &domain.AvailabilitySubmission{
		Username:         username,
		SchedulePlanName: planName,
		Items:            make([]domain.AvailabilitySubmissionItem, 0),
	}

	query := `
		SELECT id, created_at FROM availability_submissions
		WHERE 
			user_id = (SELECT id FROM users WHERE username = $1)
			AND schedule_plan_id = (SELECT id FROM schedule_plans WHERE name = $2)
	`

	if err := r.dbpool.QueryRowContext(ctx, query, username, planName).Scan(&res.ID, &res.CreatedAt); err != nil {
		return nil, err
	}

	query = `
		SELECT shift_id, day
		FROM availability_submission_items AS asi
		LEFT JOIN 
			availability_submission_item_days AS asid
			ON asid.item_id = asi.id
		WHERE 
			asi.submission_id = $1
	`

	rows, err := r.dbpool.QueryContext(ctx, query, res.ID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var mapShiftIdToDays = make(map[int][]int)

	for rows.Next() {
		var shiftId int
		var day sql.NullInt32

		if err := rows.Scan(&shiftId, &day); err != nil {
			return nil, err
		}

		if mapShiftIdToDays[shiftId] == nil {
			mapShiftIdToDays[shiftId] = make([]int, 0)
		}

		if day.Valid {
			mapShiftIdToDays[shiftId] = append(mapShiftIdToDays[shiftId], int(day.Int32))
		}
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	for shiftId, days := range mapShiftIdToDays {
		res.Items = append(res.Items, domain.AvailabilitySubmissionItem{
			ShiftID: shiftId,
			Days:    days,
		})
	}

	return res, nil
}
