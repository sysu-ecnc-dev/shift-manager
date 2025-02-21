package handler

import (
	"github.com/go-chi/chi/v5"
	"github.com/go-playground/locales/zh"
	ut "github.com/go-playground/universal-translator"
	"github.com/go-playground/validator/v10"
	zh_translations "github.com/go-playground/validator/v10/translations/zh"
	amqp "github.com/rabbitmq/amqp091-go"
	"github.com/redis/go-redis/v9"
	"github.com/sysu-ecnc-dev/shift-manager/backend/internal/config"
	"github.com/sysu-ecnc-dev/shift-manager/backend/internal/domain"
	"github.com/sysu-ecnc-dev/shift-manager/backend/internal/repository"
)

type Handler struct {
	validate    *validator.Validate
	config      *config.Config
	repository  *repository.Repository
	translator  ut.Translator
	mailChannel *amqp.Channel
	redisClient *redis.Client

	Mux *chi.Mux
}

func NewHandler(cfg *config.Config, repo *repository.Repository, mailCh *amqp.Channel, rdb *redis.Client) (*Handler, error) {
	validate := validator.New(validator.WithRequiredStructEnabled())
	zh := zh.New()
	uni := ut.New(zh, zh)
	trans, _ := uni.GetTranslator("zh")
	if err := zh_translations.RegisterDefaultTranslations(validate, trans); err != nil {
		return nil, err
	}

	return &Handler{
		validate:    validate,
		config:      cfg,
		repository:  repo,
		translator:  trans,
		mailChannel: mailCh,
		redisClient: rdb,

		Mux: chi.NewRouter(),
	}, nil
}

func (h *Handler) RegisterRoutes() {
	h.Mux.Use(h.logger)
	h.Mux.Use(h.recoverer)

	// 认证相关
	h.Mux.Route("/auth", func(r chi.Router) {
		r.Post("/login", h.Login)
		r.Post("/logout", h.Logout)
		r.Route("/reset-password", func(r chi.Router) {
			r.Post("/require", h.RequireResetPassword)
			r.Post("/confirm", h.ConfirmResetPassword)
		})
	})

	// 以下 API 必须要在登录后才允许调用
	h.Mux.Group(func(r chi.Router) {
		r.Use(h.auth)
		r.Route("/my-info", func(r chi.Router) {
			r.Use(h.myInfo)
			r.Get("/", h.GetMyInfo)
			r.Patch("/password", h.UpdateMyPassword)
			r.Route("/update-email", func(r chi.Router) {
				r.Post("/require", h.RequireUpdateEmail)
				r.Post("/confirm", h.ConfirmUpdateEmail)
			})
		})

		r.Route("/users", func(r chi.Router) {
			r.With(h.RequiredRole([]domain.Role{domain.RoleBlackCore})).Post("/", h.CreateUser)
			r.Get("/", h.GetAllUserInfo) // 所有助理应该都有权限获取其他人的个人信息
			r.Route("/{id}", func(r chi.Router) {
				r.Use(h.userInfo)
				r.Get("/", h.GetUserInfo)
				r.With(h.preventOperateInitialAdmin).With(h.RequiredRole([]domain.Role{domain.RoleBlackCore})).Patch("/", h.UpdateUser)
				r.With(h.preventOperateInitialAdmin).With(h.RequiredRole([]domain.Role{domain.RoleBlackCore})).Delete("/", h.DeleteUser)
				r.With(h.RequiredRole([]domain.Role{domain.RoleBlackCore})).Patch("/password", h.UpdateUserPassword)
			})
		})

		r.Route("/schedule-templates", func(r chi.Router) {
			r.With(h.RequiredRole([]domain.Role{domain.RoleBlackCore})).Post("/", h.CreateScheduleTemplate)
			r.Get("/", h.GetAllScheduleTemplates)
			r.Route("/{id}", func(r chi.Router) {
				r.Use(h.scheduleTemplate)
				r.Get("/", h.GetScheduleTemplate)
				r.With(h.RequiredRole([]domain.Role{domain.RoleBlackCore})).Patch("/", h.UpdateScheduleTemplate)
				r.With(h.RequiredRole([]domain.Role{domain.RoleBlackCore})).Delete("/", h.DeleteScheduleTemplate)
			})
		})

		r.Route("/schedule-plans", func(r chi.Router) {
			r.With(h.RequiredRole([]domain.Role{domain.RoleBlackCore})).Post("/", h.CreateSchedulePlan)
			r.Get("/", h.GetAllSchedulePlans)
			r.Route("/{option}", func(r chi.Router) {
				r.Use(h.schedulePlan)
				r.Get("/", h.GetSchedulePlanByID)
				r.With(h.RequiredRole([]domain.Role{domain.RoleBlackCore})).Patch("/", h.UpdateSchedulePlan)
				r.With(h.RequiredRole([]domain.Role{domain.RoleBlackCore})).Delete("/", h.DeleteSchedulePlan)
				r.Route("/your-submission", func(r chi.Router) {
					r.Use(h.myInfo)
					r.Use(h.preventLeavedAssistant)
					r.Use(h.preventSubmit2unavailableSchedulePlan)
					r.Post("/", h.SubmitYourAvailability)
					r.Get("/", h.GetYourAvailabilitySubmission)
				})
				r.With(h.RequiredRole([]domain.Role{domain.RoleBlackCore})).Get("/submissions", h.GetSchedulePlanSubmissions) // 只有黑心能够获取所有的提交情况，防止泄露信息
				r.Route("/scheduling-result", func(r chi.Router) {
					r.Use(h.RequiredRole([]domain.Role{domain.RoleBlackCore}))
					r.Post("/", h.SubmitSchedulingResult)
					r.Get("/", h.GetSchedulingResult)
					r.Post("/generate", h.GenerateSchedulingResult)
				})
			})
		})
	})
}
