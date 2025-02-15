package domain

import "time"

type AvailabilitySubmissionItem struct {
	ShiftID int64   `json:"shiftID"`
	Days    []int32 `json:"days"`
}

type AvailabilitySubmission struct {
	ID             int64                        `json:"id"`
	SchedulePlanID int64                        `json:"schedulePlanID"`
	UserID         int64                        `json:"userID"`
	Items          []AvailabilitySubmissionItem `json:"items"`
	CreatedAt      time.Time                    `json:"createdAt"`
	Version        int32                        `json:"-"`
}
