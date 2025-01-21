package handler

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"time"

	"github.com/jackc/pgx/v5/pgconn"
	amqp "github.com/rabbitmq/amqp091-go"
	"github.com/sysu-ecnc-dev/shift-manager/backend/internal/repository"
	"github.com/sysu-ecnc-dev/shift-manager/backend/internal/utils"
	"golang.org/x/crypto/bcrypt"
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

func (h *Handler) CreateUser(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Username string `json:"username" validate:"required"`
		FullName string `json:"fullName" validate:"required"`
		Email    string `json:"email" validate:"required,email"`
		Role     string `json:"role" validate:"required,oneof=普通助理 资深助理 黑心"`
	}

	if err := h.readJSON(r, &req); err != nil {
		h.badRequest(w, r, err)
		return
	}
	if err := h.validate.Struct(req); err != nil {
		h.badRequest(w, r, err)
		return
	}

	// 生成随机密码
	password := utils.GenerateRandomPassword(h.config.NewUser.PasswordLength)

	// 对密码进行哈希
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		h.internalServerError(w, r, err)
		return
	}

	// 插入用户到数据库中
	user := &repository.User{
		Username:     req.Username,
		PasswordHash: string(hashedPassword),
		FullName:     req.FullName,
		Email:        req.Email,
		Role:         repository.Role(req.Role),
	}

	ctx, cancel := context.WithTimeout(r.Context(), time.Duration(h.config.Database.QueryTimeout)*time.Second)
	defer cancel()

	if err := h.repository.CreateUser(ctx, user); err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) {
			switch {
			case pgErr.ConstraintName == "users_username_key":
				h.badRequest(w, r, errors.New("用户名已存在"))
				return
			case pgErr.ConstraintName == "users_email_key":
				h.badRequest(w, r, errors.New("邮箱已存在"))
				return
			default:
				h.internalServerError(w, r, err)
				return
			}
		} else {
			h.internalServerError(w, r, err)
			return
		}
	}

	// 准备邮件
	mailMessage := repository.MailMessage{
		Type: "create_user",
		To:   user.Email,
		Data: repository.CreateUserMailData{
			FullName: req.FullName,
			Username: req.Username,
			Password: password,
		},
	}

	// 对邮件进行序列化
	emailData, err := json.Marshal(mailMessage)
	if err != nil {
		h.internalServerError(w, r, err)
		return
	}

	// 将邮件发送到消息队列
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
			Body:        emailData,
		},
	); err != nil {
		h.internalServerError(w, r, err)
		return
	}

	// 成功响应
	h.successResponse(w, r, "用户创建成功", nil)
}

func (h *Handler) GetUserInfo(w http.ResponseWriter, r *http.Request) {
	user := r.Context().Value(UserInfoCtx).(*repository.User)
	h.successResponse(w, r, "获取用户信息成功", user)
}

func (h *Handler) UpdateUser(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Role     *string `json:"role" validate:"oneof=普通助理 资深助理 黑心"`
		IsActive *bool   `json:"isActive"`
	}

	if err := h.readJSON(r, &req); err != nil {
		h.badRequest(w, r, err)
		return
	}
	if err := h.validate.Struct(req); err != nil {
		h.badRequest(w, r, err)
		return
	}

	user := r.Context().Value(UserInfoCtx).(*repository.User)

	// 禁止操作初始管理员
	if user.Username == h.config.InitialAdmin.Username {
		h.errorResponse(w, r, "禁止更新初始管理员信息")
		return
	}

	if req.Role != nil {
		user.Role = repository.Role(*req.Role)
	}
	if req.IsActive != nil {
		user.IsActive = *req.IsActive
	}

	ctx, cancel := context.WithTimeout(r.Context(), time.Duration(h.config.Database.QueryTimeout)*time.Second)
	defer cancel()

	if err := h.repository.UpdateUser(ctx, user); err != nil {
		h.internalServerError(w, r, err)
		return
	}

	h.successResponse(w, r, "用户更新成功", user)
}
