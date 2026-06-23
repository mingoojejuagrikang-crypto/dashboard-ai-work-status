# Handoff: 대시보드_AI_작업현황

## Overview
"대시보드_AI_작업현황"은 한 명의 개발 의뢰자가 **자신의 AI 팀이 진행 중인 작업을 프로젝트별로 한눈에** 보는 개인용 현황 대시보드입니다. 백엔드가 같은 폴더에 `data.json`을 생성해 두면, 이 화면은 그것을 읽어 **읽기 전용으로** 보여줍니다(생성·편집 기능 없음).

핵심 UX 원칙:
- **홈 = 카드 메뉴** — "꼭 알아야 할 것 / 최근 정보"를 요약한 카드들의 메뉴.
- **홈은 세로 스크롤 없음** — 화면 크기에 유동적으로 꽉 맞춤. 깊은 정보는 카드를 눌러 들어가는 **상세 화면**에서만 스크롤.
- **눈 피로 저감 블랙 테마** — 의뢰자가 눈이 매우 피로한 상태. 순수 검정·순백·강한 글로우 금지.
- **시력 배려로 글자 크기를 크게** — 본문 18px 기준.

## About the Design Files
이 번들의 `index.html`은 **HTML로 만든 디자인 레퍼런스**입니다 — 의도한 모양과 동작을 보여주는 프로토타입이지, 그대로 복사해 배포할 프로덕션 코드가 아닙니다. 작업은 이 HTML 디자인을 **대상 코드베이스의 기존 환경(React / Vue / Svelte 등)과 패턴·라이브러리로 재구현**하는 것입니다. 아직 환경이 없다면 이 프로젝트에 가장 적합한 프레임워크를 선택해 구현하세요.

다만 이 디자인은 원래 요구사항이 "**외부 의존 0의 단일 자립형 `index.html`**(인라인 CSS+JS, 바닐라 JS)"이었습니다. 만약 최종 산출물도 동일하게 단일 정적 파일이어야 한다면, 동봉된 `index.html`을 그대로 출발점으로 써도 됩니다. 컴포넌트 프레임워크로 옮길지, 단일 파일을 유지할지는 대상 환경에 맞춰 판단하세요.

## Fidelity
**High-fidelity (hifi).** 최종 색상·타이포그래피·간격·인터랙션이 모두 확정된 픽셀 단위 목업입니다. 아래 디자인 토큰의 정확한 값으로 UI를 그대로 재현하세요.

---

## 데이터 계약 (반드시 준수 — 기존 백엔드와 호환)
런타임에 다음으로 데이터를 읽습니다:
```js
fetch('./data.json?t=' + Date.now(), { cache: 'no-store' })
```
- 실패 시(미리보기·오프라인) **코드에 inline 상수로 포함된 SAMPLE**로 폴백해 항상 렌더되게 합니다. 실서비스에선 fetch 우선.
- 빈 배열 / `null` 섹션은 렌더하지 않음(우아한 빈 상태).

### data.json 스키마
```ts
{
  generatedAt: string,            // ISO 8601, 예: "2026-06-19T01:10:52.703Z"
  projects: Array<{
    id: string,
    name: string,
    version: string | null,       // 예: "0.14.0"
    roadmap: string | null,
    changelog: Array<{ version: string, date: string /*YYYY-MM-DD*/, summary: string, bullets: string[] }>,
    knownIssues: { counts: { fixed: number, watching: number, na: number },
                   watching: Array<{ tag: string, title: string, category: string }> } | null,
    openThreads: Array<{ text: string, source: string /*YYYY-MM-DD*/ }>,
    nextSteps:  Array<{ text: string, source: string }>,
    todos: { inProgress: Item[], pending: Item[], done: Item[] } | null,   // Item = { done: boolean, text: string }
    sessions: Array<{ date: string, theme: string, whatWeDid: string[], decisions: string[] }>,
    pkm: { goals: PkmItem[], projects: PkmItem[] },   // PkmItem = { id, title, status, summary }
    deliverables: Array<{ file?: string, date: string, title: string }>
  }>
}
```
(전체 예시 페이로드는 동봉된 `index.html`의 `SAMPLE` 상수를 그대로 참고하세요.)

### 텍스트 정리 규칙 (마크다운 잔재 처리)
모든 텍스트 필드에는 마크다운 잔재가 섞여 있어 렌더 시 정리해야 합니다. **반드시 HTML 이스케이프 후 굵게만 허용**(XSS 방지):
1. 블록인용 `>` 와 callout `[!example]` 마커 제거
2. 줄 맨 앞 체크박스 토큰 제거: `[ ]`, `[x]`, `[X]`
3. 줄 맨 앞 라벨 토큰 제거: `**(A)**`, `**(B 클립소실)**` 형태 `**(...)** `
4. 위키링크 `[[텍스트]]` → `텍스트`
5. 백틱 코드표시 제거: `` `code` `` → `code`
6. `<,>,&,"` HTML 이스케이프
7. 이스케이프 **후** `**굵게**` → `<strong>굵게</strong>` 만 복원
구현 참고: `index.html`의 `clean(raw)` / `esc(s)` 함수.

### 날짜 포맷 (한국어)
- `generatedAt` → `2026년 6월 19일 (금) 오전 10:10` (`fmtDateTime`)
- 카드/배지의 날짜 → `2026.06.18` (`fmtDateLong`) 또는 짧게 `6/18` (`fmtDate`)

---

## Screens / Views

### 1. 홈 (무스크롤, 카드 메뉴)
- **Purpose**: 의뢰자가 진입하자마자 전체 현황을 스크롤 없이 파악.
- **Layout**: 세로 flex 컬럼. 높이 `100dvh`(모바일 주소창 대응), `overflow:hidden`. safe-area inset 반영.
  - **히어로(요약 바)** — `flex:0 0 auto`. 좌측: 타이틀 "대시보드_AI_작업현황"(앞에 초록 점) + 한 줄 요약. 우측: 새로고침 버튼. 하단 1px 보더.
    - 요약 한 줄 예: `2026년 6월 19일 (금) 오전 10:10 기준 · 프로젝트 2 · 미해결 8 · 최신 survey-011 v0.14.0` (숫자/최신은 `<b>` 강조). 좁으면 ellipsis(모바일 2줄 clamp).
  - **카드 그리드** — `flex:1 1 auto; min-height:0; display:grid; gap:14px; grid-auto-rows:1fr`. 열 수를 화면 폭에 맞춰 JS로 결정(아래 "반응형"). 각 셀 `overflow:hidden`으로 무스크롤 보장.
- **카드 종류**:
  - **프로젝트 카드** (프로젝트마다 1개, 클릭 → 해당 프로젝트 상세):
    - 헤더: 프로젝트명(`card-title`, 최대 2줄 clamp) + 버전 배지 `v0.14.0`(`version` 있을 때만).
    - **수치 타일 행**(`.tiles`, flex, wrap): 각 타일은 큰 숫자 + 작은 라벨.
      - 🔴 `openThreads.length` / 라벨 "미해결" (빨강 숫자) — 항상.
      - ⚠️ `knownIssues.counts.watching` / 라벨 "⚠️ 주시" (호박 숫자) — 값 있을 때만.
      - `todos`: `done.length`/`total` / 라벨 "TODO 완료" (초록 숫자) — `todos` 있을 때만. (total = done+inProgress+pending)
    - 푸터: 좌 "최근 세션 2026.06.18"(`sessions[0].date`) · 우 "상세 →".
  - **🔴 지금 급한 것** 카드 (모든 프로젝트 `openThreads` 통합, 최신순 상위 3 표시 / 클릭 → 전체 목록 상세):
    - 헤더: "🔴 지금 급한 것" + 총 개수 배지(빨강 톤).
    - 미니 리스트: 각 항목 **단일 줄 ellipsis** 텍스트 + 우측 작은 날짜칩(`source`, `6/18`).
    - 푸터: "전체 미해결 보기" · "상세 →".
  - **🕑 최근 활동** 카드 (모든 프로젝트 `sessions` 날짜순 통합, 최근 3 / 클릭 → 타임라인 상세):
    - 헤더: "🕑 최근 활동" + 총 개수 배지(중립 톤).
    - 미니 리스트: 좌측 날짜(`6/18`) + 단일 줄 ellipsis 테마.
    - 푸터: "타임라인 보기" · "상세 →".
  - 카드 수가 화면을 넘기면 열 수를 조정하고 각 카드를 압축해 무스크롤 유지. 그래도 안 들어가는 세부는 상세로.

> 디자인 의도: 카드에 **긴 본문 문장을 넣지 않는다**(잘려 보이면 난잡함). 프로젝트 카드는 "큰 숫자 타일" 중심, 통합 카드는 "한 줄 항목" 중심으로 깔끔하게.

### 2. 상세 (스크롤 허용) — 카드 클릭 시 진입
- **Layout**: `position:absolute; inset:0; overflow-y:auto`. 상단에 sticky 바.
  - **detail-bar**(sticky, `backdrop-filter: blur(14px)`, 반투명 배경): "← 홈" 뒤로 버튼 + 제목(`h2`) + 부제(`dsub`, 예 "버전 v0.14.0").
  - **detail-body**: `max-width:980px; margin:0 auto; padding:22px`, 섹션들 세로 stack(gap 18px).
- **프로젝트 상세 — 있는 섹션만 렌더(없으면 생략)**:
  - **▶ 다음 시작점** (`nextSteps[]`): 각 줄 `▶` 불릿 + 텍스트 + `source` 날짜칩.
  - **🔴 미해결 / 실기기 대기** (`openThreads[]`): `●` 불릿 + 텍스트 + `source` 날짜칩.
  - **✅ TODO 진행도** (`todos`): "완료 N · 진행중 N · 대기 N · NN% 완료" 요약 + **진행률 막대**(완료=초록, 진행중=파랑 누적) + 그룹별 목록(진행중/대기/완료). **완료 항목은 취소선 + 체크박스 체크 표시.**
  - **🐞 KNOWN-ISSUES** (`knownIssues`): 카운트 칩 3개(✅ 수정 / ⚠️ 주시 / ➖ 해당없음) + `watching[]` 목록(각 `tag` 배지 · `title` · `category`).
  - **📦 변경 내역** (`changelog[]`): 항목마다 `v0.14.0` 버전 배지 + 날짜 + `summary` + `bullets[]`(불릿 리스트).
  - **🕑 세션 타임라인** (`sessions[]`): **접이식**. 닫힘=날짜칩 + 테마 한 줄 + caret. 열림=`whatWeDid[]`("한 일", 초록 불릿) / `decisions[]`("결정", 호박 불릿).
  - **📁 관련 PKM·산출물** (`pkm.goals[]`, `pkm.projects[]`, `deliverables[]`): "목표/프로젝트"는 제목 + status 배지 + summary, "산출물"은 날짜 + 제목.
- **"지금 급한 것" 상세**: 통합 `openThreads` 전체. 각 항목에 프로젝트명(`pname`, 파랑) + 텍스트 + 날짜.
- **"최근 활동" 상세**: 통합 `sessions` 전체를 접이식 타임라인으로(항목에 프로젝트명 표기).

## Interactions & Behavior
- **네비게이션**: 홈은 단일 페이지 상태(라우터 없음). 카드 클릭 → 상세를 그려 넣고, "← 홈" 버튼 → 홈 재렌더. (실제 코드베이스에선 라우트로 구현해도 됨.)
- **새로고침 버튼**: 클릭 시 데이터 재fetch 후 홈 재렌더. 로딩 동안 아이콘 회전(`spin` 0.7s linear).
- **세션 접이식**: 헤더 클릭 토글. caret 90° 회전, `max-height` 트랜지션(0.28s).
- **섹션 등장**: 상세 섹션은 아주 짧은 `translateY(7px)→0` 트랜지션(0.28s)만(opacity 변화 없음 — 렌더 throttle 시 내용이 사라지지 않게 하기 위함. ⚠️ 엔트런스 애니메이션을 `opacity:0`에서 시작하지 말 것).
- **호버 상태**: 카드 hover 시 보더 밝아지고 `translateY(-2px)`. 버튼(새로고침/뒤로) hover 시 보더·텍스트·배경 살짝 밝아짐.
- **에러 상태**: 데이터 로드 자체가 불가하면 친절한 에러 카드(`.empty`). (현재는 SAMPLE 폴백이 우선이라 거의 항상 렌더됨.)
- **로딩 상태**: 초기 "불러오는 중…" 플레이스홀더.
- **`prefers-reduced-motion: reduce` 존중**: 모든 애니메이션/트랜지션 ~0으로. 줄간격 ≥ 1.5, 모바일 탭 타깃 44px+.

## Responsive behavior
- 높이는 `dvh` 사용. safe-area inset(`env(safe-area-inset-*)`) 반영.
- **홈 그리드 열 수**(JS, 리사이즈 시 재계산):
  - `≤ 560px` (폰): 2열 (카드 1개면 1열)
  - `561–900px`: min(카드수, 2)열
  - `901–1280px`: min(카드수, 3)열
  - `> 1280px`: min(카드수, 4)열 — 단 카드 4개면 보기 좋게 2열로(2×2)
- **타깃 기기**: 13~14" 맥북(~1440px 폭) 및 스마트폰(390×844). 두 경우 모두 홈은 **세로 스크롤 없이** 들어맞아야 함.
- 모바일에선 패딩·간격 축소, 새로고침 버튼 라벨 숨김(아이콘만), 요약 줄 2줄 clamp.

## State Management
- `DATA`: fetch 결과(or SAMPLE) 보관.
- 뷰 상태: `home` ↔ `detail`. `detail`은 `{ type: 'project'|'urgent'|'recent', projectId? }`로 식별.
- 세션 아이템별 열림/닫힘 토글 상태.
- 데이터 패칭: 위 "데이터 계약" 참조(no-store, cache-busting 쿼리).

---

## Design Tokens

### Colors
| 토큰 | 값 | 용도 |
|---|---|---|
| `--bg` | `#0b0c0e` | 페이지 배경(순수 검정 아님) |
| `--bg-2` | `#101215` | 살짝 밝은 바탕(타일/날짜칩 배경) |
| `--surface` | `#15171a` | 카드 표면 |
| `--surface-2` | `#1a1d21` | 카드 내부 강조 표면/칩 |
| `--border` | `#26292e` | 카드 경계 |
| `--border-soft` | `#1e2125` | 은은한 구분선 |
| `--text` | `#c9ced6` | 본문(순백 금지) |
| `--text-dim` | `#8b929c` | 보조 텍스트 |
| `--text-faint` | `#646a73` | 더 낮은 명도(메타/라벨) |
| 제목 강조 | `#dfe3e9` ~ `#e2e6ec` | h1/카드제목/섹션제목 |
| `--blue` | `#5b8def` | 강조(버전/링크/진행중) |
| `--green` | `#54b585` | 강조(완료/한 일/active) |
| `--amber` | `#d9a441` | 강조(주시/경고/결정) |
| `--red` | `#e0625e` | 강조(미해결/급한 것) |

- 강조색은 면적 작게(배지·숫자·아이콘). 큰 밝은 블록·강한 흰빛 글로우 금지. 강조 배경은 해당 색의 8~12% 알파 + 22~28% 알파 보더.
- 아주 옅은 따뜻한 오버레이(`rgba(255,170,90,.025)` 전체 fixed)로 블루라이트 체감 저감(선택, 과하지 않게).

### Typography
- 폰트 스택: `-apple-system, BlinkMacSystemFont, "SF Pro KR", "Apple SD Gothic Neo", "Pretendard", "Malgun Gothic", system-ui, sans-serif`. 외부 폰트 의존 없음.
- 기준 본문 `18px`, line-height `1.6`. 시력 배려로 전반적으로 큰 편.
- 주요 스케일:
  - 히어로 h1: `clamp(22px, 2.8vw, 30px)`, weight 650
  - 요약 한 줄: `clamp(14px, 1.6vw, 17px)`
  - 카드 제목: `clamp(18px, 2.1vw, 22px)`, weight 640
  - 수치 타일 숫자: `clamp(22px, 2.6vw, 28px)`, weight 700, `font-variant-numeric: tabular-nums`, letter-spacing −.02em
  - 타일 라벨: `13px`
  - 섹션 제목: `16px`, weight 640
  - 상세 본문 row: `15.5px`, line-height 1.65
  - 메타/날짜칩: `12.5–13px`
- 숫자에는 `tabular-nums` 사용(정렬감).

### Spacing / Radius / Shadow
- 라운드: 카드 `--radius:14px`(모바일 12px), 칩/타일/버튼 9~11px, 작은 배지 5~7px.
- 카드 패딩: 데스크탑 `18px 18px 16px`, 모바일 `14px 14px 12px`.
- 그리드/리스트 gap: 14px(그리드), 7~10px(리스트).
- 그림자는 거의 사용 안 함 — **미세한 보더로 깊이 표현**(번쩍이는 그라데이션 금지). detail-bar만 `backdrop-filter: blur(14px)`.
- 트랜지션 ease: `cubic-bezier(.22,.61,.36,1)`, 0.18~0.28s.

## Assets
- 이미지 에셋 없음. 아이콘은 인라인 SVG(새로고침·뒤로·caret) + 이모지 글리프(🔴 ⚠️ ✅ 🐞 📦 🕑 📁 ▶). 이모지는 의뢰자 사양에 따라 의도적으로 사용됨.
- 로고/브랜드 에셋 없음. 대상 코드베이스에 브랜드 시스템이 있으면 그쪽을 따르세요.

## Files
- `index.html` — 전체 디자인의 단일 자립형 구현(인라인 `<style>` + 바닐라 JS). 모든 토큰·`clean()`/`esc()`/날짜 포맷·그리드 열 계산·렌더 로직·SAMPLE 페이로드가 이 한 파일 안에 있습니다. 정확한 색/간격/동작은 이 파일을 1차 소스로 참고하세요.
- `meta` 요구: `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`, `<meta name="robots" content="noindex, nofollow">`, `<meta name="theme-color" content="#0b0c0e">`.
