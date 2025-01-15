package main

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/sysu-ecnc-dev/shift-manager/backend/internal/config"
	"github.com/sysu-ecnc-dev/shift-manager/backend/internal/handler"
	"github.com/sysu-ecnc-dev/shift-manager/backend/internal/repository"
	"github.com/sysu-ecnc-dev/shift-manager/backend/internal/utils"
)

func main() {
	logger := slog.New(slog.NewTextHandler(os.Stdout, nil))
	slog.SetDefault(logger)

	cfg, err := config.LoadConfig()
	if err != nil {
		logger.Error("无法加载配置文件", "error", err)
		os.Exit(1)
	}

	// 创建数据库连接池
	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(cfg.Database.ConnectTimeout)*time.Second)
	defer cancel()

	dbpool, err := pgxpool.New(ctx, fmt.Sprintf("postgres://%s:%s@%s:%d/%s?sslmode=disable",
		cfg.Database.User,
		cfg.Database.Password,
		cfg.Database.Host,
		cfg.Database.Port,
		cfg.Database.DBName,
	))
	if err != nil {
		logger.Error("无法创建数据库连接池", "error", err)
		os.Exit(1)
	}
	if err := dbpool.Ping(ctx); err != nil {
		logger.Error("无法连接到数据库", "error", err)
		os.Exit(1)
	}
	defer dbpool.Close()

	// 创建 repository
	repo := repository.NewRepository(dbpool)

	// 确保数据库中存在初始管理员
	if err := utils.EnsureAdminExists(cfg, repo); err != nil {
		logger.Error("无法确保初始管理员存在", "error", err)
		os.Exit(1)
	}

	// 创建 handler
	handler := handler.NewHandler(cfg, repo)
	handler.RegisterRoutes()

	// 启动 HTTP 服务器
	srv := &http.Server{
		Addr:         fmt.Sprintf(":%s", cfg.Server.Port),
		Handler:      handler.Mux,
		IdleTimeout:  time.Duration(cfg.Server.IdleTimeout) * time.Second,
		ReadTimeout:  time.Duration(cfg.Server.ReadTimeout) * time.Second,
		WriteTimeout: time.Duration(cfg.Server.WriteTimeout) * time.Second,
		ErrorLog:     slog.NewLogLogger(logger.Handler(), slog.LevelError),
	}

	logger.Info("正在启动服务器...", "port", cfg.Server.Port)
	if err := srv.ListenAndServe(); err != nil {
		logger.Error("无法启动服务器", "error", err)
		os.Exit(1)
	}
}
