package utils

import (
	"errors"
	"fmt"
	"slices"
	"time"

	"github.com/sysu-ecnc-dev/shift-manager/backend/internal/domain"
	"github.com/sysu-ecnc-dev/shift-manager/backend/internal/repository"
)

func ValidateScheduleTemplateShiftTime(st *domain.ScheduleTemplate) error {
	// 检查每一个班次的结束时间是不是都大于开始时间
	for id, shift := range st.Shifts {
		startTime, err := time.Parse("15:04:05", shift.StartTime)
		if err != nil {
			return fmt.Errorf("班次 %d 的开始时间格式错误: %s", id, shift.StartTime)
		}
		endTime, err := time.Parse("15:04:05", shift.EndTime)
		if err != nil {
			return fmt.Errorf("班次 %d 的结束时间格式错误: %s", id, shift.EndTime)
		}
		if endTime.Before(startTime) {
			return fmt.Errorf("班次 %d 的结束时间 %s 不能小于开始时间 %s", id, shift.EndTime, shift.StartTime)
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
				return fmt.Errorf("班次 %d (%s~%s) 和班次 %d (%s~%s) 之间的时间冲突", i, iStartTime, iEndTime, j, jStartTime, jEndTime)
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

// 根据班次的 ID 获取模板中对应的班次
func GetShiftByID(template *domain.ScheduleTemplate, shiftID int64) (*domain.ScheduleTemplateShift, error) {
	var templateShift *domain.ScheduleTemplateShift = nil

	for _, shift := range template.Shifts {
		if shift.ID == shiftID {
			templateShift = &shift
			break
		}
	}

	if templateShift == nil {
		return nil, fmt.Errorf("班次 %d 不存在于该排班模版中", shiftID)
	}

	return templateShift, nil
}

func WeekDay(i int32) string {
	switch i {
	case 1:
		return "周一"
	case 2:
		return "周二"
	case 3:
		return "周三"
	case 4:
		return "周四"
	case 5:
		return "周五"
	case 6:
		return "周六"
	case 7:
		return "周日"
	default:
		return "[未知]"
	}
}

func ValidateSubmissionWithTemplate(submission *domain.AvailabilitySubmission, template *domain.ScheduleTemplate) error {
	if len(template.Shifts) != len(submission.Items) {
		return errors.New("提交的空闲时间中的班次数量和模板中的班次数量不匹配")
	}

	for i, item := range submission.Items {
		shift, err := GetShiftByID(template, item.ShiftID)
		if err != nil {
			return fmt.Errorf("第 %d 项提交的班次 %d 不存在于该排班模版中", i, item.ShiftID)
		}
		for _, day := range item.Days {
			if !slices.Contains(shift.ApplicableDays, day) {
				return fmt.Errorf(
					"第 %d 项提交的班次时间不存在, 对应模板中%s班次 %d (%s~%s) 无值班安排",
					i+1, WeekDay(day), shift.ID, shift.StartTime, shift.EndTime,
				)
			}
		}
	}

	return nil
}

func ValidateSchedulingResultWithTemplate(result *domain.SchedulingResult, template *domain.ScheduleTemplate) error {
	if len(result.Shifts) != len(template.Shifts) {
		return errors.New("排班结果中的班次数量和模板中的班次数量不匹配")
	}

	for _, resultShift := range result.Shifts {
		templateShift, err := GetShiftByID(template, resultShift.ShiftID)
		if err != nil {
			return err
		}

		for _, day := range templateShift.ApplicableDays {
			containDay := false

			for _, item := range resultShift.Items {
				if item.Day == day {
					containDay = true
					break
				}
			}

			if !containDay {
				return fmt.Errorf(
					"排班结果中%s班次 %d (%s~%s) 无人值班",
					WeekDay(day), templateShift.ID, templateShift.StartTime, templateShift.EndTime,
				)
			}
		}

		for _, item := range resultShift.Items {
			if !slices.Contains(templateShift.ApplicableDays, item.Day) {
				return fmt.Errorf(
					"排班结果中%s班次 %d (%s~%s) 在排班模版中不需要安排值班",
					WeekDay(item.Day), resultShift.ShiftID, templateShift.StartTime, templateShift.EndTime,
				)
			}
			// +1 是因为负责人也算一个助理
			if len(item.AssistantIDs)+1 > int(templateShift.RequiredAssistantNumber) {
				return fmt.Errorf(
					"排班结果中的%s班次 %d (%s~%s) 的的助理人数超过了模板中的要求",
					WeekDay(item.Day), resultShift.ShiftID, templateShift.StartTime, templateShift.EndTime,
				)
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

func ValidateSchedulingResultWithSubmissions(
	result *domain.SchedulingResult,
	submissions []*domain.AvailabilitySubmission,
	template *domain.ScheduleTemplate,
	repo *repository.Repository,
) error {
	for _, shift := range result.Shifts {
		for _, item := range shift.Items {
			if item.PrincipalID != nil {
				// 找到这个负责人对应的提交
				submission := getSubmissionByAssistantID(submissions, *item.PrincipalID)
				if submission == nil {
					templateShift, err := GetShiftByID(template, shift.ShiftID)
					if err != nil {
						return err
					}
					user, err := repo.GetUserByID(*item.PrincipalID)
					if err != nil {
						return err
					}
					return fmt.Errorf(
						"负责人%s没有提交%s班次 %d (%s~%s) 的空闲时间",
						user.FullName, WeekDay(item.Day), templateShift.ID, templateShift.StartTime, templateShift.EndTime,
					)
				}

				// 检查这个负责人是否在第 item.Day 天有空闲时间
				var ok bool = false
				for _, submissionItem := range submission.Items {
					if submissionItem.ShiftID == shift.ShiftID && slices.Contains(submissionItem.Days, item.Day) {
						ok = true
						break
					}
				}
				if !ok {
					templateShift, err := GetShiftByID(template, shift.ShiftID)
					if err != nil {
						return err
					}
					user, err := repo.GetUserByID(*item.PrincipalID)
					if err != nil {
						return err
					}
					return fmt.Errorf(
						"负责人%s在%s班次 %d (%s~%s) 没有空闲时间",
						user.FullName, WeekDay(item.Day), templateShift.ID, templateShift.StartTime, templateShift.EndTime,
					)
				}
			}
			for _, assistantID := range item.AssistantIDs {
				// 找到这个助理对应的提交
				submission := getSubmissionByAssistantID(submissions, assistantID)
				if submission == nil {
					templateShift, err := GetShiftByID(template, shift.ShiftID)
					if err != nil {
						return err
					}
					user, err := repo.GetUserByID(assistantID)
					if err != nil {
						return err
					}
					return fmt.Errorf(
						"助理%s没有提交%s班次 %d (%s~%s) 的空闲时间",
						user.FullName, WeekDay(item.Day), templateShift.ID, templateShift.StartTime, templateShift.EndTime,
					)
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
					templateShift, err := GetShiftByID(template, shift.ShiftID)
					if err != nil {
						return err
					}
					user, err := repo.GetUserByID(assistantID)
					if err != nil {
						return err
					}
					return fmt.Errorf(
						"助理%s在%s班次 %d (%s~%s) 没有空闲时间",
						user.FullName, WeekDay(item.Day), templateShift.ID, templateShift.StartTime, templateShift.EndTime,
					)
				}
			}
		}
	}

	return nil
}

func ValidIfExistsDuplicateAssistant(
	result *domain.SchedulingResult,
	template *domain.ScheduleTemplate,
	repo *repository.Repository,
) error {
	// 检查是否存在某个班次中的某一天有重复的助理
	for _, resultShift := range result.Shifts {
		for _, resultShiftItem := range resultShift.Items {
			// 先检查负责人是不是存在于助理数组中
			if resultShiftItem.PrincipalID != nil && slices.Contains(resultShiftItem.AssistantIDs, *resultShiftItem.PrincipalID) {
				templateShift, err := GetShiftByID(template, resultShift.ShiftID)
				if err != nil {
					return err
				}
				user, err := repo.GetUserByID(*resultShiftItem.PrincipalID)
				if err != nil {
					return err
				}
				return fmt.Errorf(
					"%s班次 %d (%s~%s) 的负责人和助理重复(%s)",
					WeekDay(resultShiftItem.Day), resultShift.ShiftID, templateShift.StartTime, templateShift.EndTime, user.FullName,
				)
			}
			// 检查助理之间是否有重复
			seen := make(map[int64]bool)
			for _, assistantID := range resultShiftItem.AssistantIDs {
				if seen[assistantID] {
					templateShift, err := GetShiftByID(template, resultShift.ShiftID)
					if err != nil {
						return err
					}
					user, err := repo.GetUserByID(assistantID)
					if err != nil {
						return err
					}
					return fmt.Errorf(
						"%s班次 %d (%s~%s) 的助理重复(%s)",
						WeekDay(resultShiftItem.Day), resultShift.ShiftID, templateShift.StartTime, templateShift.EndTime, user.FullName,
					)
				}
				seen[assistantID] = true
			}
		}
	}
	return nil
}
