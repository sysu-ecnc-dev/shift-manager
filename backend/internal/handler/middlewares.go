package handler

import (
	"fmt"
	"log/slog"
	"net/http"
	"time"
)

type ResponseWriter struct {
	http.ResponseWriter
	StatusCode int
}

func (rw *ResponseWriter) WriteHeader(statusCode int) {
	rw.StatusCode = statusCode
	rw.ResponseWriter.WriteHeader(statusCode)
}

func (h *Handler) logger(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		rw := &ResponseWriter{ResponseWriter: w}
		next.ServeHTTP(rw, r)
		duration := time.Since(start)
		slog.Info("已处理请求", "status", rw.StatusCode, "ip", r.RemoteAddr, "method", r.Method, "path", r.URL.Path, "duration", duration)
	})
}

func (h *Handler) recoverer(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if err := recover(); err != nil {
				h.internalServerError(w, r, fmt.Errorf("panic: %v", err))
			}
		}()
		next.ServeHTTP(w, r)
	})
}
