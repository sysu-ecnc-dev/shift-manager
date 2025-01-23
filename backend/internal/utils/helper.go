package utils

import (
	"database/sql"
	"errors"

	"github.com/sysu-ecnc-dev/shift-manager/backend/internal/config"
	"github.com/sysu-ecnc-dev/shift-manager/backend/internal/repository"
	"golang.org/x/crypto/bcrypt"
)

func EnsureAdminExists(cfg *config.Config, repo *repository.Repository) error {
	admin, err := repo.GetUserByUsername(cfg.InitialAdmin.Username)
	if admin != nil && err == nil {
		// 说明此时管理员存在，直接返回
		return nil
	}

	if err != nil {
		switch {
		case errors.Is(err, sql.ErrNoRows):
			// 说明此时管理员不存在，需要创建新的管理员
		default:
			// 发生了其他错误
			return err
		}
	}

	passwordHash, err := bcrypt.GenerateFromPassword([]byte(cfg.InitialAdmin.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	admin = &repository.User{
		Username:     cfg.InitialAdmin.Username,
		PasswordHash: string(passwordHash),
		FullName:     cfg.InitialAdmin.FullName,
		Email:        cfg.InitialAdmin.Email,
		Role:         BlackCoreRole,
	}

	if err := repo.CreateUser(admin); err != nil {
		return err
	}

	return nil
}
