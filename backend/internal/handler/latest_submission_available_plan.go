package handler

import (
	"errors"
	"net/http"
	"slices"

	"github.com/sysu-ecnc-dev/shift-manager/backend/internal/domain"
)

func (h *Handler) GetLatestSubmissionAvailablePlan(w http.ResponseWriter, r *http.Request) {
	planWithTemplate := r.Context().Value(LatestSubmissionAvailablePlanCtx).(map[string]interface{})

	h.successResponse(w, r, "获取最新开放提交的排班计划成功", planWithTemplate)
}

func (h *Handler) SubmitAvailability(w http.ResponseWriter, r *http.Request) {
	planWithTemplate := r.Context().Value(LatestSubmissionAvailablePlanCtx).(map[string]interface{})
	userInfo := r.Context().Value(MyInfoCtx).(*domain.User)

	var req struct {
		Availabilities []struct {
			ShiftID int   `json:"shiftId" validate:"required"`
			Days    []int `json:"days" validate:"required,dive,min=1,max=7"`
		} `json:"availabilities" validate:"required,dive"`
	}

	if err := h.readJSON(r, &req); err != nil {
		h.badRequest(w, r, err)
		return
	}
	if err := h.validate.Struct(req); err != nil {
		h.badRequest(w, r, err)
		return
	}

	// 要先校验提交的 shift 和计划中的 template 的 shift 是否一致
	plan := planWithTemplate["plan"].(*domain.SchedulePlan)
	template := planWithTemplate["template"].(*domain.ScheduleTemplate)

	for _, availability := range req.Availabilities {
		valid := false

		for _, shift := range template.Shifts {
			if shift.ID == int64(availability.ShiftID) {
				valid = true
				for _, day := range availability.Days {
					if !slices.Contains(shift.ApplicableDays, int32(day)) {
						valid = false
						break
					}
				}
				if valid {
					break
				}
			}
		}

		if !valid {
			h.badRequest(w, r, errors.New("提交的班次和计划模板中的班次不一致"))
			return
		}
	}

	// 先删除之前的提交记录
	if err := h.repository.DeleteAvailabilitySubmissionByUsernameAndTemplateName(userInfo.Username, template.Meta.Name); err != nil {
		h.internalServerError(w, r, err)
		return
	}

	// 插入新的提交记录
	submission := &domain.AvailabilitySubmission{
		SchedulePlanName: plan.Name,
		Username:         userInfo.Username,
	}

	for _, availability := range req.Availabilities {
		submission.Items = append(submission.Items, domain.AvailabilitySubmissionItem{
			ShiftID: availability.ShiftID,
			Days:    availability.Days,
		})
	}

	if err := h.repository.InsertAvailabilitySubmission(submission); err != nil {
		h.internalServerError(w, r, err)
		return
	}

	h.successResponse(w, r, "提交成功", submission)
}
