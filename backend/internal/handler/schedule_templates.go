package handler

import (
	"errors"
	"net/http"

	"github.com/jackc/pgx/v5/pgconn"
	"github.com/sysu-ecnc-dev/shift-manager/backend/internal/domain"
	"github.com/sysu-ecnc-dev/shift-manager/backend/internal/utils"
)

func (h *Handler) GetAllScheduleTemplateMeta(w http.ResponseWriter, r *http.Request) {
	stms, err := h.repository.GetAllScheduleTemplatesMeta()
	if err != nil {
		h.internalServerError(w, r, err)
		return
	}

	h.successResponse(w, r, "获取所有模板元数据成功", stms)
}

func (h *Handler) UpdateScheduleTemplateMeta(w http.ResponseWriter, r *http.Request) {

}

func (h *Handler) GetScheduleTemplate(w http.ResponseWriter, r *http.Request) {

}

func (h *Handler) DeleteScheduleTemplate(w http.ResponseWriter, r *http.Request) {

}

func (h *Handler) CreateScheduleTemplate(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Meta struct {
			Name        string  `json:"name" validate:"required"`
			Description *string `json:"description"`
		} `json:"meta"`
		Shifts []struct {
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

	stm := &domain.ScheduleTemplate{
		Meta: domain.ScheduleTemplateMeta{
			Name: req.Meta.Name,
		},
		Shifts: make([]domain.ScheduleTemplateShift, 0, len(req.Shifts)),
	}
	if req.Meta.Description != nil {
		stm.Meta.Description = *req.Meta.Description
	}

	for _, shift := range req.Shifts {
		stm.Shifts = append(stm.Shifts, domain.ScheduleTemplateShift{
			StartTime:               shift.StartTime,
			EndTime:                 shift.EndTime,
			RequiredAssistantNumber: shift.RequiredAssistantNumber,
			ApplicableDays:          shift.ApplicableDays,
		})
	}

	if err := utils.ValidateScheduleTemplateShiftTime(stm); err != nil {
		h.badRequest(w, r, err)
		return
	}

	if err := h.repository.CreateScheduleTemplate(stm); err != nil {
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

	h.successResponse(w, r, "创建模板成功", stm)
}
