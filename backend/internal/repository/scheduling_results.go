package repository

import (
	"context"
	"database/sql"
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
		RETURNING id, created_at, version
	`

	if err := tx.QueryRowContext(ctx, query, result.SchedulePlanID).Scan(&result.ID, &result.CreatedAt, &result.Version); err != nil {
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

func (r *Repository) GetSchedulingResultBySchedulePlanID(schedulePlanID int64) (*domain.SchedulingResult, error) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(r.cfg.Database.QueryTimeout)*time.Second)
	defer cancel()

	query := `
		SELECT
			sr.id,
			srs.id,
			srs.schedule_template_shift_id,
			srsi.id,
			srsi.day_of_week,
			srsia.user_id,
			sr.created_at,
			sr.version
		FROM scheduling_results sr
		LEFT JOIN scheduling_result_shifts srs ON sr.id = srs.scheduling_result_id
		LEFT JOIN scheduling_result_shift_items srsi ON srs.id = srsi.scheduling_result_shift_id
		LEFT JOIN scheduling_result_shift_item_assistants srsia ON srsi.id = srsia.scheduling_result_shift_item_id
		WHERE sr.schedule_plan_id = $1
	`

	rows, err := r.dbpool.QueryContext(ctx, query, schedulePlanID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	result := &domain.SchedulingResult{
		SchedulePlanID: schedulePlanID,
	}
	resultShiftsMap := make(map[int64]*domain.SchedulingResultShift)              // shiftID -> shift
	resultItemsMap := make(map[int64]map[int64]*domain.SchedulingResultShiftItem) // shiftID -> itemID -> item

	for rows.Next() {
		var row struct {
			resultID        int64
			resultShiftID   sql.NullInt64
			templateShiftID sql.NullInt64
			resultItemID    sql.NullInt64
			dayOfWeek       sql.NullInt32
			assistantID     sql.NullInt64
			createdAt       time.Time
			version         int32
		}

		dst := []any{
			&row.resultID,
			&row.templateShiftID,
			&row.dayOfWeek,
			&row.assistantID,
			&row.createdAt,
			&row.version,
		}

		if err := rows.Scan(dst...); err != nil {
			return nil, err
		}

		result.ID = row.resultID
		result.CreatedAt = row.createdAt
		result.Version = row.version

		if !row.resultShiftID.Valid {
			// 说明这个排班结果不存在任何班次，这在业务上是不可能，但是为了代码的健壮性，这里还是需要处理
			continue
		}

		if _, exists := resultShiftsMap[row.resultShiftID.Int64]; !exists {
			resultShiftsMap[row.resultShiftID.Int64] = &domain.SchedulingResultShift{
				ShiftID: row.resultShiftID.Int64,
			}
			resultItemsMap[row.resultShiftID.Int64] = make(map[int64]*domain.SchedulingResultShiftItem)
		}

		if !row.resultItemID.Valid {
			// 说明这个班次的每天都不存在排班结果，这在业务上也是不可能的
			continue
		}

		if _, exists := resultItemsMap[row.resultShiftID.Int64][row.resultItemID.Int64]; !exists {
			resultItemsMap[row.resultShiftID.Int64][row.resultItemID.Int64] = &domain.SchedulingResultShiftItem{
				Day:          row.dayOfWeek.Int32,
				AssistantIDs: make([]int64, 0),
			}
		}

		if !row.assistantID.Valid {
			// 说明当天的这个班次没有任何助理，这是有可能的
			continue
		}

		resultItemsMap[row.resultShiftID.Int64][row.resultItemID.Int64].AssistantIDs = append(resultItemsMap[row.resultShiftID.Int64][row.resultItemID.Int64].AssistantIDs, row.assistantID.Int64)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	// 组装结果
	for _, shift := range resultShiftsMap {
		shift.Items = make([]domain.SchedulingResultShiftItem, 0, len(resultItemsMap[shift.ShiftID]))
		for _, item := range resultItemsMap[shift.ShiftID] {
			shift.Items = append(shift.Items, *item)
		}
	}
	result.Shifts = make([]domain.SchedulingResultShift, 0, len(resultShiftsMap))
	for _, shift := range resultShiftsMap {
		result.Shifts = append(result.Shifts, *shift)
	}

	return result, nil
}
