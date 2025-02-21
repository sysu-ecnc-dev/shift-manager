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

# 插入随机数据
.PHONY: seed-users
seed-users:
	go run cmd/seed/main.go -op 1 -n $(filter-out $@,$(MAKECMDGOALS))

.PHONY: seed-schedule-templates
seed-schedule-templates:
	go run cmd/seed/main.go -op 2 -n $(filter-out $@,$(MAKECMDGOALS))

.PHONY: seed-schedule-plans
seed-schedule-plans:
	go run cmd/seed/main.go -op 3 -n $(filter-out $@,$(MAKECMDGOALS))

.PHONY: seed-submissions
seed-submissions:
	go run cmd/seed/main.go -op 4 -schedule-plan-id $(filter-out $@,$(MAKECMDGOALS))

.PHONY: seed-real-data
seed-real-data:
	go run cmd/seed/main.go -op 5

# 避免 make 误报 "No rule to make target"
%:
	@: