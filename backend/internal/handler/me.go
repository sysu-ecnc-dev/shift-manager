package handler

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
	"github.com/sysu-ecnc-dev/shift-manager/backend/internal/domain"
	"github.com/sysu-ecnc-dev/shift-manager/backend/internal/utils"
	"golang.org/x/crypto/bcrypt"
)

func (h *Handler) GetMyInfo(w http.ResponseWriter, r *http.Request) {
	myInfo := r.Context().Value(MyInfoCtx).(*domain.User)
	h.successResponse(w, r, "获取个人信息成功", myInfo)
}

func (h *Handler) UpdateMyPassword(w http.ResponseWriter, r *http.Request) {
	myInfo := r.Context().Value(MyInfoCtx).(*domain.User)

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

func (h *Handler) RequireUpdateEmail(w http.ResponseWriter, r *http.Request) {
	myInfo := r.Context().Value(MyInfoCtx).(*domain.User)

	var req struct {
		NewEmail string `json:"newEmail" validate:"required,email"`
	}

	if err := h.readJSON(r, &req); err != nil {
		h.badRequest(w, r, err)
		return
	}
	if err := h.validate.Struct(req); err != nil {
		h.badRequest(w, r, err)
		return
	}

	// 检测新邮箱是否已被占用
	isExists, err := h.repository.CheckEmailIfExists(req.NewEmail)
	if err != nil {
		h.internalServerError(w, r, err)
		return
	}

	if isExists {
		h.errorResponse(w, r, "邮箱已被占用")
		return
	}

	// 生成 OTP 并将 OTP 存到 redis
	otp := utils.GenerateRandomOTP()

	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(h.config.Redis.OperationExpiration)*time.Minute)
	defer cancel()

	if err := h.redisClient.Set(ctx, fmt.Sprintf("otp_%s_change_email_to_%s", myInfo.Username, req.NewEmail), otp, time.Duration(h.config.OTP.Expiration)*time.Minute).Err(); err != nil {
		h.internalServerError(w, r, err)
		return
	}

	// 准备邮件
	mailMessage := domain.MailMessage{
		Type: "change_email",
		To:   req.NewEmail,
		Data: domain.ChangeEmailMailData{
			FullName:   myInfo.FullName,
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
	h.successResponse(w, r, "更改邮箱所需验证码已通过邮件发送", nil)
}

func (h *Handler) ConfirmUpdateEmail(w http.ResponseWriter, r *http.Request) {
	myInfo := r.Context().Value(MyInfoCtx).(*domain.User)

	var req struct {
		OTP      string `json:"otp" validate:"required"`
		NewEmail string `json:"newEmail" validate:"required,email"`
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

	otp, err := h.redisClient.Get(ctx, fmt.Sprintf("otp_%s_change_email_to_%s", myInfo.Username, req.NewEmail)).Result()
	if err != nil {
		h.errorResponse(w, r, "验证码错误")
		return
	}

	if otp != req.OTP {
		h.errorResponse(w, r, "验证码错误")
		return
	}

	// 更新邮箱
	myInfo.Email = req.NewEmail
	if err := h.repository.UpdateUser(myInfo); err != nil {
		h.internalServerError(w, r, err)
		return
	}

	// 删除 OTP
	if err := h.redisClient.Del(ctx, fmt.Sprintf("otp_%s_change_email_to_%s", myInfo.Username, req.NewEmail)).Err(); err != nil {
		h.internalServerError(w, r, err)
		return
	}

	// 响应
	h.successResponse(w, r, "更改邮箱成功", nil)
}
