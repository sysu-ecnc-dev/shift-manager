package handler

import (
	"errors"
	"net/http"

	"github.com/jackc/pgx/v5/pgconn"
	"github.com/sysu-ecnc-dev/shift-manager/backend/internal/domain"
)

func (h *Handler) GetAllScheduleTemplateMeta(w http.ResponseWriter, r *http.Request) {
	stms, err := h.repository.GetAllScheduleTemplatesMeta()
	if err != nil {
		h.internalServerError(w, r, err)
		return
	}

	h.successResponse(w, r, "获取所有模板元数据成功", stms)
}

func (h *Handler) GetScheduleTemplateMeta(w http.ResponseWriter, r *http.Request) {
	stm := r.Context().Value(ScheduleTemplateMetaCtx).(*domain.ScheduleTemplateMeta)

	h.successResponse(w, r, "获取模板元数据成功", stm)
}

func (h *Handler) UpdateScheduleTemplateMeta(w http.ResponseWriter, r *http.Request) {
	stm := r.Context().Value(ScheduleTemplateMetaCtx).(*domain.ScheduleTemplateMeta)

	var req struct {
		Name        *string `json:"name"`
		Description *string `json:"description"`
	}

	if err := h.readJSON(r, &req); err != nil {
		h.badRequest(w, r, err)
		return
	}

	if req.Name != nil {
		stm.Name = *req.Name
	}
	if req.Description != nil {
		stm.Description = *req.Description
	}

	if err := h.repository.UpdateScheduleTemplateMeta(stm); err != nil {
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

	// 由于不允许更新模板中的班次，只能够更新模板的元数据
	// 所以这里提示“更新模板成功”不会引起歧义
	h.successResponse(w, r, "更新模板成功", stm)
}

func (h *Handler) DeleteScheduleTemplateMeta(w http.ResponseWriter, r *http.Request) {
	stm := r.Context().Value(ScheduleTemplateMetaCtx).(*domain.ScheduleTemplateMeta)

	if err := h.repository.DeleteScheduleTemplateMeta(stm.ID); err != nil {
		h.internalServerError(w, r, err)
		return
	}

	// 由于设置了 ON DELETE CASCADE，删除模板元数据时会自动删除模板
	// 故这里直接提示“删除模板成功”
	h.successResponse(w, r, "删除模板成功", nil)
}
