# 대시보드_AI_작업현황

AI 작업팀이 진행 중인 프로젝트를 **프로젝트별로 한눈에** 보는 단일 페이지 대시보드입니다. 흩어진 마크다운(세션 로그, TODO, 변경내역, KNOWN-ISSUES, Deliverables, My Life 일부)을 집계해 `dist/data.json`으로 만들고, `dist/index.html`이 읽기 전용으로 표시합니다.

이 저장소는 앞으로 GitHub에도 업로드합니다. 목적은 다음 AI 모델이나 작업자가 변경이력, 시행착오, 다음 작업을 빠르게 이어받게 하는 것입니다.

## 현재 UI 원칙

- 홈은 모바일/데스크톱 모두 **무스크롤**입니다.
- 상단 필터는 `전체`, `survey-011`, `팀 운영`처럼 프로젝트 스코프를 바꿉니다.
- 홈 카드는 실행 상태 중심입니다: 지금 이어받을 작업, 업데이트 내역, 미해결/검증 대기, TODO 진행, 최근 활동, 프로젝트 상태, 산출물.
- 상세 화면은 홈의 큰 숫자를 반복하지 않고 실제 목록과 맥락을 보여줍니다.
- 상세 화면에서는 상단 헤더가 고정되고 본문만 스크롤됩니다.
- 상세 진입 후 브라우저 뒤로가기로 홈에 돌아올 수 있습니다.

## 데이터 출처와 프라이버시

| 포함 | 제외 |
|---|---|
| `Team Knowledge/session-logs/**` | `PKM/Journal/**` |
| `Deliverables/**` 요약 | `PKM/CRM/People`, `CRM/Organizations` |
| `~/projects/*/` 버전, 변경내역, KNOWN-ISSUES | `PKM/Documents/**` |
| 메모리 `*-improvement-roadmap.md` | |
| `PKM/My Life/{Goals,Projects}` | |
| `data/todos/<id>.md` | |

`generate.mjs`는 출력 직전 이메일과 토큰 패턴을 레닥션합니다. 그래도 GitHub 공개 저장소에 올릴 때는 `dist/data.json`의 내용이 외부에 공개된다는 점을 전제로 검토해야 합니다. `.cloudflare.env`, `.env*`, `.wrangler/`는 커밋하지 않습니다.

## 사용법

```bash
# 1) 데이터 집계 -> dist/data.json
npm run build

# 2) 로컬 미리보기
npm run serve
# http://127.0.0.1:8899

# 3) Cloudflare Pages 게시
npm run publish
```

## 구조

```text
generate.mjs                 데이터 집계기
dist/index.html              대시보드 UI
dist/data.json               최신 집계 스냅샷, GitHub에도 포함
dist/_headers                Cloudflare 캐시/색인 규칙
data/todos/<id>.md           프로젝트별 수동 TODO
SESSION-LOG.md               대시보드 자체 작업 세션 기록
AI_HANDOFF.md                다음 AI 작업자용 핵심 인수인계
LESSONS_AND_NEXT_STEPS.md    시행착오와 다음 개선 작업
STATUS_SNAPSHOT.md           현재 상태 사람이 읽는 요약
CHANGELOG.md                 저장소 변경이력
.pages-project               Cloudflare Pages 프로젝트명
```

## 배포

Cloudflare Pages 프로젝트명은 `.pages-project`에 있습니다. `deploy.sh`는 로컬 비밀 파일 `.cloudflare.env`가 있으면 API 토큰을 환경변수로 로드하고, 없으면 기존 `wrangler` 인증으로 배포합니다.

## GitHub 운영 메모

- GitHub 저장소명: `dashboard-ai-work-status`
- 화면/문서 타이틀: `대시보드_AI_작업현황`
- 내부 npm 패키지명은 스크립트 안정성을 위해 `mypka-dashboard`를 유지합니다.
- 대시보드 화면 타이틀과 문서 타이틀은 `대시보드_AI_작업현황`으로 맞춥니다.
- 데이터 스냅샷을 AI가 읽을 수 있게 `dist/data.json`도 커밋합니다.
