# survey-011 TODO (수동 유지 — 세션 로그 자동집계와 합쳐 대시보드에 표시)

> Larry가 유지. 세션 종료/배포 시 갱신. 자동집계(Open threads/Next steps)와 별개로,
> "지금 진행 중 / 다음에 시작 / 끝난 것"을 명시적으로 적는다.
>
> **현재 버전: v0.17.0 (배포됨)** · 다음: v0.18.0(Settings/Data 폴리시 등)

## 진행중
- [ ] **v0.16.0 + v0.17.0 실기기 검증 대기** (새 세션서 다음 로그로) — ① v0.16.0 소수점 클립이 전체값 담는지(`clip_decimal_kept`+길이) ② v0.17.0 A-hero 입력탭 가독성·정정표시 체감

## 다음에 시작 (v0.18.0+, 우선순위순)
- [ ] (UI) 🎨 **Settings/Data 화면 A-hero 톤 폴리시** — 75k/87k 회귀 위험 커서 v0.18.0 분리. 담당 Vance. (+CenterValueBurst 완전제거, 크로스-행 정정 직전값 보강, 칩 레일 리파인)
- [ ] (B) 텔레메트리 `previousValue` 키 분리(fired=baseline / corrected=직전셀값) — 오독 방지. 담당 Mack
- [ ] (C) `trend_skip:no_index` 태그명 정정(`cache_miss`). 담당 Mack
- [ ] (D) 추세 알람 **탈출 UX** 개선(정정 루프 마찰 — 검증 로직은 유지). 담당 Vance

## 대기 (실소음 현장 로그에서만 판정 가능)
- [ ] barge-in[IOS-6] — 스피커폰 가드 제거(A6) 후 실소음 끼어들기 (이번 조용한 테스트론 미실증)
- [ ] early-commit[STT-11] — `armed` 163건 배선 입증됨, 실소음서 조기확정 가치 측정
- [ ] BT↔스피커폰 실전환 / BT 실캡처[CLIP-LOSS-1] — 다음 비닐하우스/우천 로그
- [ ] silent token refresh(prompt:none) — 백로그
- [ ] AUDIO-ROUTE-1 네이티브셸 WKWebView STT 게이트 — 백로그

## 완료
- [x] **v0.17.0 배포** (2026-06-23) — 입력탭 A-hero 비주얼 폴리시(거대 mono 값·진행레일·정정표시). view/토큰 레이어만, 플로우 zero-diff, 회귀 407 passed. Claude Design A안
- [x] **v0.16.0 배포** (2026-06-23) — 소수점 재발화 클립 유실 수정 [CLIP-DECIMAL-FRAG-1]. 무재시작 방식(iOS concat 위험 회피), 회귀 28 passed. 실기기 audit 대기
- [x] **v0.15.0 실기기 로그 독립 재분석 + 직전 분석 비교** (2026-06-22) — 직전 모델 "추세 알림 루프 Critical"은 오판(의도적 스트레스 테스트 + 필드 오독), 데이터 무결성 완전 정상, 신규 클립 버그 발견
- [x] **Claude Design UI 핸드오프 검토** (2026-06-23) — "이대로 적용 ❌, 비주얼 폴리시만". 방향 A(hero) 채택
- [x] v0.15.0 배포 (safe-area·인증·일시정지 음성·추세 단일팝업·스피커폰 가드 제거 A6)
- [x] 작업 대시보드 무인 자동화 (API Token + SessionEnd 훅)
- [x] v0.14.0 배포 (이상치 재시도·클립 캡처회복·트림보강·영속화 미러·팝업중앙·저장시트 드롭다운)
- [x] v0.13.0 음성 클립 직접 청취(whisper 전사) 분석 + 7개 영역 릴리스
