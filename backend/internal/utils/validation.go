package utils

import (
	"errors"
	"fmt"
	"slices"
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

func ValidateSubmissionWithTemplate(submission *domain.AvailabilitySubmission, template *domain.ScheduleTemplate) error {
	if len(template.Shifts) != len(submission.Items) {
		return errors.New("提交的空闲时间中的班次数量和模板中的班次数量不匹配")
	}

	for i, item := range submission.Items {
		isValid := false

		for _, shift := range template.Shifts {
			if shift.ID == item.ShiftID {
				containAllDays := true

				for _, day := range item.Days {
					if !slices.Contains(shift.ApplicableDays, day) {
						containAllDays = false
						break
					}
				}

				if containAllDays {
					isValid = true
					break
				}
			}
		}

		if !isValid {
			return fmt.Errorf("第 %d 项不符合模板中的班次", i+1)
		}
	}

	return nil
}

func ValidateSchedulingResultWithTemplate(result *domain.SchedulingResult, template *domain.ScheduleTemplate) error {
	if len(result.Shifts) != len(template.Shifts) {
		return errors.New("排班结果中的班次数量和模板中的班次数量不匹配")
	}

	for i, resultShift := range result.Shifts {
		if len(resultShift.Items) != len(template.Shifts[i].ApplicableDays) {
			return fmt.Errorf("排班结果中的第 %d 项的班次存在没有提交结果的天数", i+1)
		}

		var templateShift *domain.ScheduleTemplateShift = nil

		for _, shift := range template.Shifts {
			if shift.ID == resultShift.ShiftID {
				templateShift = &shift
			}
		}

		if templateShift == nil {
			return fmt.Errorf("排班结果中的第 %d 项不存在于排班模板中", i+1)
		}

		for _, item := range resultShift.Items {
			if !slices.Contains(templateShift.ApplicableDays, item.Day) {
				return fmt.Errorf("排班结果中的第 %d 项的第 %d 天不符合模板中的班次", i+1, item.Day)
			}
			if len(item.AssistantIDs) > int(templateShift.RequiredAssistantNumber) {
				return fmt.Errorf("排班结果中的第 %d 项的第 %d 天的助理人数超过了模板中的要求", i+1, item.Day)
			}
		}
	}

	return nil
}

func getSubmissionByAssistantID(submissions []*domain.AvailabilitySubmission, assistantID int64) *domain.AvailabilitySubmission {
	for _, submission := range submissions {
		if submission.UserID == assistantID {
			return submission
		}
	}
	return nil
}

func ValidateSchedulingResultWithSubmissions(result *domain.SchedulingResult, submissions []*domain.AvailabilitySubmission) error {
	for i, shift := range result.Shifts {
		for _, item := range shift.Items {
			for _, assistantID := range item.AssistantIDs {
				// 找到这个助理对应的提交
				submission := getSubmissionByAssistantID(submissions, assistantID)
				if submission == nil {
					return fmt.Errorf("班次 %d 的第 %d 天的 id 为 %d 的助理没有提交空闲时间", i+1, item.Day, assistantID)
				}

				// 检查这个助理是否在第 item.Day 天有空闲时间
				var ok bool = false
				for _, submissionItem := range submission.Items {
					if submissionItem.ShiftID == shift.ShiftID && slices.Contains(submissionItem.Days, item.Day) {
						ok = true
						break
					}
				}
				if !ok {
					return fmt.Errorf("id 为 %d 的助理在班次 %d 的第 %d 天没有空闲时间", assistantID, shift.ShiftID, item.Day)
				}
			}
		}
	}

	return nil
}
