# syntax=docker/dockerfile:1
# Next.js 15 storefront — üretim imajı (standalone çıktı).

# ---- 1) Derleme aşaması -------------------------------------------------------
FROM node:20-slim AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# DİKKAT: NEXT_PUBLIC_* değişkenleri tarayıcıya gömülür ve BUILD anında sabitlenir.
# Bu yüzden gerçek değerleri build-arg olarak geçmek ZORUNLU (runtime'da değişmez).
ARG NEXT_PUBLIC_MEDUSA_BACKEND_URL
ARG NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_BASE_URL
ARG NEXT_PUBLIC_DEFAULT_REGION=tr
ENV NEXT_PUBLIC_MEDUSA_BACKEND_URL=$NEXT_PUBLIC_MEDUSA_BACKEND_URL \
    NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=$NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY \
    NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL \
    NEXT_PUBLIC_DEFAULT_REGION=$NEXT_PUBLIC_DEFAULT_REGION \
    NODE_ENV=production

RUN npm run build

# ---- 2) Çalışma aşaması -------------------------------------------------------
FROM node:20-slim AS runner
ENV NODE_ENV=production
ENV PORT=8000
# Next standalone server'ı varsayılan olarak localhost'a bağlanır; Docker'da
# diğer container'ların (nginx) erişebilmesi için 0.0.0.0'a bağlanmalı.
ENV HOSTNAME=0.0.0.0
WORKDIR /app

# Standalone çıktı: minimal server.js + sadece gereken node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 8000
CMD ["node", "server.js"]
