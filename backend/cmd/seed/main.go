package main

import (
	"context"
	"flag"
	"log/slog"
	"os"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/sysu-ecnc-dev/shift-manager/backend/internal/config"
	"github.com/sysu-ecnc-dev/shift-manager/backend/internal/repository"
	"github.com/sysu-ecnc-dev/shift-manager/backend/internal/utils"
)

func main() {
	var op int
	var n int

	flag.IntVar(&op, "op", 0, "要执行的操作 (1: 插入随机用户)")
	flag.IntVar(&n, "n", 0, "要插入的记录数量")
	flag.Parse()

	logger := slog.New(slog.NewTextHandler(os.Stdout, nil))

	// 读取配置文件
	cfg, err := config.LoadConfig()
	if err != nil {
		logger.Error("无法读取配置文件", slog.String("error", err.Error()))
		os.Exit(1)
	}

	// 连接数据库
	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(cfg.Database.ConnectTimeout)*time.Second)
	defer cancel()

	dbpool, err := pgxpool.New(ctx, cfg.Database.DSN)
	if err != nil {
		logger.Error("无法创建数据库连接", slog.String("error", err.Error()))
		os.Exit(1)
	}
	defer dbpool.Close()

	if err := dbpool.Ping(ctx); err != nil {
		logger.Error("无法连接到数据库", slog.String("error", err.Error()))
		os.Exit(1)
	}

	repo := repository.NewRepository(dbpool)

	// 执行操作
	switch op {
	case 0:
		slog.Error("未指定操作")
	case 1:
		if n == 0 {
			slog.Error("未指定要插入的用户数量")
		} else if n < 0 {
			slog.Error("要插入的用户数量不能为负")
		} else {
			cnt := n
			for i := 0; i < n; i++ {
				user, err := utils.GenerateRandomUser(cfg.Seed.UserPassword, cfg.Email.UserDomain)
				if err != nil {
					slog.Error("无法生成随机用户", slog.String("error", err.Error()))
					continue
				}

				ctx, cancel = context.WithTimeout(context.Background(), time.Duration(cfg.Database.QueryTimeout)*time.Second)
				defer cancel()

				if err := repo.CreateUser(ctx, user); err != nil {
					slog.Error("无法插入用户", slog.String("error", err.Error()))
					continue
				}

				cnt--
			}

			slog.Info("插入用户成功", slog.Int("count", n-cnt))
		}
	default:
		slog.Error("指定的操作非法")
	}
}
