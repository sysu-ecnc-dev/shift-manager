package repository

import (
	"context"
	"database/sql"
	"time"

	"github.com/sysu-ecnc-dev/shift-manager/backend/internal/domain"
)

func (r *Repository) CreateScheduleTemplate(stm *domain.ScheduleTemplate) error {
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
		INSERT INTO schedule_template_meta (name, description)
		VALUES ($1, $2)
		RETURNING id, created_at, version
	`
	if err := tx.QueryRowContext(ctx, query, stm.Meta.Name, stm.Meta.Description).Scan(&stm.Meta.ID, &stm.Meta.CreatedAt, &stm.Meta.Version); err != nil {
		return err
	}

	for i := range stm.Shifts {
		query = `
			INSERT INTO schedule_template_shifts (template_id, start_time, end_time, required_assistant_number)
			VALUES ($1, $2, $3, $4)
			RETURNING id
		`
		params := []any{stm.Meta.ID, stm.Shifts[i].StartTime, stm.Shifts[i].EndTime, stm.Shifts[i].RequiredAssistantNumber}
		if err := tx.QueryRowContext(ctx, query, params...).Scan(&stm.Shifts[i].ID); err != nil {
			return err
		}

		for _, day := range stm.Shifts[i].ApplicableDays {
			query = `
				INSERT INTO schedule_template_shift_applicable_days (shift_id, day)
				VALUES ($1, $2)
			`
			if _, err := tx.ExecContext(ctx, query, stm.Shifts[i].ID, day); err != nil {
				return err
			}
		}
	}

	if err := tx.Commit(); err != nil {
		return err
	}

	return nil
}

func (r *Repository) GetScheduleTemplate(id int64) (*domain.ScheduleTemplate, error) {
	query := `
		SELECT
			stm.id,
			stm.name,
			stm.description,
			stm.created_at,
			stm.version,
			sts.id,
			sts.start_time,
			sts.end_time,
			sts.required_assistant_number,
			stsad.day
		FROM schedule_template_meta stm
		LEFT JOIN schedule_template_shifts sts ON stm.id = sts.template_id
		LEFT JOIN schedule_template_shift_applicable_days stsad ON sts.id = stsad.shift_id
		WHERE stm.id = $1
	`

	type Row struct {
		ID                      int64
		Name                    string
		Description             string
		CreatedAt               time.Time
		Version                 int32
		ShiftID                 sql.NullInt64
		StartTime               sql.NullString
		EndTime                 sql.NullString
		RequiredAssistantNumber sql.NullInt32
		Day                     sql.NullInt32
	}

	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(r.cfg.Database.QueryTimeout)*time.Second)
	defer cancel()

	stm := &domain.ScheduleTemplate{}
	uuidShiftMap := make(map[int64]domain.ScheduleTemplateShift) // 用来存储查询过程中的 shift，最后用于构建 stm.Shifts

	rows, err := r.dbpool.QueryContext(ctx, query, id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var row Row
		dst := []any{
			&row.ID,
			&row.Name,
			&row.Description,
			&row.CreatedAt,
			&row.Version,
			&row.ShiftID,
			&row.StartTime,
			&row.EndTime,
			&row.RequiredAssistantNumber,
			&row.Day,
		}
		if err := rows.Scan(dst...); err != nil {
			return nil, err
		}

		// 如果 stm.Meta.ID 为 0，则表示是第一次查询到数据，需要初始化 stm.Meta
		if stm.Meta.ID == 0 {
			stm.Meta.ID = row.ID
			stm.Meta.Name = row.Name
			stm.Meta.Description = row.Description
			stm.Meta.CreatedAt = row.CreatedAt
			stm.Meta.Version = row.Version
			stm.Shifts = make([]domain.ScheduleTemplateShift, 0)
		}

		// 如果查询结果中某一行的 shift 的 uuid 为空，则表示这个模板不存在任何的班次
		// 在这里 continue 和 break 都可以
		if !row.ShiftID.Valid {
			continue
		}

		// 检查 uuidShiftMap 中是否已经存在这个 shift
		if _, ok := uuidShiftMap[row.ShiftID.Int64]; !ok {
			shift := domain.ScheduleTemplateShift{
				ID:                      row.ShiftID.Int64,
				StartTime:               row.StartTime.String,
				EndTime:                 row.EndTime.String,
				RequiredAssistantNumber: row.RequiredAssistantNumber.Int32,
				ApplicableDays:          make([]int32, 0),
			}
			uuidShiftMap[row.ShiftID.Int64] = shift
		}

		// 如果查询结果中某一行的 shift 的 day 为空，则表示这个 shift 不存在任何的适用日期
		if !row.Day.Valid {
			continue
		}

		// go 不允许直接修改 map 中的值，所以需要先获取到 shift，然后修改 shift 的 ApplicableDays
		shift := uuidShiftMap[row.ShiftID.Int64]
		shift.ApplicableDays = append(shift.ApplicableDays, row.Day.Int32)
		uuidShiftMap[row.ShiftID.Int64] = shift
	}

	// 将 map 中的 shifts 添加到结果中
	for _, shift := range uuidShiftMap {
		stm.Shifts = append(stm.Shifts, shift)
	}

	// 这里还需要检查 stm 是否为空，存在没有查询结果的情况
	if stm.Meta.ID == 0 {
		return nil, sql.ErrNoRows
	}

	return stm, nil
}
