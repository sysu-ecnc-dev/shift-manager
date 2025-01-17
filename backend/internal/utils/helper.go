package utils

import (
	"context"
	"log/slog"
	"time"

	"github.com/sysu-ecnc-dev/shift-manager/backend/internal/config"
	"github.com/sysu-ecnc-dev/shift-manager/backend/internal/repository"
	"golang.org/x/crypto/bcrypt"
)

func EnsureAdminExists(cfg *config.Config, repo *repository.Repository) error {
	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(cfg.Database.QueryTimeout)*time.Second)
	defer cancel()

	admin, err := repo.GetUserByUsername(ctx, cfg.InitialAdmin.Username)
	if admin != nil && err == nil {
		return nil
	}

	slog.Warn("数据库中不存在初始管理员, 创建中...")

	// 生成密码哈希
	passwordHash, err := bcrypt.GenerateFromPassword([]byte(cfg.InitialAdmin.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	admin = &repository.User{
		Username:     cfg.InitialAdmin.Username,
		FullName:     cfg.InitialAdmin.FullName,
		Email:        cfg.InitialAdmin.Email,
		PasswordHash: string(passwordHash),
		Role:         repository.RoleBlackCore,
	}

	ctx, cancel = context.WithTimeout(context.Background(), time.Duration(cfg.Database.QueryTimeout)*time.Second)
	defer cancel()

	if err := repo.CreateUser(ctx, admin); err != nil {
		return err
	}

	return nil
}
