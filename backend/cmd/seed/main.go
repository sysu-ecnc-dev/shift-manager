package main

import (
	"context"
	"database/sql"
	"flag"
	"log/slog"
	"os"
	"time"

	"github.com/sysu-ecnc-dev/shift-manager/backend/internal/config"
	"github.com/sysu-ecnc-dev/shift-manager/backend/internal/repository"
	"github.com/sysu-ecnc-dev/shift-manager/backend/internal/utils"

	_ "github.com/jackc/pgx/v5/stdlib"
)

func main() {
	var op int
	var n int

	flag.IntVar(&op, "op", 0, "要执行的操作 (1: 插入随机用户, 2: 插入随机班表模板, 3: 插入随机排班计划)")
	flag.IntVar(&n, "n", 0, "要插入的记录数量")
	flag.Parse()

	logger := slog.New(slog.NewTextHandler(os.Stdout, nil))

	// 读取配置文件
	cfg, err := config.LoadConfig()
	if err != nil {
		logger.Error("无法读取配置文件", slog.String("error", err.Error()))
		os.Exit(1)
	}

	// 创建数据库连接池
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

	// 创建 repository
	repo := repository.NewRepository(cfg, dbpool)

	// 执行操作
	switch op {
	case 0:
		slog.Error("未指定操作")
	case 1:
		if n <= 0 {
			slog.Error("请输入合法的用户数量")
		} else {
			cnt := n
			for i := 0; i < n; i++ {
				user, err := utils.GenerateRandomUser(cfg.Seed.User.Password, cfg.Email.UserDomain)
				if err != nil {
					slog.Error("无法生成随机用户", slog.String("error", err.Error()))
					continue
				}

				if err := repo.CreateUser(user); err != nil {
					slog.Error("无法插入用户", slog.String("error", err.Error()))
					continue
				}

				cnt--
			}

			slog.Info("插入用户成功", slog.Int("count", n-cnt))
		}
	case 2:
		if n <= 0 {
			slog.Error("请输入合法的班表模板数量")
		} else {
			cnt := n
			for i := 0; i < n; i++ {
				st := utils.GenerateRandomScheduleTemplate()
				if err := repo.CreateScheduleTemplate(st); err != nil {
					slog.Error("无法插入班表模板", slog.String("error", err.Error()))
					continue
				}

				cnt--
			}

			slog.Info("插入班表模板成功", slog.Int("count", n-cnt))
		}
	case 3:
		if n <= 0 {
			slog.Error("请输入合法的排班计划数量")
		} else {
			cnt := n
			for i := 0; i < n; i++ {
				plan := utils.GenerateRandomSchedulePlan()
				if err := repo.InsertSchedulePlan(plan); err != nil {
					slog.Error("无法插入排班计划", slog.String("error", err.Error()))
					continue
				}

				cnt--
			}

			slog.Info("插入排班计划成功", slog.Int("count", n-cnt))
		}
	default:
		slog.Error("指定的操作非法")
	}
}
