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
		TemplateName        string    `json:"templateName" validate:"required"`
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
		Name:                 req.Name,
		Description:          "",
		SubmissionStartTime:  req.SubmissionStartTime,
		SubmissionEndTime:    req.SubmissionEndTime,
		ActiveStartTime:      req.ActiveStartTime,
		ActiveEndTime:        req.ActiveEndTime,
		ScheduleTemplateName: req.TemplateName,
	}

	if req.Description != nil {
		plan.Description = *req.Description
	}

	// 检查 plan 的时间是否合法
	if err := utils.ValidateSchedulePlanTime(plan); err != nil {
		h.badRequest(w, r, err)
		return
	}

	// 插入数据到数据库中
	if err := h.repository.InsertSchedulePlan(plan); err != nil {
		var pgErr *pgconn.PgError
		switch {
		case errors.As(err, &pgErr):
			switch pgErr.ConstraintName {
			case "schedule_plans_name_key":
				h.errorResponse(w, r, "排班计划名称已存在")
			case "schedule_plans_schedule_template_id_fkey":
				h.errorResponse(w, r, "排班计划模板不存在")
			default:
				h.internalServerError(w, r, err)
			}
		default:
			h.internalServerError(w, r, err)
		}
		return
	}

	plan.Status = utils.CalculateSchedulePlanStatus(plan)
	h.successResponse(w, r, "创建排班计划成功", plan)
}

func (h *Handler) GetSchedulePlanByID(w http.ResponseWriter, r *http.Request) {
	plan := r.Context().Value(SchedulePlanCtx).(*domain.SchedulePlan)

	h.successResponse(w, r, "获取排班计划成功", plan)
}

func (h *Handler) DeleteSchedulePlan(w http.ResponseWriter, r *http.Request) {
	plan := r.Context().Value(SchedulePlanCtx).(*domain.SchedulePlan)

	if err := h.repository.DeleteSchedulePlan(plan.ID); err != nil {
		h.internalServerError(w, r, err)
		return
	}

	h.successResponse(w, r, "删除排班计划成功", nil)
}
