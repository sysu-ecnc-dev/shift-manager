package handler

import (
	"database/sql"
	"errors"
	"net/http"

	"github.com/sysu-ecnc-dev/shift-manager/backend/internal/repository"
	"golang.org/x/crypto/bcrypt"
)

func (h *Handler) GetMyInfo(w http.ResponseWriter, r *http.Request) {
	myInfo := r.Context().Value(MyInfoCtx).(*repository.User)
	h.successResponse(w, r, "获取个人信息成功", myInfo)
}

func (h *Handler) UpdateMyPassword(w http.ResponseWriter, r *http.Request) {
	myInfo := r.Context().Value(MyInfoCtx).(*repository.User)

	var req struct {
		OldPassword string `json:"oldPassword" validate:"required"`
		NewPassword string `json:"newPassword" validate:"required"`
	}

	if err := h.readJSON(r, &req); err != nil {
		h.badRequest(w, r, err)
		return
	}
	if err := h.validate.Struct(req); err != nil {
		h.badRequest(w, r, err)
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(myInfo.PasswordHash), []byte(req.OldPassword)); err != nil {
		h.errorResponse(w, r, "旧密码错误")
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		h.internalServerError(w, r, err)
		return
	}

	myInfo.PasswordHash = string(hashedPassword)

	if err := h.repository.UpdateUser(myInfo); err != nil {
		switch {
		case errors.Is(err, sql.ErrNoRows):
			h.errorResponse(w, r, "更新密码失败，请重试")
		default:
			h.internalServerError(w, r, err)
		}
		return
	}

	h.successResponse(w, r, "更新密码成功", nil)
}
