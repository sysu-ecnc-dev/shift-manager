package repository

import (
	"context"
	"time"

	"github.com/sysu-ecnc-dev/shift-manager/backend/internal/domain"
)

func (r *Repository) InsertSchedulingResult(result *domain.SchedulingResult) error {
	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(r.cfg.Database.TransactionTimeout)*time.Second)
	defer cancel()

	tx, err := r.dbpool.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer func() {
		_ = tx.Rollback()
	}()

	// 先将之前的排版结果删除
	query := `DELETE FROM scheduling_results WHERE schedule_plan_id = $1`
	if _, err := tx.ExecContext(ctx, query, result.SchedulePlanID); err != nil {
		return err
	}

	query = `
		INSERT INTO scheduling_results (schedule_plan_id)
		VALUES ($1)
		RETURNING id
	`

	if err := tx.QueryRowContext(ctx, query, result.SchedulePlanID).Scan(&result.ID); err != nil {
		return err
	}

	for _, shift := range result.Shifts {
		query := `
			INSERT INTO scheduling_result_shifts (scheduling_result_id, schedule_template_shift_id)
			VALUES ($1, $2)
			RETURNING id
		`

		var shiftID int64
		if err := tx.QueryRowContext(ctx, query, result.ID, shift.ShiftID).Scan(&shiftID); err != nil {
			return err
		}

		for _, item := range shift.Items {
			query := `
				INSERT INTO scheduling_result_shift_items (scheduling_result_shift_id, day_of_week)
				VALUES ($1, $2)
				RETURNING id
			`

			var itemID int64
			if err := tx.QueryRowContext(ctx, query, shiftID, item.Day).Scan(&itemID); err != nil {
				return err
			}

			for _, assistantID := range item.AssistantIDs {
				query := `
					INSERT INTO scheduling_result_shift_item_assistants (scheduling_result_shift_item_id, user_id)
					VALUES ($1, $2)
				`

				if _, err := tx.ExecContext(ctx, query, itemID, assistantID); err != nil {
					return err
				}
			}
		}
	}

	if err := tx.Commit(); err != nil {
		return err
	}

	return nil
}
