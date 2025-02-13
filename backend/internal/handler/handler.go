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

	h.Mux.Route("/auth", func(r chi.Router) {
		r.Post("/login", h.Login)
		r.Post("/logout", h.Logout)
		r.Route("/reset-password", func(r chi.Router) {
			r.Post("/require", h.RequestResetPassword)
			r.Post("/confirm", h.ResetPassword)
		})
	})

	h.Mux.Group(func(r chi.Router) {
		r.Use(h.auth)
		r.Route("/my-info", func(r chi.Router) {
			r.Use(h.myInfo)
			r.Get("/", h.GetMyInfo)
			r.Patch("/password", h.UpdateMyPassword)
			r.Route("/change-email", func(r chi.Router) {
				r.Post("/require", h.RequireChangeEmail)
				r.Post("/confirm", h.VerifyOTPAndChangeEmail)
			})
		})

		r.Route("/users", func(r chi.Router) {
			r.Use(h.RequiredRole([]domain.Role{domain.RoleBlackCore}))
			r.Get("/", h.GetAllUsers)
			r.Post("/", h.CreateUser)
			r.Route("/{id}", func(r chi.Router) {
				r.Use(h.userInfo)
				r.Get("/", h.GetUserInfo)
				r.With(h.preventOperateInitialAdmin).Patch("/", h.UpdateUser)
				r.With(h.preventOperateInitialAdmin).Delete("/", h.DeleteUser)
			})
		})

		r.Route("/schedule-template-meta", func(r chi.Router) {
			r.Use(h.RequiredRole([]domain.Role{domain.RoleBlackCore}))
			r.Get("/", h.GetAllScheduleTemplateMeta)
			r.Route("/{id}", func(r chi.Router) {
				r.Use(h.scheduleTemplateMeta)
				r.Get("/", h.GetScheduleTemplateMeta)
				r.Patch("/", h.UpdateScheduleTemplateMeta)
				r.Delete("/", h.DeleteScheduleTemplateMeta)
			})
		})

		r.Route("/schedule-templates", func(r chi.Router) {
			r.Use(h.RequiredRole([]domain.Role{domain.RoleBlackCore}))
			r.Post("/", h.CreateScheduleTemplate)
			r.Route("/{id}", func(r chi.Router) {
				r.Use(h.scheduleTemplate)
				r.Get("/", h.GetScheduleTemplate)
			})
		})

		r.Route("/schedule-plans", func(r chi.Router) {
			r.With(h.RequiredRole([]domain.Role{domain.RoleBlackCore})).Post("/", h.CreateSchedulePlan)
			r.Get("/", h.GetAllSchedulePlans)
			r.Route("/{id}", func(r chi.Router) {
				r.Use(h.schedulePlan)
				r.Get("/", h.GetSchedulePlanByID)
				r.With(h.RequiredRole([]domain.Role{domain.RoleBlackCore})).Patch("/", h.UpdateSchedulePlan)
				r.With(h.RequiredRole([]domain.Role{domain.RoleBlackCore})).Delete("/", h.DeleteSchedulePlan)
			})
		})

		r.Route("/latest-available-schedule-plan", func(r chi.Router) {
			r.Use(h.myInfo)
			r.Use(h.preventSeparatedAssistant)
			r.Use(h.latestSubmissionAvailablePlan)
			r.Get("/", h.GetLatestSubmissionAvailablePlan)
			r.Post("/submit-availability", h.SubmitAvailability)
		})
	})
}
