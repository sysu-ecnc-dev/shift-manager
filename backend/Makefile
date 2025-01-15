# migration
DSN = postgres://postgres:${DATABASE_PASSWORD}@localhost:5432/shift_manager_db?sslmode=disable

new_migration:
	migrate create -seq -ext=.sql -dir=./migrations ${name}

migrate_up:
	migrate -path ./migrations -database ${DSN} up ${step}

migrate_down:
	migrate -path ./migrations -database ${DSN} down ${step}

migration_version:
	migrate -path ./migrations -database ${DSN} version

set_migration_version:
	migrate -path ./migrations -database ${DSN} force ${version}

# seed
seed:
	go run cmd/seed/main.go -op=${op} -n=${n}