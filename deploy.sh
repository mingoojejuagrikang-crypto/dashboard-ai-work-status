#!/usr/bin/env sh
# 대시보드 빌드 + Cloudflare Pages 배포 (무인/headless).
# 인증은 .cloudflare.env 의 CLOUDFLARE_API_TOKEN 으로 한다(브라우저 로그인 불필요).
# 토큰이 없으면 기존 wrangler OAuth 로그인으로 폴백한다.
set -e
cd "$(dirname "$0")"

# 로컬 전용 비밀 파일(gitignore) — 있으면 환경변수로 로드.
if [ -f .cloudflare.env ]; then
  . ./.cloudflare.env
fi

node generate.mjs
npx wrangler pages deploy dist \
  --project-name "$(cat .pages-project)" \
  --commit-dirty=true
