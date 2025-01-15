package repository

import (
	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct {
	dbpool *pgxpool.Pool
}

func NewRepository(dbpool *pgxpool.Pool) *Repository {
	return &Repository{
		dbpool: dbpool,
	}
}
