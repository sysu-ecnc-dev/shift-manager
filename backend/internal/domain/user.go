package domain

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
	FullName     string    `json:"fullName"`
	Email        string    `json:"email"`
	Role         Role      `json:"role"`
	IsActive     bool      `json:"isActive"`
	CreatedAt    time.Time `json:"createdAt"`
	Version      int32     `json:"-"`
}
