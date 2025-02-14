package handler

import (
	"database/sql"
	"errors"
	"net/http"

	"github.com/jackc/pgx/v5/pgconn"
	"github.com/sysu-ecnc-dev/shift-manager/backend/internal/domain"
	"github.com/sysu-ecnc-dev/shift-manager/backend/internal/utils"
)

func (h *Handler) GetAllScheduleTemplates(w http.ResponseWriter, r *http.Request) {
	sts, err := h.repository.GetAllScheduleTemplates()
	if err != nil {
		h.internalServerError(w, r, err)
		return
	}

	h.successResponse(w, r, "获取所有排班模板成功", sts)
}

func (h *Handler) CreateScheduleTemplate(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Name        string `json:"name" validate:"required"`
		Description string `json:"description"`
		Shifts      []struct {
			StartTime               string  `json:"startTime" validate:"required"`
			EndTime                 string  `json:"endTime" validate:"required"`
			RequiredAssistantNumber int32   `json:"requiredAssistantNumber" validate:"required,gte=1"`
			ApplicableDays          []int32 `json:"applicableDays" validate:"required,dive,gte=1,lte=7"`
		} `json:"shifts" validate:"required,dive"`
	}

	if err := h.readJSON(r, &req); err != nil {
		h.badRequest(w, r, err)
		return
	}
	if err := h.validate.Struct(req); err != nil {
		h.badRequest(w, r, err)
		return
	}

	st := &domain.ScheduleTemplate{
		Name:        req.Name,
		Description: req.Description,
		Shifts:      make([]domain.ScheduleTemplateShift, 0, len(req.Shifts)),
	}

	for _, shift := range req.Shifts {
		st.Shifts = append(st.Shifts, domain.ScheduleTemplateShift{
			StartTime:               shift.StartTime,
			EndTime:                 shift.EndTime,
			RequiredAssistantNumber: shift.RequiredAssistantNumber,
			ApplicableDays:          shift.ApplicableDays,
		})
	}

	if err := utils.ValidateScheduleTemplateShiftTime(st); err != nil {
		h.badRequest(w, r, err)
		return
	}

	if err := h.repository.CreateScheduleTemplate(st); err != nil {
		var pgErr *pgconn.PgError
		switch {
		case errors.As(err, &pgErr):
			switch pgErr.ConstraintName {
			case "schedule_template_meta_name_key":
				h.errorResponse(w, r, "模板名称已存在")
			default:
				h.internalServerError(w, r, err)
			}
		default:
			h.internalServerError(w, r, err)
		}
		return
	}

	h.successResponse(w, r, "创建模板成功", st)
}

func (h *Handler) GetScheduleTemplate(w http.ResponseWriter, r *http.Request) {
	st := r.Context().Value(ScheduleTemplateCtx).(*domain.ScheduleTemplate)

	h.successResponse(w, r, "获取模板成功", st)
}

func (h *Handler) UpdateScheduleTemplate(w http.ResponseWriter, r *http.Request) {
	st := r.Context().Value(ScheduleTemplateCtx).(*domain.ScheduleTemplate)

	var req struct {
		Name        *string `json:"name"`
		Description *string `json:"description"`
	}

	if err := h.readJSON(r, &req); err != nil {
		h.badRequest(w, r, err)
		return
	}
	if err := h.validate.Struct(req); err != nil {
		h.badRequest(w, r, err)
		return
	}

	if req.Name != nil {
		st.Name = *req.Name
	}
	if req.Description != nil {
		st.Description = *req.Description
	}

	if err := h.repository.UpdateScheduleTemplate(st); err != nil {
		var pgErr *pgconn.PgError
		switch {
		case errors.As(err, &pgErr):
			switch pgErr.ConstraintName {
			case "schedule_template_meta_name_key":
				h.errorResponse(w, r, "模板名称已存在")
			default:
				h.internalServerError(w, r, err)
			}
		case errors.Is(err, sql.ErrNoRows):
			h.errorResponse(w, r, "请重试")
		default:
			h.internalServerError(w, r, err)
		}
		return
	}

	h.successResponse(w, r, "更新模板成功", st)
}

func (h *Handler) DeleteScheduleTemplate(w http.ResponseWriter, r *http.Request) {
	st := r.Context().Value(ScheduleTemplateCtx).(*domain.ScheduleTemplate)

	if err := h.repository.DeleteScheduleTemplate(st.ID); err != nil {
		var pgErr *pgconn.PgError
		switch {
		case errors.As(err, &pgErr):
			switch pgErr.ConstraintName {
			case "schedule_plans_schedule_template_id_fkey":
				h.errorResponse(w, r, "该模板已被应用于排班计划，无法删除")
			default:
				h.internalServerError(w, r, err)
			}
		default:
			h.internalServerError(w, r, err)
		}
		return
	}

	h.successResponse(w, r, "删除模板成功", nil)
}
