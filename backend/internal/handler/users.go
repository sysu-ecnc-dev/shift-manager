package handler

import (
	"context"
	"net/http"
	"time"
)

func (h *Handler) GetAllUsers(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), time.Duration(h.config.Database.QueryTimeout)*time.Second)
	defer cancel()

	users, err := h.repository.GetAllUsers(ctx)
	if err != nil {
		h.internalServerError(w, r, err)
		return
	}

	h.successResponse(w, r, "获取用户列表成功", users)
}
