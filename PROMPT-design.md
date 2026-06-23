# 클로드 디자인 웹 서비스용 프롬프트 — myPKA 작업 대시보드 리디자인

> 아래 `=== 프롬프트 시작 ===` ~ `=== 프롬프트 끝 ===` 사이를 통째로 복사해 붙여 넣으세요.

=== 프롬프트 시작 ===

당신은 시니어 프로덕트 디자이너 겸 프론트엔드 엔지니어입니다. 아래 사양에 맞는 **단일 자립형 `index.html`**(인라인 CSS+JS, 외부 라이브러리·CDN·폰트 의존 없음, 바닐라 JS)을 만들어 주세요. 한국어 UI입니다.

## 무엇을 만드나
"myPKA 작업 대시보드" — 한 사람(개발 의뢰자)이 **자신의 AI 팀이 진행 중인 작업을 프로젝트별로 한눈에** 보는 개인용 현황 대시보드. 이미 백엔드가 `data.json`(같은 폴더)을 생성해 두며, 이 화면은 그걸 읽어 보여주기만 합니다.

## 절대 요구사항 (의뢰자 지정)
1. **홈 = 카드 메뉴.** 첫 화면은 "꼭 알아야 할 것 / 최근 정보"를 요약한 **카드들의 메뉴**입니다.
2. **홈은 스크롤 없이** 사용자의 화면 크기에 **유동적으로 꽉 맞게**(no vertical scroll) 배치됩니다. 화면이 작으면 카드가 압축되고, 넘칠 정보는 홈에 두지 않고 상세로 넘깁니다.
3. **스크롤이 필요한 깊은 정보는 카드를 클릭(탭)해 들어가는 상세 화면**에서 봅니다. 상세 화면은 스크롤 허용. 상세에는 항상 **뒤로(홈)** 버튼.
4. **맥북과 스마트폰 양쪽에 반응형 대응.** 맥북: 넓은 다단 그리드. 스마트폰: 세로 적층이되 **홈은 여전히 무스크롤**로 맞춤(safe-area inset 대응, 세로 우선).
5. **블랙 테마.** 의뢰자가 눈이 매우 피로한 상태 → **눈 부담을 최소화**하는 어두운 테마(아래 팔레트 가이드 필수 반영).

## 블랙 테마 / 눈 피로 저감 가이드 (중요)
- 배경은 **순수 검정이 아닌 아주 어두운 무채색**(예: `#0b0c0e`), 카드 표면은 약간 밝게(`#15171a`), 경계선은 은은하게(`#26292e`).
- 글자는 **순백(#fff) 금지** — 부드러운 회색(`#c9ced6`), 보조 텍스트는 더 낮은 명도(`#8b929c`). 본문 대비를 과하지 않게(눈부심 방지) 하되 가독성 유지.
- 강조색은 **채도를 낮춘 차분한 톤**: 파랑 `#5b8def`, 초록 `#54b585`, 호박 `#d9a441`, 빨강 `#e0625e`. 큰 면적의 밝은 블록·강한 흰빛 글로우 금지.
- 전체 화면 휘도를 낮게. 미세한 그림자/보더로 깊이 표현(번쩍이는 그라데이션 X).
- `prefers-reduced-motion` 존중(전환 애니메이션 최소화 옵션). 편안한 줄간격(line-height ≥ 1.5), 충분한 탭 타깃(모바일 44px+).
- (선택) 아주 옅은 따뜻한 오버레이로 블루라이트 체감 저감 — 과하지 않게.

## 화면 구성
### 홈 (무스크롤, 카드 메뉴)
- **상단 히어로(요약 바)**: "myPKA 작업 대시보드" 타이틀 + **데이터 기준 시각**(`data.generatedAt` 사람이 읽는 한국어 형식) + **새로고침 버튼**. 한 줄 전체 요약 권장(예: "프로젝트 2 · 미해결 8 · 최신 survey-011 v0.14.0").
- **프로젝트 카드**(프로젝트마다 1개): 프로젝트명 + **버전 배지**(`version`) + **🔴 미해결 수**(`openThreads.length`) + **⚠️ KNOWN-ISSUES 주시 수**(`knownIssues.counts.watching`) + **▶ 다음 시작점 1줄**(`nextSteps[0]`) + **최근 세션 날짜**(`sessions[0].date`). 카드를 누르면 그 프로젝트 상세로.
- **(추천) "🔴 지금 급한 것" 카드**: 모든 프로젝트의 `openThreads`를 모아 상위 3개. 누르면 전체 목록 상세.
- **(추천) "🕑 최근 활동" 카드**: 모든 프로젝트 `sessions`를 날짜순으로 합쳐 최근 3개(날짜+테마). 누르면 타임라인 상세.
- 카드 수가 화면을 넘기면, 화면 크기에 따라 그리드 열수를 조정(맥북 3~4열 / 폰 1~2열)하고 **각 카드를 압축**해 무스크롤 유지. 그래도 안 들어가는 세부는 상세로.

### 상세 (스크롤 허용) — 카드 클릭 시 진입
프로젝트 상세 섹션(있는 것만 렌더, 없으면 생략):
- **▶ 다음 시작점** (`nextSteps[]`)
- **🔴 미해결 / 실기기 대기** (`openThreads[]`, 각 항목에 `source` 날짜 표기)
- **✅ TODO 진행도** (`todos`: 완료/진행중/대기 개수 + 진행률 막대 + 각 목록. 완료 항목은 취소선)
- **🐞 KNOWN-ISSUES** (`knownIssues.counts` 칩 ✅수정/⚠️주시/➖ + `watching[]` 목록: `tag`·`title`·`category`)
- **📦 변경 내역** (`changelog[]`: `version`·`date`·`summary`·`bullets[]`)
- **🕑 세션 타임라인** (`sessions[]`: `date`·`theme`, 접이식으로 `whatWeDid[]`·`decisions[]`)
- **📁 관련 PKM·산출물** (`pkm.goals[]`·`pkm.projects[]`: `title`·`status`·`summary`; `deliverables[]`: `date`·`title`)
- "지금 급한 것"/"최근 활동" 카드의 상세는 해당 통합 목록 전체.
- 진입/복귀는 부드러운 전환(슬라이드 또는 페이드, reduced-motion이면 즉시).

## 데이터 계약 (반드시 준수 — 기존 백엔드와 호환)
- 런타임에 **`fetch('./data.json?t=' + Date.now(), { cache: 'no-store' })`**로 데이터를 읽습니다. 실패하면 아래 **내장 SAMPLE**로 폴백(디자인 툴 미리보기에서도 렌더되게). 즉 SAMPLE을 코드에 inline 상수로 포함하되, 실서비스에선 fetch 우선.
- 텍스트 필드에는 마크다운 잔재가 섞여 있습니다. 렌더 시 정리:
  - `**굵게**` → 굵게 표시.
  - 줄 맨 앞의 `[ ]`, `[x]`, `**(A)**` 같은 토큰은 제거하고 사람이 읽기 좋게.
  - `[[위키링크]]`, 백틱 코드표시는 일반 텍스트로.
  - HTML 이스케이프 필수(XSS 방지) — `<,>,&,"` 처리 후 굵게만 허용.
- 빈 배열/`null` 섹션은 렌더하지 않음(우아한 빈 상태).

## 기술 제약
- **단일 `index.html`** — 인라인 `<style>`+`<script>`, 외부 의존 0.
- `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`, `<meta name="robots" content="noindex, nofollow">`, `<meta name="theme-color" content="#0b0c0e">`.
- 높이 단위는 `dvh`(모바일 주소창 대응)로 홈 무스크롤 보장. safe-area inset 반영.
- 데이터 로드 실패 시 친절한 에러 카드.
- 코드는 읽기 쉽게, 주석 한국어 간단히.

## 내장 SAMPLE (이 구조 그대로가 실제 data.json 형식입니다)
```json
{
  "generatedAt": "2026-06-19T01:10:52.703Z",
  "projects": [
    {
      "id": "survey-011",
      "name": "survey-011",
      "version": "0.14.0",
      "roadmap": "survey-011 개선 로드맵 — v0.4.1~v0.12.0 배포 완료(v0.12.0: 입력장치 CATEGORY 배지[출력토글 삭제·echoCancellation 항상ON·IOS-5 PWA종결], 알람팝업 라벨/샘…",
      "changelog": [
        {
          "version": "0.14.0",
          "date": "2026-06-18",
          "summary": "v0.13.0 실기기 테스트 로그 분석 + 음성 클립 직접 청취 결과와 현장 피드백을 반영했습니다.",
          "bullets": [
            "**이상치 알람이 안 울리던 문제를 고쳤습니다(입력탭).** 과거값(직전 조사 회차)을 불러오다 한 번 실패하면 그 세션 내내 다시 시도하지 않아 알람이 전혀 작동하지 않았습니다. 이제 실패해도 자동으로 다시 불러와, 입력을 이어가는 동안 알람이 정상 작동합니다. 알람 팝업에는 **직전 값이 언제(예: 2026-05-13) 조사한 값인지** 날짜를 함께 보여줍니다(측정자가 비교 시점을 알 수 있도록).",
            "**음성 클립이 끊겨 들리거나 통째로 사라지던 문제를 고쳤습니다(데이터탭).** 입력 장치(블루투스↔스피커폰)가 바뀌면 녹음기가 멈춰 이후 클립이 전부 빈 소리로 저장되던 현상을, 빈 클립이 감지되면 **마이크를 자동으로 다시 잡아** 되살리도록 했습니다. 또 클립에서 값 부분이 잘려 안 들리던 경우, 너무 짧게 잘렸으면 원본을 그대로 남겨 값이 사라지지 않게 했습니다."
          ]
        },
        {
          "version": "0.13.0",
          "date": "2026-06-18",
          "summary": "설정·입력·데이터 탭의 사용 요청과 현장 피드백을 반영했습니다.",
          "bullets": [
            "**자주 쓰는 스프레드시트를 \"파일명\"으로 저장해 두고 한 번에 다시 고를 수 있습니다(설정탭).** 시트를 한 번 연결하면 그 파일명이 목록에 자동으로 저장됩니다. 앱 업데이트·새로고침·강제종료 뒤 연결이 풀려도, 매번 구글 드라이브에서 공유링크를 복사해 붙여넣을 필요 없이 목록에서 탭 한 번이면 됩니다(필요 없는 항목은 휴지통으로 삭제). 연결이 풀리는 건 보안상 로그인이 약 1시간 뒤 만료되기 때문이며, 이제 그 상태를 \"연결됨\"으로 잘못 표시하지 않고 **다시 로그인하면 직전에 쓰던 시트로 자동 연결**됩니다.",
            "**이상치 알람에서 다시 말한 값이 정상이면 팝업이 초록으로 바뀌고 그 값을 바로 보여줍니다(입력탭).** 예전엔 다시 말한 값과 화면 팝업이 어긋나 보였는데, 이제 정정한 값이 정상이면 팝업이 **빨강→초록**으로 바뀌며 새 값을 즉시 반영합니다."
          ]
        }
      ],
      "knownIssues": {
        "counts": {
          "fixed": 35,
          "watching": 29,
          "na": 2
        },
        "watching": [
          {
            "tag": "STT-2",
            "title": "후치 수정 명령 미감지 (\"178.1 정정\")",
            "category": "① 음성 / STT 파서"
          },
          {
            "tag": "STT-4",
            "title": "컬럼명과 같은 STT 값 거부가 text/options 컬럼까지 차단",
            "category": "① 음성 / STT 파서"
          }
        ]
      },
      "openThreads": [
        {
          "text": "[ ] **(A)** 이상치 알람: 다음 로그에 past_index_ready 출현 + 알람 실작동(감소/변동률) + 팝업 직전 조사일 표시 확인.",
          "source": "2026-06-18"
        },
        {
          "text": "[ ] **(B 클립소실)** 의도적 BT↔스피커폰 전환 중 녹음 → clip_recorder_recovered:<reason> 출현 + 이후 클립 정상 저장 확인. 연속 clip_empty 재발 여부.",
          "source": "2026-06-18"
        }
      ],
      "nextSteps": [
        {
          "text": "다음 v0.14.0 실기기 로그 분석: 위 텔레메트리 훅(past_index_ready, clip_recorder_recovered, settings_hydrated/restored_from_idb) 정량 확인.",
          "source": "2026-06-18"
        },
        {
          "text": "로그 수확: rclone gdrive survey-011/log/ + 하위폴더(log-fetch-rclone, log-analysis-search-drive-subfolders).",
          "source": "2026-06-18"
        }
      ],
      "todos": {
        "inProgress": [
          {
            "done": false,
            "text": "v0.14.0 실기기 테스트 결과 대기 (민구 현장 검증)"
          }
        ],
        "pending": [
          {
            "done": false,
            "text": "(A) 이상치 알람 — 다음 로그에서 past_index_ready 출현·알람 실작동 확인"
          },
          {
            "done": false,
            "text": "(B) 클립 소실 — BT↔스피커폰 전환 중 clip_recorder_recovered 출현·이후 클립 정상 확인"
          }
        ],
        "done": [
          {
            "done": true,
            "text": "v0.14.0 배포 (이상치 재시도·클립 캡처회복·트림보강·영속화 미러·팝업중앙·저장시트 드롭다운)"
          }
        ]
      },
      "sessions": [
        {
          "date": "2026-06-18",
          "theme": "survey-011 v0.14.0 — v0.13.0 실기기 로그 + 음성클립 직접청취 분석",
          "whatWeDid": [
            "**Larry(오케스트레이터)** — read-only 분석으로 6개 영역을 file:line 앵커 + 로그증거 + 근본원인으로 매핑. advisor 검증으로 \"추론만으로 무거운 수정 금지\" 2건(클립·영속화) 데이터 재확인.",
            "**음성 클립 전사 분석(신규)** — 91개 트림 클립 전사+RMS 분류: **OK 35% / SILENT·환각 25% / MISMATCH 20% / NO_CLIP 20%**. 결정적 통찰: 실패의 ~45%(SILENT+NO_CLIP)가 **캡처 문제**(값이 raw에도 없음), 트림은 2차. → 데이터탭 1순위가 트림 튜닝이 아니라 레코더 캡처 신뢰성으로 재구성."
          ],
          "decisions": [
            "**A 이상치 미작동 = 과거 인덱스 로드 1회 실패 후 재시도 없음(토큰·인증 무관).** 로그 past_index_ready 0건 + past_index_skip:Load failed 2건, 그러나 같은 세션 syncedRows:18 synced(시트 쓰기 성공) → transient fetch 실패를 아무도 재시도 안 함. 수정 = ensurePastIndex 백오프 재시도(샘플키 의미 변경 X). 비교 키 = 음성값 외 항목 조합(현행 inferSampleKey)이 민구 멘탈모델과 일치 확인."
          ]
        },
        {
          "date": "2026-06-18",
          "theme": "survey-011 v0.13.0 — 민구 UI/UX 요청 7개 영역 통합 릴리스 (설정·",
          "whatWeDid": [
            "**Larry(오케스트레이터)** — 8-에이전트 **이해 워크플로**(read-only)로 7개 영역을 file:line 앵커 + 현황(이미구현/부분/미구현) + 근본원인 + 구현 스케치로 정밀 매핑. advisor 검증으로 R1 원인 가설(토큰 만료 vs eviction)을 민구 질문 2개로 확정.",
            "**Vance(디자인 엔지니어)/Mack(자동화)** 역할로 7개 영역 구현(Larry가 직접 편집)."
          ],
          "decisions": [
            "**Q: \"스프레드시트 링크가 풀린다\"의 진짜 원인?** **A: OAuth 토큰 만료(~1h, refresh token 없음 [AUTH-4]).** 민구 확인 — \"연결 직후 새로고침은 안 풀림, 한참 뒤에만\"(시간 의존=토큰, eviction이면 즉시 새로고침에도 풀려야 함). advisor가 eviction을 의심했으나 이 답이 토큰으로 확정 → savedSheets를 localStorage에 둬도 안전. [AUTH-7]"
          ]
        }
      ],
      "pkm": {
        "goals": [],
        "projects": [
          {
            "id": "survey-011",
            "title": "survey-011",
            "status": "active",
            "summary": "음성 입력 기반 현장 측정 기록 PWA. 이어폰을 끼고 양손이 자유롭지 않은 현장에서 TTS 안내와"
          }
        ]
      },
      "deliverables": []
    },
    {
      "id": "team-ops",
      "name": "팀 운영 (채용·리서치·공통)",
      "version": null,
      "roadmap": null,
      "changelog": [],
      "knownIssues": null,
      "openThreads": [
        {
          "text": "[ ] 볼트 함정/지식의 GitHub 공유 여부 — 미결(로컬 유지 중). 필요 시 비공개 레포 결정.",
          "source": "2026-06-05"
        },
        {
          "text": "[ ] KNOWN-ISSUES \"확인 필요(미검증)\" 4건: pause/resume recorder 누수, 구형 Blob 하위호환, survey-011 v0.1~0.3 자체 라인 미수확 등 — 다음에 검증/보강.",
          "source": "2026-06-05"
        }
      ],
      "nextSteps": [],
      "todos": null,
      "sessions": [
        {
          "date": "2026-06-05",
          "theme": "Close: 오류·함정 지식베이스 구축 (조상 수확 + 상시 로깅 지침화)",
          "whatWeDid": [
            "**Trace** — 조상 수확 → ~/projects/survey-011/KNOWN-ISSUES.md 신규(331줄, 7카테고리 40항목 + 미검증 4).",
            "**Larry** — 지침 배선:"
          ],
          "decisions": [
            "**Q:** 함정 로그를 어디에 두나? **D:** 2계층 — 프로젝트 버그·환경 gotcha는 그 레포 KNOWN-ISSUES.md(원격 있으면 GitHub 동반), 앱 비종속 오케스트레이션/툴링 교훈은 볼트 GL-004."
          ]
        },
        {
          "date": "2026-06-04",
          "theme": "Close: survey-011 실기기 로그 분석 → Trace(QA) 채용 → 음성 정확",
          "whatWeDid": [
            "**Mack** — Drive 로그 ZIP 취득. 앱의 브라우저 OAuth엔 refresh token이 없어, 같은 GCP 프로젝트",
            "**Pax** — QA/App Reliability 분석가 채용 리서치 → Deliverables/2026-06-04-qa-reliability-analyst-hire-research.md. 이름 추천 Trace."
          ],
          "decisions": [
            "**Q:** 로그 분석/QA 역할을 어떻게? **D:** SOP-001로 **Trace 정식 채용**(throwaway 아님). QA/observability는 진짜 공백."
          ]
        }
      ],
      "pkm": {
        "goals": [
          {
            "id": "ship-mvp-by-q3",
            "title": "ship-mvp-by-q3",
            "status": "",
            "summary": "> [!example] Seeded course sample"
          }
        ],
        "projects": [
          {
            "id": "side-project-mvp",
            "title": "side-project-mvp",
            "status": "",
            "summary": "> [!example] Seeded course sample"
          }
        ]
      },
      "deliverables": [
        {
          "file": "2026-06-17-survey-011-log-analysis.md",
          "date": "2026-06-17",
          "title": "survey 011 log analysis"
        },
        {
          "file": "2026-06-15-audio-routing-research.md",
          "date": "2026-06-15",
          "title": "audio routing research"
        }
      ]
    }
  ]
}
```

이 사양으로 완성된 `index.html` 한 파일을 만들어 주세요. 홈이 다양한 화면(13" 맥북 ~1440px, 스마트폰 390×844)에서 **세로 스크롤 없이** 깔끔하게 들어맞는지 특히 신경 써 주세요.

=== 프롬프트 끝 ===
