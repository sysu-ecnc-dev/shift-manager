package repository

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/sysu-ecnc-dev/shift-manager/backend/internal/domain"
)

func (r *Repository) GetAllScheduleTemplatesMeta() ([]*domain.ScheduleTemplateMeta, error) {
	query := `
		SELECT id, name, description, created_at, version FROM schedule_templates_meta
	`

	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(r.cfg.Database.QueryTimeout)*time.Second)
	defer cancel()

	// stms 存储所有 schedule_templates_meta 数据
	stms := make([]*domain.ScheduleTemplateMeta, 0)
	rows, err := r.dbpool.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		stm := &domain.ScheduleTemplateMeta{}
		dst := []any{&stm.ID, &stm.Name, &stm.Description, &stm.CreatedAt, &stm.Version}
		if err := rows.Scan(dst...); err != nil {
			return nil, err
		}
		stms = append(stms, stm)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return stms, nil
}

func (r *Repository) UpdateScheduleTemplateMeta(stm *domain.ScheduleTemplateMeta) error {
	query := `
		UPDATE schedule_templates_meta 
		SET
			name = $1,
			description = $2,
			version = version + 1
		WHERE id = $3 AND version = $4
		RETURNING created_at, version
	`

	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(r.cfg.Database.QueryTimeout)*time.Second)
	defer cancel()

	if err := r.dbpool.QueryRowContext(ctx, query, stm.Name, stm.Description, stm.ID, stm.Version).Scan(&stm.CreatedAt, &stm.Version); err != nil {
		return err
	}

	return nil
}

func (r *Repository) DeleteScheduleTemplateMeta(id uuid.UUID) error {
	query := `
		DELETE FROM schedule_templates_meta WHERE id = $1
	`

	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(r.cfg.Database.QueryTimeout)*time.Second)
	defer cancel()

	_, err := r.dbpool.ExecContext(ctx, query, id)
	if err != nil {
		return err
	}
	return nil
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
		INSERT INTO schedule_template_meta (name, description)
		VALUES ($1, $2)
		RETURNING id, created_at, version
	`
	if err := tx.QueryRowContext(ctx, query, stm.Meta.Name, stm.Meta.Description).Scan(&stm.Meta.ID, &stm.Meta.CreatedAt, &stm.Meta.Version); err != nil {
		return err
	}

	query = `
		INSERT INTO schedule_template_shifts (template_id, start_time, end_time, required_assistant_number, applicable_days)
		VALUES %s
		RETURNING id
	`
	shifts_num := len(stm.Shifts)
	placeholders := make([]string, 0, shifts_num*5)
	values := make([]any, 0, shifts_num*5)
	for i := 0; i < shifts_num; i++ {
		placeholders = append(placeholders, fmt.Sprintf("($%d, $%d, $%d, $%d, $%d)", i*5+1, i*5+2, i*5+3, i*5+4, i*5+5))
		values = append(values,
			stm.Meta.ID,
			stm.Shifts[i].StartTime,
			stm.Shifts[i].EndTime,
			stm.Shifts[i].RequiredAssistantNumber,
			stm.Shifts[i].ApplicableDays,
		)
	}
	query = fmt.Sprintf(query, strings.Join(placeholders, ","))
	rows, err := tx.QueryContext(ctx, query, values...)
	if err != nil {
		return err
	}
	defer rows.Close()

	for i := 0; i < shifts_num && rows.Next(); i++ {
		if err := rows.Scan(&stm.Shifts[i].ID); err != nil {
			return err
		}
	}

	if err := rows.Err(); err != nil {
		return err
	}

	if err := tx.Commit(); err != nil {
		return err
	}

	return nil
}
