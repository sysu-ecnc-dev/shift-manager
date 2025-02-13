package domain

import "time"

type SchedulePlan struct {
	ID                  int64     `json:"id"`
	Name                string    `json:"name"`
	Description         string    `json:"description"`
	SubmissionStartTime time.Time `json:"submissionStartTime"`
	SubmissionEndTime   time.Time `json:"submissionEndTime"`
	ActiveStartTime     time.Time `json:"activeStartTime"`
	ActiveEndTime       time.Time `json:"activeEndTime"`
	ScheduleTemplateID  int64     `json:"scheduleTemplateID"`
	CreatedAt           time.Time `json:"createdAt"`
	Version             int32     `json:"-"`
}
