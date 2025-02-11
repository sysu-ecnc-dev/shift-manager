package handler

import (
	"errors"
	"net/http"
	"time"

	"github.com/jackc/pgx/v5/pgconn"
	"github.com/sysu-ecnc-dev/shift-manager/backend/internal/domain"
	"github.com/sysu-ecnc-dev/shift-manager/backend/internal/utils"
)

func (h *Handler) UpdateSchedulePlan(w http.ResponseWriter, r *http.Request) {
	plan := r.Context().Value(SchedulePlanCtx).(*domain.SchedulePlan)

	var req struct {
		Name                *string    `json:"name"`
		Description         *string    `json:"description"`
		SubmissionStartTime *time.Time `json:"submissionStartTime"`
		SubmissionEndTime   *time.Time `json:"submissionEndTime"`
		ActiveStartTime     *time.Time `json:"activeStartTime"`
		ActiveEndTime       *time.Time `json:"activeEndTime"`
	}

	if err := h.readJSON(r, &req); err != nil {
		h.badRequest(w, r, err)
		return
	}
	if err := h.validate.Struct(req); err != nil {
		h.badRequest(w, r, err)
		return
	}

	// 将输入的参数解析到 plan 中
	if req.Name != nil {
		plan.Name = *req.Name
	}
	if req.Description != nil {
		plan.Description = *req.Description
	}
	if req.SubmissionStartTime != nil {
		plan.SubmissionStartTime = *req.SubmissionStartTime
	}
	if req.SubmissionEndTime != nil {
		plan.SubmissionEndTime = *req.SubmissionEndTime
	}
	if req.ActiveStartTime != nil {
		plan.ActiveStartTime = *req.ActiveStartTime
	}
	if req.ActiveEndTime != nil {
		plan.ActiveEndTime = *req.ActiveEndTime
	}

	// 检查 plan 的时间是否合法
	if err := utils.ValidateSchedulePlanTime(plan); err != nil {
		h.badRequest(w, r, err)
		return
	}

	// 更新排班计划
	if err := h.repository.UpdateSchedulePlan(plan); err != nil {
		var pgErr *pgconn.PgError
		switch {
		case errors.As(err, &pgErr):
			switch pgErr.ConstraintName {
			case "schedule_plans_name_key":
				h.errorResponse(w, r, "排班计划名称已存在")
			default:
				h.internalServerError(w, r, err)
			}
		default:
			h.internalServerError(w, r, err)
		}
		return
	}

	plan.Status = utils.CalculateSchedulePlanStatus(plan)
	h.successResponse(w, r, "更新排班计划成功", plan)
}

func (h *Handler) GetAllSchedulePlans(w http.ResponseWriter, r *http.Request) {
	plans, err := h.repository.GetAllSchedulePlans()
	if err != nil {
		h.internalServerError(w, r, err)
	}

	for _, plan := range plans {
		plan.Status = utils.CalculateSchedulePlanStatus(plan)
	}

	h.successResponse(w, r, "获取所有排班计划成功", plans)
}
