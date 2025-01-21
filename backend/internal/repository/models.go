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
	FullName     string    `json:"fullName"`
	Email        string    `json:"email"`
	Role         Role      `json:"role"`
	IsActive     bool      `json:"isActive"`
	CreatedAt    time.Time `json:"createdAt"`
	Version      int       `json:"-"`
}

type MailMessage struct {
	Type string `json:"type"`
	To   string `json:"to"`
	Data any    `json:"data"`
}

type CreateUserMailData struct {
	FullName string `json:"fullName"`
	Username string `json:"username"`
	Password string `json:"password"`
}

type ResetPasswordMailData struct {
	FullName   string `json:"fullName"`
	OTP        string `json:"otp"`
	Expiration int    `json:"expiration"`
}
