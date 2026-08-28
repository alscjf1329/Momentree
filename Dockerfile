FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# NEXT_PUBLIC_* 값은 런타임이 아니라 빌드 타임에 번들에 박히므로 build-arg로 전달받음
ARG NEXT_PUBLIC_KAKAO_MAP_KEY
ENV NEXT_PUBLIC_KAKAO_MAP_KEY=$NEXT_PUBLIC_KAKAO_MAP_KEY
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# 호스트(sheepduck, uid/gid 1000)와 맞춰야 바인드 마운트한 데이터 디렉터리에 쓰기 가능
RUN addgroup -g 1000 -S nodejs && adduser -S nextjs -u 1000 -G nodejs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 고객 데이터 / RSVP 데이터 / 업로드 파일 디렉터리
RUN mkdir -p data/clients data/rsvp data/uploads/images data/uploads/audio && chown -R nextjs:nodejs data

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
