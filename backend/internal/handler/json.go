package handler

import (
	"encoding/json"
	"log/slog"
	"net/http"

	"github.com/go-playground/validator/v10"
)

func (h *Handler) logInternalServerError(r *http.Request, err error) {
	slog.Error("服务器内部错误", "method", r.Method, "path", r.URL.Path, "error", err)
}

func (h *Handler) readJSON(r *http.Request, v any) error {
	return json.NewDecoder(r.Body).Decode(v)
}

func (h *Handler) writeJSON(w http.ResponseWriter, r *http.Request, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)

	if err := json.NewEncoder(w).Encode(v); err != nil {
		h.logInternalServerError(r, err)
		http.Error(w, "服务器内部错误", http.StatusInternalServerError)
	}
}

type Response struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Data    any    `json:"data"`
}

func (h *Handler) errorResponse(w http.ResponseWriter, r *http.Request, msg string) {
	h.writeJSON(w, r, http.StatusOK, Response{
		Success: false,
		Message: msg,
		Data:    nil,
	})
}

func (h *Handler) badRequest(w http.ResponseWriter, r *http.Request, err error) {
	validationErrors, ok := err.(validator.ValidationErrors)
	if !ok {
		h.errorResponse(w, r, err.Error())
		return
	}

	h.errorResponse(w, r, validationErrors[0].Translate(h.translator))
}

func (h *Handler) internalServerError(w http.ResponseWriter, r *http.Request, err error) {
	h.logInternalServerError(r, err)
	h.writeJSON(w, r, http.StatusInternalServerError, Response{
		Success: false,
		Message: "服务器内部错误",
		Data:    nil,
	})
}

func (h *Handler) successResponse(w http.ResponseWriter, r *http.Request, msg string, data any) {
	h.writeJSON(w, r, http.StatusOK, Response{
		Success: true,
		Message: msg,
		Data:    data,
	})
}
