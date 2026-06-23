#!/usr/bin/env node
/**
 * 대시보드_AI_작업현황 — 데이터 집계기.
 *
 * 흩어진 마크다운(볼트 세션로그·Deliverables·My Life, 메모리 로드맵, 앱 레포의 버전·변경내역·
 * KNOWN-ISSUES, 수동 TODO 파일)을 읽어 프로젝트별로 구획한 단일 `dist/data.json`을 만든다.
 * 무프레임워크·무의존성(직접 파싱). 볼트는 마크다운 전용이라 이 생성기는 볼트 밖
 * (~/projects/mypka-dashboard/)에 산다.
 *
 * 프라이버시: 외부(Cloudflare Pages)로 게시되므로 화이트리스트 소스만 읽고, 저널/CRM/Documents는
 * 절대 읽지 않으며, 출력 직전 이메일 등 PII 패턴을 레닥션한다.
 */
import { readFileSync, readdirSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { join, basename } from 'node:path';
import { homedir } from 'node:os';

const HOME = homedir();
const VAULT = join(HOME, 'workspace_AI_PKA');
const LOGS = join(VAULT, 'Team Knowledge', 'session-logs');
const DELIVERABLES = join(VAULT, 'Deliverables');
const MYLIFE = join(VAULT, 'PKM', 'My Life');
const MEMORY = join(HOME, '.claude', 'projects', '-Users-kangmingoo-workspace-AI-PKA', 'memory');
const PROJECTS_ROOT = join(HOME, 'projects');
const TODOS = join(HOME, 'projects', 'mypka-dashboard', 'data', 'todos');
const OUT = join(HOME, 'projects', 'mypka-dashboard', 'dist', 'data.json');

const SELF = 'mypka-dashboard'; // 자기 자신은 프로젝트 목록에서 제외

// ─── 유틸 ────────────────────────────────────────────────────────────────────
function read(p) { try { return readFileSync(p, 'utf8'); } catch { return null; } }
function lsFiles(dir) { try { return readdirSync(dir).filter((f) => f.endsWith('.md')); } catch { return []; } }
function lsDirs(dir) {
  try { return readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name); }
  catch { return []; }
}

/** YAML frontmatter(단순 key: value)와 본문 분리. */
function parseFrontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { fm: {}, body: text };
  const fm = {};
  for (const line of m[1].split('\n')) {
    const mm = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (mm) fm[mm[1]] = mm[2].replace(/^["']|["']$/g, '').trim();
  }
  return { fm, body: m[2] };
}

/** 본문을 "## 헤딩" 단위로 분해. {heading: 내용} (헤딩 누락에 관대). */
function sectionsByH2(body) {
  const out = {};
  const re = /^##\s+(.+)$/gm;
  const idx = [];
  let m;
  while ((m = re.exec(body)) !== null) idx.push({ title: m[1].trim(), start: m.index + m[0].length });
  for (let i = 0; i < idx.length; i++) {
    const end = i + 1 < idx.length ? body.lastIndexOf('\n##', idx[i + 1].start) : body.length;
    out[idx[i].title] = body.slice(idx[i].start, end).trim();
  }
  return out;
}

/** 본문의 첫 "# 제목"(세션 테마). */
function firstH1(body) {
  const m = body.match(/^#\s+(.+)$/m);
  return m ? m[1].trim() : '';
}

/** 불릿 라인들을 배열로. 중첩·번호 포함, 빈 줄/문단 제거. */
function bullets(section, limit = 0) {
  if (!section) return [];
  const out = [];
  for (const raw of section.split('\n')) {
    const line = raw.trimEnd();
    const m = line.match(/^\s*[-*]\s+(.*)$/) || line.match(/^\s*\d+\.\s+(.*)$/) || line.match(/^\s*-\s*\[[ xX]\]\s*(.*)$/);
    if (m && m[1].trim()) out.push(collapse(m[1].trim()));
  }
  return limit > 0 ? out.slice(0, limit) : out;
}

/** 마크다운 강조/링크 흔적을 사람이 읽기 쉽게 정리(렌더는 클라이언트가 최소 처리). */
function collapse(s) {
  return s
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2')
    .replace(/\[\[([^\]]+)\]\]/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

/** PII 레닥션: 이메일·토큰류 제거(외부 게시 가드). */
function redact(s) {
  if (typeof s !== 'string') return s;
  return s
    .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, '[이메일 가림]')
    .replace(/\b(ya29|gho|ghp|sk|AIza)[A-Za-z0-9._-]{8,}\b/g, '[토큰 가림]');
}
function redactDeep(v) {
  if (typeof v === 'string') return redact(v);
  if (Array.isArray(v)) return v.map(redactDeep);
  if (v && typeof v === 'object') { const o = {}; for (const k of Object.keys(v)) o[k] = redactDeep(v[k]); return o; }
  return v;
}

// ─── 프로젝트 발견 ────────────────────────────────────────────────────────────
/** 코드 레포(package.json 또는 KNOWN-ISSUES 보유)를 프로젝트로. 자기 자신 제외. */
function discoverRepos() {
  const repos = [];
  for (const name of lsDirs(PROJECTS_ROOT)) {
    if (name === SELF) continue;
    const dir = join(PROJECTS_ROOT, name);
    const hasPkg = existsSync(join(dir, 'package.json'));
    const hasKI = existsSync(join(dir, 'KNOWN-ISSUES.md'));
    if (hasPkg || hasKI) repos.push({ id: name, name, dir, hasPkg, hasKI });
  }
  return repos;
}

/** 세션로그/딜리버러블 파일을 어느 프로젝트로 귀속할지: 알려진 slug 매칭, 없으면 'team-ops'. */
function classify(filenameOrId, projectIds) {
  const s = filenameOrId.toLowerCase();
  for (const id of projectIds) if (s.includes(id.toLowerCase())) return id;
  return 'team-ops';
}

// ─── 앱 레포: 버전 + 변경내역 + KNOWN-ISSUES ────────────────────────────────────
function repoVersion(dir) {
  const pkg = read(join(dir, 'package.json'));
  if (!pkg) return null;
  try { return JSON.parse(pkg).version ?? null; } catch { return null; }
}

/** README "## 변경 내역" 최신 N개: {version,date,summary,bullets}. */
function parseChangelog(dir, limit = 4) {
  const readme = read(join(dir, 'README.md'));
  if (!readme) return [];
  const idx = readme.search(/##\s*변경\s*내역/);
  if (idx < 0) return [];
  const section = readme.slice(idx);
  const lines = section.split('\n');
  const entries = [];
  let cur = null;
  for (const raw of lines) {
    const top = raw.match(/^-\s*\*\*v([0-9.]+)\*\*\s*(?:\(([^)]+)\))?\s*(?:[—-]\s*)?(.*)$/);
    if (top) {
      if (cur) entries.push(cur);
      cur = { version: top[1], date: (top[2] || '').trim(), summary: collapse(top[3] || ''), bullets: [] };
    } else if (cur) {
      const sub = raw.match(/^\s{2,}[-*]\s+(.*)$/);
      if (sub) cur.bullets.push(collapse(sub[1]));
      else if (/^##\s/.test(raw)) break; // 다음 섹션
    }
  }
  if (cur) entries.push(cur);
  return entries.slice(0, limit);
}

/** KNOWN-ISSUES: 상태 카운트 + ⚠️주시 항목(태그·제목·카테고리). */
function parseKnownIssues(dir) {
  const text = read(join(dir, 'KNOWN-ISSUES.md'));
  if (!text) return null;
  const counts = { fixed: 0, watching: 0, na: 0 };
  const watching = [];
  const lines = text.split('\n');
  let category = '';
  let lastHeading = null; // {tag,title}
  for (const raw of lines) {
    const cat = raw.match(/^##\s+([①-⑨].*)$/);
    if (cat) { category = collapse(cat[1]); continue; }
    const h = raw.match(/^###\s+\[([^\]]+)\]\s+(.*)$/);
    if (h) { lastHeading = { tag: h[1], title: collapse(h[2]), category }; continue; }
    const st = raw.match(/현재 상태:\*\*\s*(✅|⚠️|➖)/);
    if (st) {
      if (st[1] === '✅') counts.fixed++;
      else if (st[1] === '⚠️') { counts.watching++; if (lastHeading) watching.push(lastHeading); }
      else counts.na++;
    }
  }
  return { counts, watching };
}

// ─── 세션 로그 ────────────────────────────────────────────────────────────────
function collectSessionFiles() {
  const out = [];
  for (const year of lsDirs(LOGS)) {
    for (const month of lsDirs(join(LOGS, year))) {
      const dir = join(LOGS, year, month);
      for (const f of lsFiles(dir)) {
        if (f === '_template.md') continue;
        out.push(join(dir, f));
      }
    }
  }
  return out;
}

function parseSession(path) {
  const text = read(path);
  if (!text) return null;
  const { fm, body } = parseFrontmatter(text);
  const sec = sectionsByH2(body);
  const file = basename(path);
  // 날짜: frontmatter timestamp 우선, 없으면 파일명 앞 YYYY-MM-DD
  let date = (fm.timestamp || '').slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) { const m = file.match(/(\d{4}-\d{2}-\d{2})/); date = m ? m[1] : ''; }
  return {
    file,
    sessionId: fm.session_id || file.replace(/\.md$/, ''),
    type: fm.type || 'close-session',
    date,
    theme: firstH1(body),
    whatWeDid: bullets(sec['What we did'], 6),
    decisions: bullets(sec['Decisions made'], 5),
    openThreads: bullets(sec['Open threads'] || sec['Open threads (실기기 테스트 = 새 세션에서 이어받음)'] || sec['Open threads (실기기 = 새 세션에서 이어받음)']),
    nextSteps: bullets(sec['Next steps']),
  };
}

// ─── 수동 TODO 파일 ───────────────────────────────────────────────────────────
/** data/todos/<id>.md 의 체크박스를 상태별로. (## 진행중 / ## 대기 / ## 완료) */
function parseTodoFile(id) {
  const text = read(join(TODOS, `${id}.md`));
  if (!text) return null;
  const sec = sectionsByH2(text);
  const pick = (names) => { for (const n of names) if (sec[n]) return checkboxes(sec[n]); return []; };
  return {
    inProgress: pick(['진행중', 'In Progress', '진행 중']),
    pending: pick(['대기', 'Pending', '다음', 'Next']),
    done: pick(['완료', 'Done']),
  };
}
function checkboxes(section) {
  const out = [];
  for (const raw of section.split('\n')) {
    const m = raw.match(/^\s*-\s*\[([ xX])\]\s*(.*)$/);
    if (m && m[2].trim()) out.push({ done: m[1].toLowerCase() === 'x', text: collapse(m[2].trim()) });
  }
  return out;
}

// ─── My Life (PKM 일부 — Goals/Projects만) ─────────────────────────────────────
function parseMyLifeNote(dir, name) {
  const text = read(join(dir, name));
  if (!text) return null;
  const { fm, body } = parseFrontmatter(text);
  const firstPara = body.split('\n').map((l) => l.trim()).find((l) => l && !l.startsWith('#') && !l.startsWith('|') && !l.startsWith('-'));
  return { id: name.replace(/\.md$/, ''), title: fm.title || name.replace(/\.md$/, ''), status: fm.status || '', summary: collapse(firstPara || '') };
}
function collectMyLife() {
  const goals = lsFiles(join(MYLIFE, 'Goals')).filter((f) => f !== 'INDEX.md').map((f) => parseMyLifeNote(join(MYLIFE, 'Goals'), f)).filter(Boolean);
  const projects = lsFiles(join(MYLIFE, 'Projects')).filter((f) => f !== 'INDEX.md').map((f) => parseMyLifeNote(join(MYLIFE, 'Projects'), f)).filter(Boolean);
  return { goals, projects };
}

// ─── Deliverables (요약만) ─────────────────────────────────────────────────────
function collectDeliverables() {
  return lsFiles(DELIVERABLES).map((f) => {
    const m = f.match(/^(\d{4}-\d{2}-\d{2})-(.*)\.md$/);
    return { file: f, date: m ? m[1] : '', title: collapse((m ? m[2] : f.replace(/\.md$/, '')).replace(/-/g, ' ')) };
  }).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
}

// ─── 메모리 로드맵 ────────────────────────────────────────────────────────────
function roadmapFor(id) {
  const f = join(MEMORY, `${id}-improvement-roadmap.md`);
  const text = read(f);
  if (!text) return null;
  const { fm } = parseFrontmatter(text);
  return collapse(fm.description || '');
}

// ─── 조립 ────────────────────────────────────────────────────────────────────
function build() {
  const repos = discoverRepos();
  const repoIds = repos.map((r) => r.id);
  const myLife = collectMyLife();
  const mlProjectIds = myLife.projects.map((p) => p.id);
  const knownProjectIds = [...new Set([...repoIds, ...mlProjectIds])];

  // 프로젝트 골격 (코드 레포 + team-ops 항상 포함)
  const projects = {};
  const ensure = (id, name) => (projects[id] = projects[id] || {
    id, name: name || id, version: null, isRepo: false,
    roadmap: null, changelog: [], knownIssues: null,
    sessions: [], openThreads: [], nextSteps: [], todos: null,
    pkm: { goals: [], projects: [] }, deliverables: [],
  });

  for (const r of repos) {
    const p = ensure(r.id, r.name);
    p.isRepo = true;
    p.version = repoVersion(r.dir);
    p.changelog = parseChangelog(r.dir);
    p.knownIssues = parseKnownIssues(r.dir);
    p.roadmap = roadmapFor(r.id);
  }
  ensure('team-ops', '팀 운영 (채용·리서치·공통)');

  // 세션 로그 귀속
  const sessFiles = collectSessionFiles().map(parseSession).filter(Boolean)
    .sort((a, b) => (b.date || '').localeCompare(a.date || '') || b.sessionId.localeCompare(a.sessionId));
  for (const s of sessFiles) {
    const pid = classify(`${s.file} ${s.sessionId}`, knownProjectIds);
    const p = ensure(pid);
    p.sessions.push({ date: s.date, sessionId: s.sessionId, theme: s.theme, type: s.type, whatWeDid: s.whatWeDid, decisions: s.decisions });
  }

  // 미해결/다음단계: 각 프로젝트의 "가장 최근 세션"에서 추출(현 상태 = 최신 핸드오프)
  for (const s of sessFiles) {
    const pid = classify(`${s.file} ${s.sessionId}`, knownProjectIds);
    const p = projects[pid];
    if (p && p.openThreads.length === 0 && (s.openThreads.length || s.nextSteps.length)) {
      p.openThreads = s.openThreads.map((t) => ({ text: t, source: s.date }));
      p.nextSteps = s.nextSteps.map((t) => ({ text: t, source: s.date }));
    }
  }

  // 수동 TODO 병합
  for (const id of Object.keys(projects)) projects[id].todos = parseTodoFile(id);

  // PKM(My Life) — survey-011 등 코드 프로젝트와 이름이 같으면 그 카드에, 아니면 team-ops로 묶음
  for (const g of myLife.goals) {
    const pid = projects['team-ops'] ? 'team-ops' : 'team-ops';
    ensure(pid).pkm.goals.push(g);
  }
  for (const pr of myLife.projects) {
    if (projects[pr.id]) projects[pr.id].pkm.projects.push(pr);
    else ensure('team-ops').pkm.projects.push(pr);
  }

  // Deliverables → team-ops (요약 목록)
  ensure('team-ops').deliverables = collectDeliverables();

  // 정렬: 코드 레포 먼저(세션 수 많은 순), team-ops 마지막
  const ordered = Object.values(projects).sort((a, b) => {
    if (a.id === 'team-ops') return 1;
    if (b.id === 'team-ops') return -1;
    return (b.sessions.length) - (a.sessions.length);
  });

  return { generatedAt: new Date().toISOString(), projects: ordered };
}

const data = redactDeep(build());
writeFileSync(OUT, JSON.stringify(data, null, 2));
const totalSessions = data.projects.reduce((n, p) => n + p.sessions.length, 0);
console.log(`✅ data.json 생성 — 프로젝트 ${data.projects.length}개, 세션 ${totalSessions}개 → ${OUT}`);
for (const p of data.projects) {
  console.log(`   • ${p.name}: v${p.version ?? '-'} | 세션 ${p.sessions.length} | 미해결 ${p.openThreads.length} | KI ⚠️${p.knownIssues?.counts.watching ?? 0}`);
}
