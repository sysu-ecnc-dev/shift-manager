package handler

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/golang-jwt/jwt/v5"
	amqp "github.com/rabbitmq/amqp091-go"
	"github.com/sysu-ecnc-dev/shift-manager/backend/internal/domain"
	"github.com/sysu-ecnc-dev/shift-manager/backend/internal/utils"
	"golang.org/x/crypto/bcrypt"
)

type AuthClaims struct {
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
	user, err := h.repository.GetUserByUsername(req.Username)
	if err != nil {
		switch {
		case errors.Is(err, sql.ErrNoRows):
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

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, AuthClaims{
		Role: string(user.Role),
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expiration),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Subject:   strconv.FormatInt(user.ID, 10),
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

func (h *Handler) RequireResetPassword(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Username string `json:"username" validate:"required"`
	}

	if err := h.readJSON(r, &req); err != nil {
		h.badRequest(w, r, err)
		return
	}
	if err := h.validate.Struct(req); err != nil {
		h.badRequest(w, r, err)
		return
	}

	user, err := h.repository.GetUserByUsername(req.Username)
	if err != nil {
		switch {
		case errors.Is(err, sql.ErrNoRows):
			// 这里虽然已经知道了用户不存在，但是为了安全起见，还是告诉客户端邮件已发送，以防止接口被滥用
			h.successResponse(w, r, "重置密码所需验证码已通过邮件发送", nil)
		default:
			h.internalServerError(w, r, err)
		}
		return
	}

	// 生成 OTP 并将 OTP 存到 redis
	otp := utils.GenerateRandomOTP()

	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(h.config.Redis.OperationExpiration)*time.Minute)
	defer cancel()

	if err := h.redisClient.Set(ctx, fmt.Sprintf("otp_%s_reset_password", user.Username), otp, time.Duration(h.config.OTP.Expiration)*time.Minute).Err(); err != nil {
		h.internalServerError(w, r, err)
		return
	}

	// 准备邮件
	mailMessage := domain.MailMessage{
		Type: "reset_password",
		To:   user.Email,
		Data: domain.ResetPasswordMailData{
			FullName:   user.FullName,
			OTP:        otp,
			Expiration: h.config.OTP.Expiration / 60, // 邮件中显示的过期时间以分钟为单位，而配置中以秒为单位
		},
	}

	// 序列化邮件
	mailData, err := json.Marshal(mailMessage)
	if err != nil {
		h.internalServerError(w, r, err)
		return
	}

	// 发送邮件到消息队列中
	ctx, cancel = context.WithTimeout(context.Background(), time.Duration(h.config.RabbitMQ.PublishTimeout)*time.Second)
	defer cancel()

	if err := h.mailChannel.PublishWithContext(
		ctx,
		"",
		"email_queue",
		true,
		false,
		amqp.Publishing{
			ContentType: "application/json",
			Body:        mailData,
		},
	); err != nil {
		h.internalServerError(w, r, err)
		return
	}

	// 返回成功响应
	h.successResponse(w, r, "重置密码所需验证码已通过邮件发送", nil)
}

func (h *Handler) ConfirmResetPassword(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Username string `json:"username" validate:"required"`
		OTP      string `json:"otp" validate:"required"`
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

	// 检验 OTP
	ctx, cancel := context.WithTimeout(r.Context(), time.Duration(h.config.Redis.OperationExpiration)*time.Minute)
	defer cancel()

	otp, err := h.redisClient.Get(ctx, fmt.Sprintf("otp_%s_reset_password", req.Username)).Result()
	if err != nil {
		h.errorResponse(w, r, "验证码错误")
		return
	}

	if otp != req.OTP {
		h.errorResponse(w, r, "验证码错误")
		return
	}

	// 更新密码
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		h.internalServerError(w, r, err)
		return
	}

	// 先获取用户信息
	user, err := h.repository.GetUserByUsername(req.Username)
	if err != nil {
		h.internalServerError(w, r, err)
		return
	}

	user.PasswordHash = string(hashedPassword)

	if err := h.repository.UpdateUser(user); err != nil {
		switch {
		case errors.Is(err, sql.ErrNoRows):
			h.errorResponse(w, r, "请重试")
		default:
			h.internalServerError(w, r, err)
		}
		return
	}

	// 删除 OTP
	if err := h.redisClient.Del(ctx, fmt.Sprintf("otp_%s_reset_password", req.Username)).Err(); err != nil {
		h.internalServerError(w, r, err)
		return
	}

	h.successResponse(w, r, "重置密码成功", nil)
}
