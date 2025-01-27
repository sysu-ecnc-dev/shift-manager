package repository

import (
	"context"
	"time"

	"github.com/sysu-ecnc-dev/shift-manager/backend/internal/domain"
)

func (r *Repository) GetAllScheduleTemplatesMeta() ([]*domain.ScheduleTemplateMeta, error) {
	query := `
		SELECT id, name, description, created_at, version FROM schedule_template_meta
	`

	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(r.cfg.Database.QueryTimeout)*time.Second)
	defer cancel()

	// stms 存储所有 schedule_template_meta 数据
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

func (r *Repository) GetScheduleTemplateMeta(id int64) (*domain.ScheduleTemplateMeta, error) {
	query := `
		SELECT id, name, description, created_at, version FROM schedule_template_meta WHERE id = $1
	`

	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(r.cfg.Database.QueryTimeout)*time.Second)
	defer cancel()

	stm := &domain.ScheduleTemplateMeta{}
	dst := []any{&stm.ID, &stm.Name, &stm.Description, &stm.CreatedAt, &stm.Version}
	if err := r.dbpool.QueryRowContext(ctx, query, id).Scan(dst...); err != nil {
		return nil, err
	}

	return stm, nil
}

func (r *Repository) UpdateScheduleTemplateMeta(stm *domain.ScheduleTemplateMeta) error {
	query := `
		UPDATE schedule_template_meta 
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

func (r *Repository) DeleteScheduleTemplateMeta(id int64) error {
	query := `
		DELETE FROM schedule_template_meta WHERE id = $1
	`

	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(r.cfg.Database.QueryTimeout)*time.Second)
	defer cancel()

	_, err := r.dbpool.ExecContext(ctx, query, id)
	if err != nil {
		return err
	}
	return nil
}
