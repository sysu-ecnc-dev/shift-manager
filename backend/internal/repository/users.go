package repository

import (
	"context"
	"time"

	"github.com/google/uuid"
)

func (r *Repository) GetUserByID(id uuid.UUID) (*User, error) {
	query := `
		SELECT username, password_hash, full_name, email, role, is_active, created_at, version
		FROM users WHERE id = $1
	`

	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(r.cfg.Database.QueryTimeout)*time.Second)
	defer cancel()

	user := &User{
		ID: id,
	}

	dst := []any{&user.Username, &user.PasswordHash, &user.FullName, &user.Email, &user.Role, &user.IsActive, &user.CreatedAt, &user.Version}
	if err := r.dbpool.QueryRowContext(ctx, query, id).Scan(dst...); err != nil {
		return nil, err
	}

	return user, nil
}

func (r *Repository) GetUserByUsername(username string) (*User, error) {
	query := `
		SELECT id, password_hash, full_name, email, role, is_active, created_at, version
		FROM users WHERE username = $1
	`

	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(r.cfg.Database.QueryTimeout)*time.Second)
	defer cancel()

	user := &User{
		Username: username,
	}

	dst := []any{&user.ID, &user.PasswordHash, &user.FullName, &user.Email, &user.Role, &user.IsActive, &user.CreatedAt, &user.Version}
	if err := r.dbpool.QueryRowContext(ctx, query, username).Scan(dst...); err != nil {
		return nil, err
	}

	return user, nil
}

func (r *Repository) UpdateUser(user *User) error {
	query := `
		UPDATE users 
		SET
		    password_hash = $1,
			email = $2,
			role = $3,
			is_active = $4,
			version = version + 1
		WHERE id = $5 AND version = $6
		RETURNING username, full_name, created_at, version
	`

	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(r.cfg.Database.QueryTimeout)*time.Second)
	defer cancel()

	args := []any{user.PasswordHash, user.Email, user.Role, user.IsActive, user.ID, user.Version}
	dst := []any{&user.Username, &user.FullName, &user.CreatedAt, &user.Version}
	if err := r.dbpool.QueryRowContext(ctx, query, args...).Scan(dst...); err != nil {
		return err
	}

	return nil
}

func (r *Repository) GetAllUsers() ([]*User, error) {
	query := `
		SELECT id, username, password_hash, full_name, email, role, is_active, created_at, version FROM users
	`

	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(r.cfg.Database.QueryTimeout)*time.Second)
	defer cancel()

	rows, err := r.dbpool.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	users := make([]*User, 0)
	for rows.Next() {
		user := &User{}
		dst := []any{&user.ID, &user.Username, &user.PasswordHash, &user.FullName, &user.Email, &user.Role, &user.IsActive, &user.CreatedAt, &user.Version}
		if err := rows.Scan(dst...); err != nil {
			return nil, err
		}
		users = append(users, user)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return users, nil
}

func (r *Repository) DeleteUser(id uuid.UUID) error {
	query := `
		DELETE FROM users WHERE id = $1
	`

	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(r.cfg.Database.QueryTimeout)*time.Second)
	defer cancel()

	_, err := r.dbpool.ExecContext(ctx, query, id)
	if err != nil {
		return err
	}

	return nil
}

func (r *Repository) CreateUser(user *User) error {
	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(r.cfg.Database.QueryTimeout)*time.Second)
	defer cancel()

	query := `
		INSERT INTO users (username, password_hash, full_name, email, role)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, is_active, version
	`

	args := []any{user.Username, user.PasswordHash, user.FullName, user.Email, user.Role}
	if err := r.dbpool.QueryRowContext(ctx, query, args...).Scan(&user.ID, &user.IsActive, &user.Version); err != nil {
		return err
	}

	return nil
}
