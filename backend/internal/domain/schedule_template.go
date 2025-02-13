package domain

import (
	"time"
)

type ScheduleTemplateShift struct {
	ID                      int64   `json:"id"`
	StartTime               string  `json:"startTime"`
	EndTime                 string  `json:"endTime"`
	RequiredAssistantNumber int32   `json:"requiredAssistantNumber"`
	ApplicableDays          []int32 `json:"applicableDays"`
}

type ScheduleTemplate struct {
	ID          int64                   `json:"id"`
	Name        string                  `json:"name"`
	Description string                  `json:"description"`
	Shifts      []ScheduleTemplateShift `json:"shifts"`
	CreatedAt   time.Time               `json:"createdAt"`
	Version     int32                   `json:"-"`
}
