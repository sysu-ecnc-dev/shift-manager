package handler

import (
	"errors"
	"net/http"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/jackc/pgx/v5"
	"golang.org/x/crypto/bcrypt"
)

type CustomClaims struct {
	Role string `json:"role"`
	jwt.RegisteredClaims
}

func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Username string `json:"username" validate:"required"`
		Password string `json:"password" validate:"required"`
	}

	if err := h.readJSON(r, &req); err != nil {
		h.badRequest(w, r, err)
		return
	}
	if err := h.validate.Struct(req); err != nil {
		h.badRequest(w, r, err)
		return
	}

	// 验证用户名和密码
	user, err := h.repository.GetUserByUsername(r.Context(), req.Username)
	if err != nil {
		switch {
		case errors.Is(err, pgx.ErrNoRows):
			h.errorResponse(w, r, "用户名不存在或密码错误")
		default:
			h.internalServerError(w, r, err)
		}
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		switch {
		case errors.Is(err, bcrypt.ErrMismatchedHashAndPassword):
			h.errorResponse(w, r, "用户名不存在或密码错误")
		default:
			h.internalServerError(w, r, err)
		}
		return
	}

	// 生成 JWT
	expiration := time.Now().Add(time.Duration(h.config.JWT.Expiration) * time.Hour)

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, CustomClaims{
		Role: string(user.Role),
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expiration),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Subject:   user.ID.String(),
		},
	})
	ss, err := token.SignedString([]byte(h.config.JWT.Secret))
	if err != nil {
		h.internalServerError(w, r, err)
		return
	}

	// 通过 http-only 的 cookie 返回给客户端
	cookie := &http.Cookie{
		Name:     "__ecnc_shift_manager_token",
		Value:    ss,
		Expires:  expiration,
		Path:     "/",
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteNoneMode,
	}

	if h.config.Environment == "production" {
		cookie.Secure = true
		cookie.SameSite = http.SameSiteStrictMode
	}

	http.SetCookie(w, cookie)

	h.successResponse(w, r, "登录成功", user)
}

func (h *Handler) Logout(w http.ResponseWriter, r *http.Request) {
	http.SetCookie(w, &http.Cookie{
		Name:    "__ecnc_shift_manager_token",
		Value:   "",
		Expires: time.Now().Add(-time.Hour),
		Path:    "/",
	})

	h.successResponse(w, r, "登出成功", nil)
}
