FROM node:22-slim AS builder

RUN corepack enable

WORKDIR /app

COPY pnpm-lock.yaml .
RUN pnpm fetch --prod

COPY . .
RUN pnpm run build

FROM nginx:1-alpine AS deploy

COPY --from=builder /app/dist /usr/share/nginx/html
