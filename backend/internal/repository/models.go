package repository

import (
	"time"

	"github.com/google/uuid"
)

type Role string

const (
	RoleNormalAssistant Role = "普通助理"
	RoleSeniorAssistant Role = "资深助理"
	RoleBlackCore       Role = "黑心"
)

type User struct {
	ID           uuid.UUID `json:"id"`
	Username     string    `json:"username"`
	PasswordHash string    `json:"-"`
	FullName     string    `json:"full_name"`
	Email        string    `json:"email"`
	Role         Role      `json:"role"`
	IsActive     bool      `json:"is_active"`
	CreatedAt    time.Time `json:"created_at"`
	Version      int       `json:"-"`
}
