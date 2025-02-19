# 启动开发服务
.PHONY: dev-api
dev-api:
	air -c api.air.toml

.PHONY: dev-mail
dev-mail:
	air -c mail.air.toml

# 数据库迁移
.PHONY: new-migration
new-migration:
	goose -s create $(name) sql

.PHONY: migrate-up
migrate-up:
	goose up

.PHONY: migrate-down
migrate-down:
	goose down

# 插入数据
seed-users:
	go run cmd/seed/main.go -op 1 -n $(n)

seed-schedule-templates:
	go run cmd/seed/main.go -op 2 -n $(n)

seed-schedule-plans:
	go run cmd/seed/main.go -op 3 -n $(n)

