FROM golang:1.23-alpine AS builder
WORKDIR /app
COPY . .
RUN GOPROXY=https://goproxy.cn,direct && \
    CGO_ENABLED=0  && \
    GOOS=linux && \
    go mod download && \
    go build -o /app/bin/api ./cmd/api/main.go && \
    go build -o /app/bin/mail ./cmd/mail/main.go

FROM alpine:latest AS backend
WORKDIR /app
COPY --from=builder \
     /app/migrations /app/ \
     /app/templates /app/ \
     /app/run.sh /app/ \
     /app/bin/* /app/
RUN chmod +x run.sh
EXPOSE 3000
CMD ["/app/run.sh"]
