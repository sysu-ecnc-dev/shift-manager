package main

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	amqp "github.com/rabbitmq/amqp091-go"
	"github.com/redis/go-redis/v9"
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
		return
	}

	// 创建数据库连接池
	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(cfg.Database.ConnectTimeout)*time.Second)
	defer cancel()

	dbpool, err := pgxpool.New(ctx, cfg.Database.DSN)
	if err != nil {
		logger.Error("无法创建数据库连接池", "error", err)
		return
	}
	defer dbpool.Close()
	if err := dbpool.Ping(ctx); err != nil {
		logger.Error("无法连接到数据库", "error", err)
		return
	}

	// 创建 repository
	repo := repository.NewRepository(dbpool)

	// 确保数据库中存在初始管理员
	if err := utils.EnsureAdminExists(cfg, repo); err != nil {
		logger.Error("无法确保初始管理员存在", "error", err)
		return
	}

	// 连接 rabbitmq
	conn, err := amqp.Dial(cfg.RabbitMQ.DSN)
	if err != nil {
		logger.Error("无法连接到 rabbitmq", "error", err)
		return
	}
	defer conn.Close()

	// 建立通道
	ch, err := conn.Channel()
	if err != nil {
		logger.Error("无法建立通道", "error", err)
		return
	}
	defer ch.Close()

	// 声明队列
	_, err = ch.QueueDeclare(
		"email_queue",
		true,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		logger.Error("无法声明队列", "error", err)
		return
	}

	// 连接 redis
	rdb := redis.NewClient(&redis.Options{
		Addr:     fmt.Sprintf("%s:%d", cfg.Redis.Host, cfg.Redis.Port),
		Password: cfg.Redis.Password,
		DB:       0,
	})

	// 创建 handler
	handler, err := handler.NewHandler(cfg, repo, ch, rdb)
	if err != nil {
		logger.Error("无法创建 handler", "error", err)
		return
	}
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

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM)

	go func() {
		logger.Info("正在启动服务器...", "port", cfg.Server.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Error("无法启动服务器", slog.String("error", err.Error()))
			return
		}
	}()

	<-quit
	logger.Info("正在关闭服务器...")

	ctx, cancel = context.WithTimeout(context.Background(), time.Duration(cfg.Server.ShutdownTimeout)*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		logger.Error("关闭服务器失败", slog.String("error", err.Error()))
	}
	logger.Info("服务器已成功关闭")
}
