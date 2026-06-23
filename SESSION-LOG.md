# 대시보드_AI_작업현황 — 세션 로그

> 이 프로젝트(작업 대시보드) 전용 세션 기록. **survey-011 등 다른 프로젝트의 세션 로그는 볼트
> `Team Knowledge/session-logs/`에 따로 있다 — 여기와 섞지 않는다.** 대시보드 작업 흔적은 이 파일에만.

---

## 2026-06-23 · 정보구조 개선 + GitHub 공개 준비

### 무엇을 바꿨나
- 대시보드 화면 타이틀을 **대시보드_AI_작업현황**으로 변경.
- 홈 상단에 프로젝트 필터 도입: `전체`, `survey-011`, `팀 운영`.
- 홈 렌더링을 고정 `grid-area`에서 카드 배열 + size class 방식으로 전환.
- `selectedProjects()`, `scopedOpen()`, `scopedSessions()`, `scopedTodos()`, `scopedUpdates()`, `scopedDeliverables()` 계열 helper 추가.
- 홈 카드 구성을 실행 상태 중심으로 재정리:
  - 지금 이어받을 작업
  - 업데이트 내역
  - 미해결 / 검증 대기
  - TODO 진행
  - 최근 활동
  - 프로젝트 상태
  - 산출물
- 상세 화면을 카드별로 분리하고, 홈의 큰 숫자 요약 반복을 줄임.
- 상세 진입 시 `history.pushState`, 브라우저 뒤로가기 시 `popstate`로 홈 복귀 지원.
- `localStorage` 접근을 `try/catch`로 감싸 `file://` fallback에서도 렌더가 깨지지 않게 함.
- `npm run serve`가 현재 Node에서 실패하던 문제 수정(`--watch-path` + `-e` 조합 제거).
- GitHub 공개 인수인계를 위해 `AI_HANDOFF.md`, `LESSONS_AND_NEXT_STEPS.md`, `CHANGELOG.md` 추가.
- `dist/data.json`을 GitHub에도 포함하도록 `.gitignore`에서 제외 항목 제거. 대신 `.cloudflare.env`, `.env*`, `.wrangler/`, `.DS_Store`는 계속 제외.

### 검증
- `npm run build` 통과.
- `npm run serve` 정상 실행: `http://127.0.0.1:8899`.
- Chrome DevTools Protocol 기반 자동 확인:
  - 390×844, 1280×800, 1440×900 홈 무스크롤.
  - 전체/survey-011/팀 운영 필터 스코프 정상.
  - 최신 업데이트 `survey-011 v0.17.0 · 2026-06-23` 우선 노출.
  - 상세 진입, 홈 버튼 복귀, 브라우저 뒤로가기 복귀 정상.
  - `file://` fetch 실패 시 SAMPLE fallback 정상.
  - 임의 HTML은 텍스트로 escape되고 `<strong>`만 생성.

### 다음에 볼 것
- 공개 저장소에 `dist/data.json`이 포함되므로 민감한 작업명/상태 문구를 주기적으로 점검.
- 필요하면 `docs/status-snapshot.md` 같은 사람이 읽기 쉬운 상태 스냅샷을 자동 생성.
- 반복 검증을 위해 간단한 smoke test 스크립트 추가 고려.

## 2026-06-18 ~ 06-19 · 대시보드 신규 구축 → 벤토 리디자인 → 배포

### 무엇을 만들었나
- **목적:** Larry(오케스트레이터) 작업을 프로젝트별로 휴대폰에서 한눈에 보는 개인 대시보드. 흩어진 마크다운(볼트 세션로그·Deliverables·My Life, 메모리 로드맵, 앱 레포 버전·변경내역·KNOWN-ISSUES, 수동 TODO)을 집계.
- **위치(볼트 밖 로컬 작업 디렉터리):** `~/projects/mypka-dashboard/`.
- **구성:**
  - `generate.mjs` — 무의존성 집계기. 프로젝트 자동발견(`~/projects/*/` package.json/KNOWN-ISSUES) + 세션로그 파서(frontmatter + ## 헤딩) + 변경내역/KNOWN-ISSUES 카운트 + My Life/Deliverables + PII 레닥션(이메일·토큰) → `dist/data.json`. **저널·CRM·Documents는 절대 안 읽음.**
  - `dist/index.html` — 모바일 우선 단일 페이지. **벤토(가변 크기) 카드 홈** + 드릴다운 상세. `./data.json` fetch(no-store)+SAMPLE 폴백, `esc()` XSS, 마크다운 정리, noindex.
  - `data/todos/<project>.md` — 프로젝트별 수동 TODO(자동집계와 합산). 현재 `survey-011.md` 있음.
  - `dist/_headers` — `data.json` no-cache(열 때마다 최신), noindex.
  - `.pages-project` — Cloudflare Pages 프로젝트명(추측불가): `pka-e675e4db200183da`.
  - `PROMPT-design.md` — 클로드 디자인 웹 서비스용 프롬프트(샘플 데이터 포함).
  - `README.md` — 사용법/배포 가이드.

### 배포 / 호스팅
- **Cloudflare Pages**, 추측불가 URL: **https://pka-e675e4db200183da.pages.dev** (라이브 200 OK).
- Cloudflare Account ID는 로컬 비밀 설정에만 둔다. 배포: `npm run publish`(= generate + `wrangler pages deploy dist`).
- ⚠️ **첫 배포 때 쓴 Cloudflare API 토큰이 대화에 노출됨 → 폐기 필요(민구 미확인).** 새 토큰 발급 후 다음 배포에 적용.

### UI 변천
1. v1: 균등 4카드(핸드오프 디자인 적용) — 정보 밀도 낮음 지적.
2. v2: **벤토(가변 크기)** + **TODO 홈 노출(진행률)** + "지금 급한 것"·"최근 활동" 통합 카드. **폰·맥 둘 다 엄격 무스크롤**(overflow 0 측정 확인), 블랙 테마(눈 피로 저감 팔레트).
3. v3: **상세 화면 홈 바 고정 + 본문만 스크롤**(민구 요청 — 상세 보고 홈 갈 때 위로 스크롤 불편 해소). `.detail`=flex column, `.dtop` 고정, `.dbody`만 스크롤. 폰·맥 top=0 고정 검증.

### claude.ai/design 연결 (/design-sync)
- claude.ai 로그인에 design 권한 부여됨. DesignSync로 "myPKA Dashboard" 프로젝트 생성 + 푸시.
- ⚠️ **재로그인 시 세션이 바뀌어 이전 design 프로젝트 접근 끊김** → 새 프로젝트로 재생성·재푸시함. 현재 유효 projectId: `f9cc4858-4026-430b-9e77-d032f30c7f55`. (이전 `1558cffc…`는 접근 불가/빈 프로젝트로 남았을 수 있음 — claude.ai/design에서 정리 가능.)

### 운영 규칙 (영속화 완료)
- **AGENTS.md Hard rule #11**에 "배포/세션종료 ⇒ 대시보드 재게시(`npm run publish`)" 추가. "대시보드 갱신" = 수동 트리거.
- 메모리 `work-dashboard.md` + MEMORY.md 인덱스 등록.

### 검증
- Playwright 390×844·1280×800·1440×900: 홈 `scrollHeight ≤ innerHeight`(무스크롤), TODO 타일 노출, 타일→상세→홈 왕복, 상세 본문 스크롤 중 홈 바 top=0 고정, 콘솔 에러 0.

### Open items (다음에)
- [ ] Cloudflare API 토큰 폐기 + 새 토큰 적용 (보안).
- [ ] claude.ai/design 빈/구 프로젝트(`1558cffc…`) 정리.
- [ ] 큰 타일(survey-011·KNOWN-ISSUES·최근활동) 하단 여백 — 무스크롤 우선이라 잔존. 원하면 콘텐츠 보강.
- [ ] 더 강한 잠금 원하면 Cloudflare Access(이메일 OTP, 무료).
- [ ] generate.mjs는 새 코드 프로젝트 자동 발견 — survey-011 외 프로젝트 생기면 자동 편입.

### 다음 작업
**survey-011 개선 작업으로 복귀.** survey-011 세션 로그는 볼트 `Team Knowledge/session-logs/`에 작성(이 파일과 분리). 대시보드는 survey-011 배포/세션종료 때 `npm run publish`로 함께 갱신만.
