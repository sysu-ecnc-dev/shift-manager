package handler

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"net/http"
	"time"

	"github.com/jackc/pgx/v5/pgconn"
	amqp "github.com/rabbitmq/amqp091-go"
	"github.com/sysu-ecnc-dev/shift-manager/backend/internal/domain"
	"github.com/sysu-ecnc-dev/shift-manager/backend/internal/utils"
	"golang.org/x/crypto/bcrypt"
)

func (h *Handler) GetAllUserInfo(w http.ResponseWriter, r *http.Request) {
	users, err := h.repository.GetAllUsers()
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
	user := &domain.User{
		Username:     req.Username,
		PasswordHash: string(hashedPassword),
		FullName:     req.FullName,
		Email:        req.Email,
		Role:         domain.Role(req.Role),
	}

	if err := h.repository.CreateUser(user); err != nil {
		var pgErr *pgconn.PgError
		switch {
		case errors.As(err, &pgErr):
			switch {
			case pgErr.ConstraintName == "users_username_key":
				h.badRequest(w, r, errors.New("用户名已存在"))
			case pgErr.ConstraintName == "users_email_key":
				h.badRequest(w, r, errors.New("邮箱已存在"))
			default:
				h.internalServerError(w, r, err)
			}
		default:
			h.internalServerError(w, r, err)
		}
		return
	}

	// 准备邮件
	mailMessage := domain.MailMessage{
		Type: "create_user",
		To:   user.Email,
		Data: domain.CreateUserMailData{
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
	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(h.config.RabbitMQ.PublishTimeout)*time.Second)
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
	h.successResponse(w, r, "用户创建成功", user)
}

func (h *Handler) GetUserInfo(w http.ResponseWriter, r *http.Request) {
	user := r.Context().Value(UserInfoCtx).(*domain.User)
	h.successResponse(w, r, "获取用户信息成功", user)
}

func (h *Handler) UpdateUser(w http.ResponseWriter, r *http.Request) {
	var req struct {
		FullName *string `json:"fullName"`
		Email    *string `json:"email" validate:"omitempty,email"`
		Role     *string `json:"role" validate:"omitempty,oneof=普通助理 资深助理 黑心"`
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

	user := r.Context().Value(UserInfoCtx).(*domain.User)

	if req.FullName != nil {
		user.FullName = *req.FullName
	}
	if req.Email != nil {
		user.Email = *req.Email
	}
	if req.Role != nil {
		user.Role = domain.Role(*req.Role)
	}
	if req.IsActive != nil {
		user.IsActive = *req.IsActive
	}

	if err := h.repository.UpdateUser(user); err != nil {
		var pgErr *pgconn.PgError
		switch {
		case errors.As(err, &pgErr):
			switch {
			case pgErr.ConstraintName == "users_email_key":
				h.badRequest(w, r, errors.New("邮箱已存在"))
			case pgErr.ConstraintName == "users_username_key":
				h.badRequest(w, r, errors.New("用户名已存在"))
			default:
				h.internalServerError(w, r, err)
			}
		case errors.Is(err, sql.ErrNoRows):
			h.errorResponse(w, r, "更新用户信息失败，请重试")
		default:
			h.internalServerError(w, r, err)
		}
		return
	}

	h.successResponse(w, r, "更新用户信息成功", user)
}

func (h *Handler) DeleteUser(w http.ResponseWriter, r *http.Request) {
	user := r.Context().Value(UserInfoCtx).(*domain.User)

	if err := h.repository.DeleteUser(user.ID); err != nil {
		h.internalServerError(w, r, err)
		return
	}

	h.successResponse(w, r, "删除用户成功", nil)
}

func (h *Handler) UpdateUserPassword(w http.ResponseWriter, r *http.Request) {
	user := r.Context().Value(UserInfoCtx).(*domain.User)

	var req struct {
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

	// 对密码进行哈希
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		h.internalServerError(w, r, err)
		return
	}

	user.PasswordHash = string(hashedPassword)
	if err := h.repository.UpdateUser(user); err != nil {
		h.internalServerError(w, r, err)
		return
	}

	h.successResponse(w, r, "修改密码成功", nil)
}
