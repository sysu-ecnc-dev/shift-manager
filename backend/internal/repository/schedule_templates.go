package repository

import (
	"context"
	"database/sql"
	"time"

	"github.com/sysu-ecnc-dev/shift-manager/backend/internal/domain"
)

func (r *Repository) GetAllScheduleTemplates() ([]*domain.ScheduleTemplate, error) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(r.cfg.Database.QueryTimeout)*time.Second)
	defer cancel()

	query := `
		SELECT 
			st.id,
			st.name,
			st.description,
			st.created_at,
			st.version,
			sts.id,
			sts.start_time,
			sts.end_time,
			sts.required_assistant_number,
			stsad.day
		FROM schedule_templates st
		LEFT JOIN schedule_template_shifts sts ON st.id = sts.template_id
		LEFT JOIN schedule_template_shift_applicable_days stsad ON sts.id = stsad.shift_id
		ORDER BY st.id, sts.id
	`

	rows, err := r.dbpool.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	templatesMap := make(map[int64]*domain.ScheduleTemplate)
	shiftsMap := make(map[int64]map[int64]*domain.ScheduleTemplateShift) // templateID -> shiftID -> shift

	for rows.Next() {
		var row struct {
			ID          int64
			Name        string
			Description string
			CreatedAt   time.Time
			Version     int32

			ShiftID                 sql.NullInt64
			StartTime               sql.NullString
			EndTime                 sql.NullString
			RequiredAssistantNumber sql.NullInt32
			Day                     sql.NullInt32
		}

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

		if _, exists := templatesMap[row.ID]; !exists {
			// 说明此时是第一次查到这个 template，需要在 map 中初始化这个 template
			template := &domain.ScheduleTemplate{
				ID:          row.ID,
				Name:        row.Name,
				Description: row.Description,
				CreatedAt:   row.CreatedAt,
				Version:     row.Version,
			}
			templatesMap[row.ID] = template
			shiftsMap[row.ID] = make(map[int64]*domain.ScheduleTemplateShift)
		}

		// 如果 shiftID 为空，则表示这个模板不存在任何的班次，此时可以跳过 shift 解析的部分
		if !row.ShiftID.Valid {
			continue
		}

		// 解析 shift
		shift, exists := shiftsMap[row.ID][row.ShiftID.Int64]
		if !exists {
			// 说明此时是第一次查到这个 shift，需要在 map 中初始化这个 shift
			shift = &domain.ScheduleTemplateShift{
				ID:                      row.ShiftID.Int64,
				StartTime:               row.StartTime.String,
				EndTime:                 row.EndTime.String,
				RequiredAssistantNumber: row.RequiredAssistantNumber.Int32,
				ApplicableDays:          make([]int32, 0),
			}
			shiftsMap[row.ID][row.ShiftID.Int64] = shift
		}

		// 如果 day 为空，则表示这个 shift 不存在任何的适用日期，此时可以跳过 day 解析的部分
		if !row.Day.Valid {
			continue
		}

		// 解析 day
		shift.ApplicableDays = append(shift.ApplicableDays, row.Day.Int32)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	// 组装结果
	stms := make([]*domain.ScheduleTemplate, 0, len(templatesMap))

	for templateID, template := range templatesMap {
		template.Shifts = make([]domain.ScheduleTemplateShift, 0, len(shiftsMap[templateID]))
		for _, shift := range shiftsMap[templateID] {
			template.Shifts = append(template.Shifts, *shift)
		}
		stms = append(stms, template)
	}

	return stms, nil
}

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
		INSERT INTO schedule_templates (name, description)
		VALUES ($1, $2)
		RETURNING id, created_at, version
	`
	if err := tx.QueryRowContext(ctx, query, stm.Name, stm.Description).Scan(&stm.ID, &stm.CreatedAt, &stm.Version); err != nil {
		return err
	}

	for i := range stm.Shifts {
		query = `
			INSERT INTO schedule_template_shifts (template_id, start_time, end_time, required_assistant_number)
			VALUES ($1, $2, $3, $4)
			RETURNING id
		`
		params := []any{stm.ID, stm.Shifts[i].StartTime, stm.Shifts[i].EndTime, stm.Shifts[i].RequiredAssistantNumber}
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
	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(r.cfg.Database.QueryTimeout)*time.Second)
	defer cancel()

	query := `
		SELECT
			st.name,
			st.description,
			st.created_at,
			st.version,
			sts.id,
			sts.start_time,
			sts.end_time,
			sts.required_assistant_number,
			stsad.day
		FROM schedule_templates st
		LEFT JOIN schedule_template_shifts sts ON st.id = sts.template_id
		LEFT JOIN schedule_template_shift_applicable_days stsad ON sts.id = stsad.shift_id
		WHERE st.id = $1
		ORDER BY sts.id
	`

	rows, err := r.dbpool.QueryContext(ctx, query, id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	st := &domain.ScheduleTemplate{
		ID: id,
	}
	shiftsMap := make(map[int64]*domain.ScheduleTemplateShift)

	for rows.Next() {
		var row struct {
			Name        string
			Description string
			CreatedAt   time.Time
			Version     int32

			ShiftID                 sql.NullInt64
			StartTime               sql.NullString
			EndTime                 sql.NullString
			RequiredAssistantNumber sql.NullInt32
			Day                     sql.NullInt32
		}

		dst := []any{
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

		if st.Name == "" {
			// 说明此时是第一次查到这个模板，需要初始化这个模板
			st.Name = row.Name
			st.Description = row.Description
			st.CreatedAt = row.CreatedAt
			st.Version = row.Version
		}

		if !row.ShiftID.Valid {
			// 说明该模板不存在任何班次
			continue
		}

		// 解析班次
		shift, exists := shiftsMap[row.ShiftID.Int64]
		if !exists {
			// 说明此时是第一次查到这个班次，需要初始化这个班次
			shift = &domain.ScheduleTemplateShift{
				ID:                      row.ShiftID.Int64,
				StartTime:               row.StartTime.String,
				EndTime:                 row.EndTime.String,
				RequiredAssistantNumber: row.RequiredAssistantNumber.Int32,
				ApplicableDays:          make([]int32, 0),
			}
			shiftsMap[row.ShiftID.Int64] = shift
		}

		if !row.Day.Valid {
			// 说明该班次不存在任何适用日期
			continue
		}

		shift.ApplicableDays = append(shift.ApplicableDays, row.Day.Int32)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	st.Shifts = make([]domain.ScheduleTemplateShift, 0, len(shiftsMap))
	for _, shift := range shiftsMap {
		st.Shifts = append(st.Shifts, *shift)
	}

	return st, nil
}

func (r *Repository) GetScheduleTemplateID(name string) (int64, error) {
	query := `SELECT id FROM schedule_template_meta WHERE name = $1`

	var id int64
	if err := r.dbpool.QueryRowContext(context.Background(), query, name).Scan(&id); err != nil {
		return 0, err
	}

	return id, nil
}

func (r *Repository) UpdateScheduleTemplate(stm *domain.ScheduleTemplate) error {
	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(r.cfg.Database.QueryTimeout)*time.Second)
	defer cancel()

	query := `
		UPDATE schedule_templates
		SET 
			name = $1, 
			description = $2,
			version = version + 1
		WHERE id = $3 AND version = $4
		RETURNING version
	`

	params := []any{stm.Name, stm.Description, stm.ID, stm.Version}
	if err := r.dbpool.QueryRowContext(ctx, query, params...).Scan(&stm.Version); err != nil {
		return err
	}

	return nil
}

func (r *Repository) DeleteScheduleTemplate(id int64) error {
	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(r.cfg.Database.QueryTimeout)*time.Second)
	defer cancel()

	query := `
		DELETE FROM schedule_templates WHERE id = $1
	`

	_, err := r.dbpool.ExecContext(ctx, query, id)
	if err != nil {
		return err
	}

	return nil
}
