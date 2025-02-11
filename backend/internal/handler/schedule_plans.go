package handler

import (
	"errors"
	"net/http"
	"time"

	"github.com/jackc/pgx/v5/pgconn"
	"github.com/sysu-ecnc-dev/shift-manager/backend/internal/domain"
	"github.com/sysu-ecnc-dev/shift-manager/backend/internal/utils"
)

func (h *Handler) CreateSchedulePlan(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Name                string    `json:"name" validate:"required"`
		Description         *string   `json:"description"`
		SubmissionStartTime time.Time `json:"submissionStartTime" validate:"required"`
		SubmissionEndTime   time.Time `json:"submissionEndTime" validate:"required"`
		ActiveStartTime     time.Time `json:"activeStartTime" validate:"required"`
		ActiveEndTime       time.Time `json:"activeEndTime" validate:"required"`
	}

	if err := h.readJSON(r, &req); err != nil {
		h.badRequest(w, r, err)
		return
	}
	if err := h.validate.Struct(req); err != nil {
		h.badRequest(w, r, err)
		return
	}

	plan := &domain.SchedulePlan{
		Name:                req.Name,
		Description:         "",
		SubmissionStartTime: req.SubmissionStartTime,
		SubmissionEndTime:   req.SubmissionEndTime,
		ActiveStartTime:     req.ActiveStartTime,
		ActiveEndTime:       req.ActiveEndTime,
	}

	if req.Description != nil {
		plan.Description = *req.Description
	}

	// 检查 plan 的时间是否合法
	if err := utils.ValidateSchedulePlanTime(plan); err != nil {
		h.badRequest(w, r, err)
		return
	}

	if err := h.repository.InsertSchedulePlan(plan); err != nil {
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
	}

	plan.Status = utils.CalculateSchedulePlanStatus(plan)

	h.successResponse(w, r, "创建排班计划成功", plan)
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

func (h *Handler) GetSchedulePlanByID(w http.ResponseWriter, r *http.Request) {
	plan := r.Context().Value(SchedulePlanCtx).(*domain.SchedulePlan)

	h.successResponse(w, r, "获取排班计划成功", plan)
}
