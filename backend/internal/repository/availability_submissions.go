package repository

import (
	"context"
	"database/sql"
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

	// 先把原先的记录删除再插入
	query := `DELETE FROM availability_submissions WHERE user_id = $1 AND schedule_plan_id = $2`
	if _, err := tx.ExecContext(ctx, query, submission.UserID, submission.SchedulePlanID); err != nil {
		return err
	}

	query = `
		INSERT INTO availability_submissions (user_id, schedule_plan_id)
		VALUES ($1, $2)
		RETURNING id, created_at, version
	`
	if err := tx.QueryRowContext(ctx, query, submission.UserID, submission.SchedulePlanID).Scan(&submission.ID, &submission.CreatedAt, &submission.Version); err != nil {
		return err
	}

	for _, item := range submission.Items {
		query := `
			INSERT INTO availability_submission_items (availability_submission_id, schedule_template_shift_id)
			VALUES ($1, $2)
			RETURNING id
		`
		var itemID int64
		if err := tx.QueryRowContext(ctx, query, submission.ID, item.ShiftID).Scan(&itemID); err != nil {
			return err
		}

		for _, day := range item.Days {
			query := `
				INSERT INTO availability_submission_item_available_days (availability_submission_item_id, day_of_week)
				VALUES ($1, $2)
			`
			if _, err := tx.ExecContext(ctx, query, itemID, day); err != nil {
				return err
			}
		}
	}

	if err := tx.Commit(); err != nil {
		return err
	}

	return nil
}

func (r *Repository) GetAvailabilitySubmissionByUserIDAndSchedulePlanID(userID int64, schedulePlanID int64) (*domain.AvailabilitySubmission, error) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(r.cfg.Database.QueryTimeout)*time.Second)
	defer cancel()

	query := `
		SELECT id, created_at, version
		FROM availability_submissions
		WHERE user_id = $1 AND schedule_plan_id = $2
	`

	submission := &domain.AvailabilitySubmission{
		UserID:         userID,
		SchedulePlanID: schedulePlanID,
	}

	if err := r.dbpool.QueryRowContext(ctx, query, userID, schedulePlanID).Scan(&submission.ID, &submission.CreatedAt, &submission.Version); err != nil {
		return nil, err
	}

	itemsMap := make(map[int64]*domain.AvailabilitySubmissionItem)

	query = `
		SELECT
			asi.id,
			asi.schedule_template_shift_id,
			asiad.day_of_week
		FROM availability_submission_items asi
		LEFT JOIN availability_submission_item_available_days asiad 
			ON asi.id = asiad.availability_submission_item_id
		WHERE asi.availability_submission_id = $1
	`

	rows, err := r.dbpool.QueryContext(ctx, query, submission.ID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var row struct {
			itemID  int64
			shiftID int64
			day     sql.NullInt32
		}

		if err := rows.Scan(&row.itemID, &row.shiftID, &row.day); err != nil {
			return nil, err
		}

		if _, exists := itemsMap[row.itemID]; !exists {
			itemsMap[row.itemID] = &domain.AvailabilitySubmissionItem{
				ShiftID: row.shiftID,
				Days:    make([]int32, 0),
			}
		}

		if row.day.Valid {
			itemsMap[row.itemID].Days = append(itemsMap[row.itemID].Days, int32(row.day.Int32))
		}
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	submission.Items = make([]domain.AvailabilitySubmissionItem, 0, len(itemsMap))
	for _, item := range itemsMap {
		submission.Items = append(submission.Items, *item)
	}

	return submission, nil
}

func (r *Repository) GetAllSubmissionsBySchedulePlanID(schedulePlanID int64) ([]*domain.AvailabilitySubmission, error) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(r.cfg.Database.QueryTimeout)*time.Second)
	defer cancel()

	query := `
		SELECT 
			asm.id,
			asm.user_id,
			asmi.id,
			asmi.schedule_template_shift_id,
			asmiad.day_of_week,
			asm.created_at,
			asm.version
		FROM availability_submissions asm
		LEFT JOIN availability_submission_items asmi ON asm.id = asmi.availability_submission_id
		LEFT JOIN availability_submission_item_available_days asmiad ON asmi.id = asmiad.availability_submission_item_id
		WHERE asm.schedule_plan_id = $1
	`

	rows, err := r.dbpool.QueryContext(ctx, query, schedulePlanID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	submissionsMap := make(map[int64]*domain.AvailabilitySubmission)
	itemsMap := make(map[int64]map[int64]*domain.AvailabilitySubmissionItem) // submissionID -> itemID -> item

	for rows.Next() {
		var row struct {
			submissionID int64
			userID       int64
			itemID       sql.NullInt64
			shiftID      sql.NullInt64
			day          sql.NullInt32
			createdAt    time.Time
			version      int32
		}

		dst := []any{
			&row.submissionID,
			&row.userID,
			&row.itemID,
			&row.shiftID,
			&row.day,
			&row.createdAt,
			&row.version,
		}

		if err := rows.Scan(dst...); err != nil {
			return nil, err
		}

		if _, exists := submissionsMap[row.submissionID]; !exists {
			submissionsMap[row.submissionID] = &domain.AvailabilitySubmission{
				ID:             row.submissionID,
				SchedulePlanID: schedulePlanID,
				UserID:         row.userID,
				CreatedAt:      row.createdAt,
				Version:        row.version,
			}
			itemsMap[row.submissionID] = make(map[int64]*domain.AvailabilitySubmissionItem)
		}

		if !row.itemID.Valid {
			// 表示这条提交记录没有提交任何班次，虽然业务上不可能出现这种情况
			// 但为了提高代码的健壮性，这边还是需要处理
			continue
		}

		if _, exists := itemsMap[row.submissionID][row.itemID.Int64]; !exists {
			itemsMap[row.submissionID][row.itemID.Int64] = &domain.AvailabilitySubmissionItem{
				ShiftID: row.shiftID.Int64,
				Days:    make([]int32, 0),
			}
		}

		if !row.day.Valid {
			// 表示该班次，该用户没有提交任何可用的天数
			continue
		}

		itemsMap[row.submissionID][row.itemID.Int64].Days = append(itemsMap[row.submissionID][row.itemID.Int64].Days, row.day.Int32)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	// 组装结果
	for submissionID, submission := range submissionsMap {
		submission.Items = make([]domain.AvailabilitySubmissionItem, 0, len(itemsMap[submissionID]))
		for _, item := range itemsMap[submissionID] {
			submission.Items = append(submission.Items, *item)
		}
	}

	submissions := make([]*domain.AvailabilitySubmission, 0, len(submissionsMap))
	for _, submission := range submissionsMap {
		submissions = append(submissions, submission)
	}

	return submissions, nil
}
