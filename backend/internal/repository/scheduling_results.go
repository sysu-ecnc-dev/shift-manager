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

	// 先将之前的排班结果删除
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
				INSERT INTO scheduling_result_shift_items (scheduling_result_shift_id, day_of_week, principal_id)
				VALUES ($1, $2, $3)
				RETURNING id
			`

			var itemID int64
			if err := tx.QueryRowContext(ctx, query, shiftID, item.Day, item.PrincipalID).Scan(&itemID); err != nil {
				return err
			}

			for _, assistantID := range item.AssistantIDs {
				query := `
					INSERT INTO scheduling_result_shift_item_assistants (scheduling_result_shift_item_id, assistant_id)
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
			srs.schedule_template_shift_id,
			srsi.day_of_week,
			srsi.principal_id,
			srsia.assistant_id,
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

	shiftsMap := make(map[int64]*domain.SchedulingResultShift)              // templateShiftID -> shift
	itemsMap := make(map[int64]map[int32]*domain.SchedulingResultShiftItem) // templateShiftID -> item.Day -> item

	for rows.Next() {
		var row struct {
			resultID        int64
			templateShiftID sql.NullInt64
			dayOfWeek       sql.NullInt32
			principalID     sql.NullInt64
			assistantID     sql.NullInt64
			createdAt       time.Time
			version         int32
		}

		dst := []any{
			&row.resultID,
			&row.templateShiftID,
			&row.dayOfWeek,
			&row.principalID,
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

		if !row.templateShiftID.Valid {
			// 说明这个排班结果不存在任何班次，这在业务上是不可能，但是为了代码的健壮性，这里还是需要处理
			continue
		}

		if _, exists := shiftsMap[row.templateShiftID.Int64]; !exists {
			shiftsMap[row.templateShiftID.Int64] = &domain.SchedulingResultShift{
				ShiftID: row.templateShiftID.Int64,
			}
			itemsMap[row.templateShiftID.Int64] = make(map[int32]*domain.SchedulingResultShiftItem)
		}

		if !row.dayOfWeek.Valid {
			// 说明这个班次的每天都不存在排班结果，这在业务上也是不可能的
			continue
		}

		if _, exists := itemsMap[row.templateShiftID.Int64][row.dayOfWeek.Int32]; !exists {
			itemsMap[row.templateShiftID.Int64][row.dayOfWeek.Int32] = &domain.SchedulingResultShiftItem{
				Day:          row.dayOfWeek.Int32,
				PrincipalID:  nil,
				AssistantIDs: make([]int64, 0),
			}
			if row.principalID.Valid {
				itemsMap[row.templateShiftID.Int64][row.dayOfWeek.Int32].PrincipalID = &row.principalID.Int64
			}
		}

		if !row.assistantID.Valid {
			// 说明当天的这个班次没有任何助理，这是有可能的
			continue
		}

		itemsMap[row.templateShiftID.Int64][row.dayOfWeek.Int32].AssistantIDs = append(itemsMap[row.templateShiftID.Int64][row.dayOfWeek.Int32].AssistantIDs, row.assistantID.Int64)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	// 组装结果
	result.Shifts = make([]domain.SchedulingResultShift, 0, len(shiftsMap))
	for _, shift := range shiftsMap {
		shift.Items = make([]domain.SchedulingResultShiftItem, 0, len(itemsMap[shift.ShiftID]))
		for _, item := range itemsMap[shift.ShiftID] {
			shift.Items = append(shift.Items, *item)
		}
		result.Shifts = append(result.Shifts, *shift)
	}

	// 还需要处理没有结果的情况
	if result.ID == 0 {
		return nil, sql.ErrNoRows
	}

	return result, nil
}
