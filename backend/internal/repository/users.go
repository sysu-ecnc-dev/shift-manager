package repository

import (
	"context"

	"github.com/jackc/pgx/v5"
)

func (r *Repository) GetUserByUsername(ctx context.Context, username string) (*User, error) {
	query := `
		SELECT
			id,
			username,
			password_hash,
			full_name,
			email,
			role,
			created_at,
			version
		FROM users WHERE username = $1
	`

	rows, err := r.dbpool.Query(ctx, query, username)
	if err != nil {
		return nil, err
	}

	user, err := pgx.CollectOneRow(rows, pgx.RowToStructByName[User])
	if err != nil {
		return nil, err
	}

	return &user, nil
}

func (r *Repository) CreateUser(ctx context.Context, user *User) error {
	query := `
		INSERT INTO users (username, password_hash, full_name, email, role)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, username, password_hash, full_name, email, role, created_at, version
	`

	rows, err := r.dbpool.Query(ctx, query, user.Username, user.PasswordHash, user.FullName, user.Email, user.Role)
	if err != nil {
		return err
	}

	*user, err = pgx.CollectOneRow(rows, pgx.RowToStructByName[User])
	if err != nil {
		return err
	}

	return nil
}
