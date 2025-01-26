package main

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
	"github.com/redis/go-redis/v9"
	"github.com/sysu-ecnc-dev/shift-manager/backend/internal/config"
	"github.com/sysu-ecnc-dev/shift-manager/backend/internal/domain"
	"github.com/sysu-ecnc-dev/shift-manager/backend/internal/handler"
	"github.com/sysu-ecnc-dev/shift-manager/backend/internal/repository"
	"golang.org/x/crypto/bcrypt"

	"github.com/jackc/pgx/v5/pgconn"
	_ "github.com/jackc/pgx/v5/stdlib"
)

func main() {
	/**********************************************
	 * 创建 logger
	 **********************************************/
	logger := slog.New(slog.NewTextHandler(os.Stdout, nil))
	slog.SetDefault(logger)

	/**********************************************
	 * 加载配置
	 **********************************************/
	cfg, err := config.LoadConfig()
	if err != nil {
		logger.Error("无法加载配置文件", "error", err)
		return
	}

	/**********************************************
	 * 连接数据库
	 **********************************************/
	dbpool, err := sql.Open("pgx", cfg.Database.DSN)
	if err != nil {
		logger.Error("无法创建数据库连接池", "error", err)
		return
	}
	defer dbpool.Close()

	dbpool.SetMaxOpenConns(cfg.Database.MaxOpenConns)
	dbpool.SetMaxIdleConns(cfg.Database.MaxIdleConns)
	dbpool.SetConnMaxIdleTime(time.Duration(cfg.Database.MaxIdleTime) * time.Second)

	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(cfg.Database.ConnectTimeout)*time.Second)
	defer cancel()

	// sql.Open 只是创建数据库连接池对象，并不会立即连接到数据库，因此需要显式地 ping 一下
	if err := dbpool.PingContext(ctx); err != nil {
		logger.Error("无法连接到数据库", "error", err)
		return
	}

	/**********************************************
	 * 创建 repository
	 **********************************************/
	repo := repository.NewRepository(cfg, dbpool)

	/**********************************************
	 * 确保数据库中存在初始管理员
	 **********************************************/
	passwordHash, err := bcrypt.GenerateFromPassword([]byte(cfg.InitialAdmin.Password), bcrypt.DefaultCost)
	if err != nil {
		logger.Error("无法生成初始管理员密码哈希", "error", err)
		return
	}
	initialAdmin := &domain.User{
		Username:     cfg.InitialAdmin.Username,
		PasswordHash: string(passwordHash),
		FullName:     cfg.InitialAdmin.FullName,
		Email:        cfg.InitialAdmin.Email,
		Role:         domain.RoleBlackCore,
	}
	if err := repo.CreateUser(initialAdmin); err != nil {
		var pgErr *pgconn.PgError
		switch {
		case errors.As(err, &pgErr):
			switch pgErr.ConstraintName {
			case "users_username_key":
				// 如果返回这个错误，说明数据库中已经存在初始管理员，不处理
			default:
				logger.Error("无法创建初始管理员", "error", err)
				return
			}
		default:
			logger.Error("无法创建初始管理员", "error", err)
			return
		}
	}

	/**********************************************
	 * 连接 rabbitmq
	 **********************************************/
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

	/**********************************************
	 * 连接 redis
	 **********************************************/
	rdb := redis.NewClient(&redis.Options{
		Addr:     fmt.Sprintf("%s:%d", cfg.Redis.Host, cfg.Redis.Port),
		Password: cfg.Redis.Password,
		DB:       0,
	})

	/**********************************************
	 * 创建 handler
	 **********************************************/
	handler, err := handler.NewHandler(cfg, repo, ch, rdb)
	if err != nil {
		logger.Error("无法创建 handler", "error", err)
		return
	}
	handler.RegisterRoutes()

	/**********************************************
	 * 启动 HTTP 服务器
	 **********************************************/
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
