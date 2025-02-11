package utils

import (
	"time"

	"github.com/sysu-ecnc-dev/shift-manager/backend/internal/domain"
)

func CalculateSchedulePlanStatus(plan *domain.SchedulePlan) domain.SchedulePlanStatus {
	now := time.Now()

	switch {
	case now.Before(plan.SubmissionStartTime):
		return domain.SchedulePlanStatusNotStarted
	case now.After(plan.SubmissionStartTime) && now.Before(plan.SubmissionEndTime):
		return domain.SchedulePlanStatusSubmissionAvailable
	case now.After(plan.SubmissionEndTime) && now.Before(plan.ActiveStartTime):
		return domain.SchedulePlanStatusScheduling
	case now.After(plan.ActiveStartTime) && now.Before(plan.ActiveEndTime):
		return domain.SchedulePlanStatusActive
	case now.After(plan.ActiveEndTime):
		return domain.SchedulePlanStatusEnded
	default:
		return domain.SchedulePlanStatusNotStarted
	}
}
