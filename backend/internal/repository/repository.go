package repository

import (
	"database/sql"

	"github.com/sysu-ecnc-dev/shift-manager/backend/internal/config"
)

type Repository struct {
	cfg    *config.Config
	dbpool *sql.DB
}

func NewRepository(cfg *config.Config, dbpool *sql.DB) *Repository {
	return &Repository{
		cfg:    cfg,
		dbpool: dbpool,
	}
}
