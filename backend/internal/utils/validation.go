package utils

import (
	"fmt"
	"time"

	"github.com/sysu-ecnc-dev/shift-manager/backend/internal/domain"
)

func ValidateScheduleTemplateShiftTime(st *domain.ScheduleTemplate) error {
	// 检查每一个班次的结束时间是不是都大于开始时间
	for id, shift := range st.Shifts {
		startTime, err := time.Parse("15:04:05", shift.StartTime)
		if err != nil {
			return fmt.Errorf("班次 %d 的开始时间格式错误", id)
		}
		endTime, err := time.Parse("15:04:05", shift.EndTime)
		if err != nil {
			return fmt.Errorf("班次 %d 的结束时间格式错误", id)
		}
		if endTime.Before(startTime) {
			return fmt.Errorf("班次 %d 的结束时间不能小于开始时间", id)
		}
	}

	// 检查各个班次之间的时间是否冲突
	for i := 0; i < len(st.Shifts); i++ {
		iStartTime, _ := time.Parse("15:04:05", st.Shifts[i].StartTime)
		iEndTime, _ := time.Parse("15:04:05", st.Shifts[i].EndTime)

		for j := i + 1; j < len(st.Shifts); j++ {
			jStartTime, _ := time.Parse("15:04:05", st.Shifts[j].StartTime)
			jEndTime, _ := time.Parse("15:04:05", st.Shifts[j].EndTime)

			if !(jStartTime.After(iEndTime) || jStartTime.Equal(iEndTime) || iStartTime.After(jEndTime) || iStartTime.Equal(jEndTime)) {
				return fmt.Errorf("班次 %d 和班次 %d 之间的时间冲突", i, j)
			}
		}
	}
	return nil
}

func ValidateSchedulePlanTime(plan *domain.SchedulePlan) error {
	if plan.SubmissionStartTime.After(plan.SubmissionEndTime) {
		return fmt.Errorf("提交开始时间不能晚于提交结束时间")
	}

	if plan.ActiveStartTime.After(plan.ActiveEndTime) {
		return fmt.Errorf("生效开始时间不能晚于生效结束时间")
	}

	if plan.ActiveStartTime.Before(plan.SubmissionEndTime) {
		return fmt.Errorf("生效开始时间不能早于提交结束时间")
	}

	return nil
}
