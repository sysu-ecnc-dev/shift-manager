package domain

import (
	"time"

	"github.com/google/uuid"
)

type ScheduleTemplateMeta struct {
	ID          uuid.UUID `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"createdAt"`
	Version     int32     `json:"-"`
}

type ScheduleTemplateShift struct {
	ID                      uuid.UUID `json:"id"`
	StartTime               string    `json:"startTime"`
	EndTime                 string    `json:"endTime"`
	RequiredAssistantNumber int32     `json:"requiredAssistantNumber"`
	ApplicableDays          []int32   `json:"applicableDays"`
}

type ScheduleTemplate struct {
	Meta   ScheduleTemplateMeta    `json:"meta"`
	Shifts []ScheduleTemplateShift `json:"shifts"`
}
