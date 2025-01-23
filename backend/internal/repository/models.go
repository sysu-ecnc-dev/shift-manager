package repository

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID           uuid.UUID `json:"id"`
	Username     string    `json:"username"`
	PasswordHash string    `json:"-"`
	FullName     string    `json:"fullName"`
	Email        string    `json:"email"`
	Role         string    `json:"role"`
	IsActive     bool      `json:"isActive"`
	CreatedAt    time.Time `json:"createdAt"`
	Version      int32     `json:"-"`
}

type ScheduleTemplateMeta struct {
	ID          uuid.UUID `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"createdAt"`
	Version     int32     `json:"-"`
}

type ScheduleTemplateShift struct {
	ID         uuid.UUID `json:"id"`
	TemplateID uuid.UUID `json:"templateId"`
	StartTime  time.Time `json:"startTime"`
	EndTime    time.Time `json:"endTime"`
}

type ScheduleTemplateShiftApplicableDays struct {
	ID        uuid.UUID `json:"id"`
	ShiftID   uuid.UUID `json:"shiftId"`
	DayOfWeek int32     `json:"dayOfWeek"`
}
