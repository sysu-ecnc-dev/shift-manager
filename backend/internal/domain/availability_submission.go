package domain

import "time"

type AvailabilitySubmissionItem struct {
	ShiftID int   `json:"shiftId"`
	Days    []int `json:"days"`
}

type AvailabilitySubmission struct {
	ID               int64                        `json:"id"`
	SchedulePlanName string                       `json:"schedulePlanName"`
	Username         string                       `json:"username"`
	Items            []AvailabilitySubmissionItem `json:"items"`
	CreatedAt        time.Time                    `json:"createdAt"`
}
