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
	ID           uuid.UUID
	Username     string
	PasswordHash string
	FullName     string
	Email        string
	Role         Role
	CreatedAt    time.Time
	Version      int
}
