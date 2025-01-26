package handler

import "net/http"

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
}
