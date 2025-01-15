package handler

import "net/http"

func (h *Handler) GetAllUsers(w http.ResponseWriter, r *http.Request) {
	users, err := h.repository.GetAllUsers(r.Context())
	if err != nil {
		h.internalServerError(w, r, err)
		return
	}

	h.successResponse(w, r, "获取用户列表成功", users)
}
