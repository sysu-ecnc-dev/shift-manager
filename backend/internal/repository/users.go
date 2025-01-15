package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
)

func (r *Repository) GetUserByUsername(ctx context.Context, username string) (*User, error) {
	query := `
		SELECT * FROM users WHERE username = $1
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

func (r *Repository) GetUserByID(ctx context.Context, id uuid.UUID) (*User, error) {
	query := `
		SELECT * FROM users WHERE id = $1
	`

	rows, err := r.dbpool.Query(ctx, query, id)
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
		RETURNING *
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

func (r *Repository) UpdateUser(ctx context.Context, user *User) error {
	query := `
		UPDATE users 
		SET
			password_hash = $1,
			full_name = $2,
			email = $3,
			role = $4,
			active = $5,
			version = version + 1
		WHERE id = $6 AND version = $7
		RETURNING *
	`

	args := []any{
		user.PasswordHash,
		user.FullName,
		user.Email,
		user.Role,
		user.Active,
		user.ID,
		user.Version,
	}
	rows, err := r.dbpool.Query(ctx, query, args...)
	if err != nil {
		return err
	}

	*user, err = pgx.CollectOneRow(rows, pgx.RowToStructByName[User])
	if err != nil {
		return err
	}

	return nil
}

func (r *Repository) GetAllUsers(ctx context.Context) ([]User, error) {
	query := `
		SELECT * FROM users
	`

	rows, err := r.dbpool.Query(ctx, query)
	if err != nil {
		return nil, err
	}

	users, err := pgx.CollectRows(rows, pgx.RowToStructByName[User])
	if err != nil {
		return nil, err
	}

	return users, nil
}
