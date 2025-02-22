FROM golang:1.23-alpine

RUN go install github.com/pressly/goose/v3/cmd/goose@latest
RUN ln -s $(go env GOPATH)/bin/goose /usr/local/bin/goose

RUN ls -l /usr/local/bin/ && ls -l $(go env GOPATH)/bin/

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o /app/bin/api ./cmd/api/main.go
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/bin/mail ./cmd/mail/main.go

