# Используем официальный Node.js образ
FROM node:20-alpine AS base

# Устанавливаем pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# ===== DEPENDENCIES =====
FROM base AS deps

# Устанавливаем только production зависимости
RUN pnpm install --frozen-lockfile --prod

# Устанавливаем все зависимости (для сборки)
RUN pnpm install --frozen-lockfile

# ===== BUILDER =====
FROM base AS builder

# Копируем node_modules из deps
COPY --from=deps /app/node_modules ./node_modules

# Копируем исходный код
COPY . .

# Переменные окружения для сборки (можно переопределить через --build-arg)
ARG NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}

# Отключаем телеметрию Next.js
ENV NEXT_TELEMETRY_DISABLED=1

# Собираем приложение
RUN pnpm run build

# ===== RUNNER =====
FROM node:20-alpine AS runner

WORKDIR /app

# Создаем пользователя для запуска приложения
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Копируем только необходимые файлы для production
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Переключаемся на непривилегированного пользователя
USER nextjs

# Открываем порт
EXPOSE 3004

# Переменные окружения
ENV PORT=3004
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Healthcheck для Docker/Kubernetes
# Returns 200 even if dependencies are down, but includes status field
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3004/api/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# Запускаем приложение
CMD ["node", "server.js"]

