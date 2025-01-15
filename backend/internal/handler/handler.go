package handler

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/sysu-ecnc-dev/shift-manager/backend/internal/config"
	"github.com/sysu-ecnc-dev/shift-manager/backend/internal/repository"
)

type Handler struct {
	config     *config.Config
	Mux        *chi.Mux
	repository *repository.Repository
}

func NewHandler(cfg *config.Config, repo *repository.Repository) *Handler {
	return &Handler{
		config:     cfg,
		Mux:        chi.NewRouter(),
		repository: repo,
	}
}

func (h *Handler) RegisterRoutes() {
	h.Mux.Use(logger)
	h.Mux.Get("/", func(w http.ResponseWriter, r *http.Request) {
		_, _ = w.Write([]byte("Hello, World!"))
	})
}
