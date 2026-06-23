#!/usr/bin/env sh
# 대시보드 빌드 + Cloudflare Pages 배포 (무인/headless).
# 인증은 .cloudflare.env 의 CLOUDFLARE_API_TOKEN 으로 한다(브라우저 로그인 불필요).
# 토큰이 없으면 기존 wrangler OAuth 로그인으로 폴백한다.
set -e
cd "$(dirname "$0")"

# 로컬 전용 비밀 파일(gitignore) — 있으면 필요한 키만 로드.
# source를 쓰면 잘못된 "export" 줄 하나로 환경 전체가 출력될 수 있어 파싱한다.
if [ -f .cloudflare.env ]; then
  CLOUDFLARE_ACCOUNT_ID="$(
    sed -n 's/^[[:space:]]*export[[:space:]]\{1,\}CLOUDFLARE_ACCOUNT_ID=//p; s/^[[:space:]]*CLOUDFLARE_ACCOUNT_ID=//p' .cloudflare.env | tail -n 1 | sed 's/^"//; s/"$//'
  )"
  CLOUDFLARE_API_TOKEN="$(
    sed -n 's/^[[:space:]]*export[[:space:]]\{1,\}CLOUDFLARE_API_TOKEN=//p; s/^[[:space:]]*CLOUDFLARE_API_TOKEN=//p' .cloudflare.env | tail -n 1 | sed 's/^"//; s/"$//'
  )"
  export CLOUDFLARE_ACCOUNT_ID CLOUDFLARE_API_TOKEN
fi

node generate.mjs
npx wrangler pages deploy dist \
  --project-name "$(cat .pages-project)" \
  --commit-dirty=true
