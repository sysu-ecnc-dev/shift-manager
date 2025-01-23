package handler

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"slices"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
)

type ResponseWriter struct {
	http.ResponseWriter
	StatusCode int
}

func (rw *ResponseWriter) WriteHeader(statusCode int) {
	rw.StatusCode = statusCode
	rw.ResponseWriter.WriteHeader(statusCode)
}

func (h *Handler) logger(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		rw := &ResponseWriter{ResponseWriter: w}
		next.ServeHTTP(rw, r)
		duration := time.Since(start)
		slog.Info("已处理请求", "status", rw.StatusCode, "ip", r.RemoteAddr, "method", r.Method, "path", r.URL.Path, "duration", duration)
	})
}

func (h *Handler) recoverer(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if err := recover(); err != nil {
				h.internalServerError(w, r, fmt.Errorf("panic: %v", err))
			}
		}()
		next.ServeHTTP(w, r)
	})
}

func (h *Handler) auth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// 从 cookie 中获取 token
		cookie, err := r.Cookie("__ecnc_shift_manager_token")
		if err != nil {
			switch {
			case errors.Is(err, http.ErrNoCookie):
				h.errorResponse(w, r, "用户未登录")
			default:
				h.internalServerError(w, r, err)
			}
			return
		}

		// 验证 token
		tokenString := cookie.Value
		claims := &AuthClaims{}
		_, err = jwt.ParseWithClaims(tokenString, claims, func(t *jwt.Token) (interface{}, error) {
			return []byte(h.config.JWT.Secret), nil
		})
		if err != nil {
			h.errorResponse(w, r, "无效的令牌")
			return
		}

		// 将 claims 中的 role 和 sub 附在 context 中
		ctx := r.Context()
		ctx = context.WithValue(ctx, RoleCtxKey, claims.Role)
		ctx = context.WithValue(ctx, SubCtxKey, claims.Subject)

		// 执行下一个 handler
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func (h *Handler) myInfo(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		subString := r.Context().Value(SubCtxKey).(string)

		sub, err := uuid.Parse(subString)
		if err != nil {
			h.internalServerError(w, r, err)
			return
		}

		myInfo, err := h.repository.GetUserByID(sub)
		if err != nil {
			switch {
			case errors.Is(err, pgx.ErrNoRows):
				h.errorResponse(w, r, "个人信息不存在")
			default:
				h.internalServerError(w, r, err)
			}
			return
		}

		ctx := context.WithValue(r.Context(), MyInfoCtx, myInfo)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func (h *Handler) RequiredRole(roles []string) func(next http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			role := r.Context().Value(RoleCtxKey).(string)
			if !slices.Contains(roles, role) {
				h.errorResponse(w, r, "权限不足")
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}

func (h *Handler) userInfo(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		userIDParam := chi.URLParam(r, "userID")
		userID, err := uuid.Parse(userIDParam)
		if err != nil {
			h.errorResponse(w, r, "用户ID无效")
			return
		}

		ctx, cancel := context.WithTimeout(r.Context(), time.Duration(h.config.Database.QueryTimeout)*time.Second)
		defer cancel()

		user, err := h.repository.GetUserByID(userID)
		if err != nil {
			switch {
			case errors.Is(err, pgx.ErrNoRows):
				h.errorResponse(w, r, "用户不存在")
			default:
				h.internalServerError(w, r, err)
			}
			return
		}

		ctx = context.WithValue(r.Context(), UserInfoCtx, user)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
