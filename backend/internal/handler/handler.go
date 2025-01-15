package handler

import (
	"github.com/go-chi/chi/v5"
	"github.com/go-playground/locales/zh"
	ut "github.com/go-playground/universal-translator"
	"github.com/go-playground/validator/v10"
	zh_translations "github.com/go-playground/validator/v10/translations/zh"
	"github.com/sysu-ecnc-dev/shift-manager/backend/internal/config"
	"github.com/sysu-ecnc-dev/shift-manager/backend/internal/repository"
)

type Handler struct {
	validate   *validator.Validate
	config     *config.Config
	repository *repository.Repository
	translator ut.Translator

	Mux *chi.Mux
}

func NewHandler(cfg *config.Config, repo *repository.Repository) (*Handler, error) {
	validate := validator.New(validator.WithRequiredStructEnabled())
	zh := zh.New()
	uni := ut.New(zh, zh)
	trans, _ := uni.GetTranslator("zh")
	if err := zh_translations.RegisterDefaultTranslations(validate, trans); err != nil {
		return nil, err
	}

	return &Handler{
		validate:   validate,
		config:     cfg,
		repository: repo,
		translator: trans,

		Mux: chi.NewRouter(),
	}, nil
}

func (h *Handler) RegisterRoutes() {
	h.Mux.Use(h.logger)
	h.Mux.Use(h.recoverer)

	h.Mux.Route("/auth", func(r chi.Router) {
		r.Post("/login", h.Login)
		r.Post("/logout", h.Logout)
	})

	h.Mux.Group(func(r chi.Router) {
		r.Use(h.auth)
		r.Route("/my-info", func(r chi.Router) {
			r.Use(h.myInfo)
			r.Get("/", h.GetMyInfo)
			r.Patch("/password", h.UpdateMyPassword)
		})

		r.Route("/users", func(r chi.Router) {
			r.Get("/", h.GetAllUsers)
		})
	})
}
