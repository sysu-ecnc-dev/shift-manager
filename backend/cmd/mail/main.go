package main

import (
	"context"
	"encoding/gob"
	"encoding/json"
	"html/template"
	"log/slog"
	"os"
	"os/signal"
	"sync"
	"syscall"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
	"github.com/sysu-ecnc-dev/shift-manager/backend/internal/config"
	"github.com/sysu-ecnc-dev/shift-manager/backend/internal/domain"
	"github.com/wneessen/go-mail"
)

func main() {
	/**********************************************
	 * 创建 logger
	 **********************************************/
	logger := slog.New(slog.NewTextHandler(os.Stdout, nil))

	/**********************************************
	 * 读取配置文件
	 **********************************************/
	cfg, err := config.LoadConfig()
	if err != nil {
		logger.Error("无法读取配置文件", slog.String("error", err.Error()))
		return
	}

	/**********************************************
	 * 创建邮件客户端
	 **********************************************/
	client, err := mail.NewClient(cfg.Email.SMTP.Host,
		mail.WithSMTPAuth(mail.SMTPAuthPlain),
		mail.WithSSL(),
		mail.WithPort(cfg.Email.SMTP.Port),
		mail.WithUsername(cfg.Email.SMTP.Username),
		mail.WithPassword(cfg.Email.SMTP.Password),
	)
	if err != nil {
		logger.Error("无法创建邮件客户端", slog.String("error", err.Error()))
		return
	}
	defer client.Close()

	// 验证邮件客户端是否连接成功
	clientDialCtx, cancel := context.WithTimeout(context.Background(), time.Duration(cfg.Email.SMTP.DialTimeout)*time.Second)
	defer cancel()
	if err := client.DialWithContext(clientDialCtx); err != nil {
		logger.Error("无法连接到邮件服务器", slog.String("error", err.Error()))
		return
	}

	// 令 gob 注册 mail.Msg 类型，方便后续的解码
	gob.Register(mail.NewMsg())

	/**********************************************
	 * 连接 RabbitMQ
	 **********************************************/
	conn, err := amqp.Dial(cfg.RabbitMQ.DSN)
	if err != nil {
		logger.Error("无法连接到 RabbitMQ", slog.String("error", err.Error()))
		return
	}
	defer conn.Close()

	// 创建通道
	ch, err := conn.Channel()
	if err != nil {
		logger.Error("无法创建通道", slog.String("error", err.Error()))
		return
	}
	defer ch.Close()

	// 声明队列
	q, err := ch.QueueDeclare(
		"email_queue", // 队列名称
		true,          // 是否持久化
		false,         // 是否自动删除，设置为 false 可以避免没有消费者的时候自动删除队列
		false,         // 是否独占，即是否允许多个消费者访问这个队列
		false,         // 是否不等待，设置为 false，即等待 RabbitMQ 确认队列是否创建成功
		nil,           // 额外参数
	)
	if err != nil {
		logger.Error("无法声明队列", slog.String("error", err.Error()))
		return
	}

	// 监听 CTRL+C
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)

	// 消费消息
	msgs, err := ch.Consume(
		q.Name, // 队列
		"",     // 消费者标识，设置为空字符串，表示由 RabbitMQ 自动分配
		false,  // 是否自动去仍消息
		false,  // 是否独占队列
		false,  // 是否禁止消费者接受自己发送的消息，必须设置为 false，因为 RabbitMQ 不支持这个参数
		false,  // 是否不等待，等待 RabbitMQ 响应
		nil,    // 额外参数
	)
	if err != nil {
		logger.Error("无法消费消息", slog.String("error", err.Error()))
		os.Exit(1)
	}

	// 用于关闭 goroutine 的上下文
	ctx, cancel := context.WithCancel(context.Background())
	wg := sync.WaitGroup{}

	wg.Add(1)
	go func() {
		defer wg.Done()
		for {
			select {
			case <-ctx.Done():
				return
			case msg := <-msgs:
				logger.Info("收到消息", slog.String("message", string(msg.Body)))
				// 对邮件信息反序列化
				mailMessage := domain.MailMessage{}
				if err := json.Unmarshal(msg.Body, &mailMessage); err != nil {
					logger.Error("邮件信息反序列化失败", slog.String("error", err.Error()))
					_ = msg.Nack(false, false)
					continue
				}

				// 构建邮件
				mail := mail.NewMsg()
				if err := mail.From(cfg.Email.SMTP.Username); err != nil {
					logger.Error("无法设置邮件发件人", slog.String("error", err.Error()))
					_ = msg.Nack(false, false)
					continue
				}
				if err := mail.To(mailMessage.To); err != nil {
					logger.Error("无法设置邮件收件人", slog.String("error", err.Error()))
					_ = msg.Nack(false, false)
					continue
				}

				// 根据邮件类型解析数据
				switch mailMessage.Type {
				case "create_user":
					tmpl, err := template.ParseFiles("./templates/new_account_email.html")
					if err != nil {
						logger.Error("无法解析邮件模板", slog.String("error", err.Error()))
						_ = msg.Nack(false, false)
						continue
					}
					if err := mail.SetBodyHTMLTemplate(tmpl, mailMessage.Data); err != nil {
						logger.Error("无法设置邮件正文", slog.String("error", err.Error()))
						_ = msg.Nack(false, false)
						continue
					}
					mail.Subject("ECNC 假勤系统 - 账户信息")
				case "reset_password":
					tmpl, err := template.ParseFiles("./templates/reset_password_otp_email.html")
					if err != nil {
						logger.Error("无法解析邮件模板", slog.String("error", err.Error()))
						_ = msg.Nack(false, false)
						continue
					}
					if err := mail.SetBodyHTMLTemplate(tmpl, mailMessage.Data); err != nil {
						logger.Error("无法设置邮件正文", slog.String("error", err.Error()))
						_ = msg.Nack(false, false)
						continue
					}
					mail.Subject("ECNC 假勤系统 - 重置密码")
				case "change_email":
					tmpl, err := template.ParseFiles("./templates/change_email_email.html")
					if err != nil {
						logger.Error("无法解析邮件模板", slog.String("error", err.Error()))
						_ = msg.Nack(false, false)
						continue
					}
					if err := mail.SetBodyHTMLTemplate(tmpl, mailMessage.Data); err != nil {
						logger.Error("无法设置邮件正文", slog.String("error", err.Error()))
						_ = msg.Nack(false, false)
						continue
					}
					mail.Subject("ECNC 假勤系统 - 修改邮箱")
				default:
					logger.Error("不支持的邮件类型", slog.String("type", mailMessage.Type))
					_ = msg.Nack(false, false)
					continue
				}

				// 发送邮件
				if err := client.DialAndSend(mail); err != nil {
					logger.Error("邮件发送失败", slog.String("error", err.Error()))
					_ = msg.Nack(false, true) // 将消息重新入队
					continue
				}

				// 确认消息
				_ = msg.Ack(false)
			}
		}
	}()

	// 等待 CTRL+C 信号
	logger.Info("等待消息...（按 CTRL+C 退出）")
	<-sigChan

	// 优雅退出
	slog.Info("正在关闭 mail worker...")
	cancel()
	wg.Wait() // 等待所有 goroutine 完成
	slog.Info("mail worker 已成功关闭")
}
