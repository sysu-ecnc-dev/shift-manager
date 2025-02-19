package domain

import "time"

type SchedulingResultShiftItem struct {
	Day          int32   `json:"day"`
	PrincipalID  *int64  `json:"principalID"` // 当负责人的 ID 为空（0）时，表示该班次没有负责人
	AssistantIDs []int64 `json:"assistantIDs"`
}

type SchedulingResultShift struct {
	ShiftID int64                       `json:"shiftID"`
	Items   []SchedulingResultShiftItem `json:"items"`
}

type SchedulingResult struct {
	ID             int64                   `json:"id"`
	SchedulePlanID int64                   `json:"schedulePlanID"`
	Shifts         []SchedulingResultShift `json:"shifts"`
	CreatedAt      time.Time               `json:"createdAt"`
	Version        int32                   `json:"-"`
}
