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

# node:alpine 베이스 이미지에 이미 uid/gid 1000인 node 유저가 있고, 호스트(sheepduck)도
# uid/gid 1000이라 그대로 재사용 — 바인드 마운트한 데이터 디렉터리에 쓰기 가능해짐

COPY --from=builder /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

# 고객 데이터 / RSVP 데이터 / 업로드 파일 디렉터리
RUN mkdir -p data/clients data/rsvp data/uploads/images data/uploads/audio && chown -R node:node data

USER node
EXPOSE 3000
CMD ["node", "server.js"]
