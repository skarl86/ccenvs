#!/usr/bin/env node
import { existsSync, mkdirSync, readdirSync, statSync, rmSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { createInterface } from 'node:readline';

const lang = (
  process.env.CCENVS_LANG ||
  Intl.DateTimeFormat().resolvedOptions().locale ||
  'en'
).toLowerCase().startsWith('ko') ? 'ko' : 'en';

const messages = {
  en: {
    initHeader: 'ccenvs init — bootstrapping',
    initEnvsDir: 'envs directory',
    initDefaultProfile: 'default profile',
    initClaudeBinary: 'claude binary',
    statusCreated: '[created]',
    statusExists:  '[exists] ',
    statusFound:   '[found]  ',
    statusMissing: '[missing]',
    initComplete: 'Setup complete. Next steps:',
    nextLaunch: 'launch default profile',
    nextNew: 'create a profile',
    nextLs: 'list profiles',
    placeholderName: '<name>',
    overrideEnvsPath: 'Override envs path:',
    forceLanguage: 'Force language:   ',
    claudeMissingHint: 'install: npm i -g @anthropic-ai/claude-code',
    noEnvs: '(no profiles — ccenvs new <name>)',
    exists: (n) => `already exists: ${n}`,
    created: (d) => `created: ${d}`,
    nextRunHint: (n) => `next: ccenvs ${n}    # then /plugin to install plugins`,
    noSuchEnv: (n) => `no such profile: ${n}`,
    confirmDelete: (d) => `delete ${d} ? [y/N] `,
    removed: (n) => `removed: ${n}`,
    cancelled: 'cancelled',
    autoCreatedDefault: (d) => `(auto-created default profile: ${d})`,
    runHintNew: (n) => `try: ccenvs new ${n}`,
    usageNew: 'usage: ccenvs new <name>',
    usageRm: 'usage: ccenvs rm <name>',
    usagePath: 'usage: ccenvs path <name>',
    helpTitle: 'ccenvs — Claude Code profile manager (claude --dangerously-skip-permissions)',
    helpRows: [
      ['ccenvs init',              'create envs dir + default profile, check claude'],
      ['ccenvs',                   'launch default profile'],
      ['ccenvs <name> [args...]',  'launch claude with profile'],
      ['ccenvs ls',                'list profiles'],
      ['ccenvs new <name>',        'create profile'],
      ['ccenvs rm <name>',         'delete profile'],
      ['ccenvs path <name>',       'print profile path'],
      ['ccenvs help',              'show this help'],
    ],
    helpEnvHeader: 'Environment:',
    claudeNotFoundRun: 'claude binary not found.',
  },
  ko: {
    initHeader: 'ccenvs init — 초기 설정 시작',
    initEnvsDir: '환경 디렉터리',
    initDefaultProfile: '기본 프로필',
    initClaudeBinary: 'claude 바이너리',
    statusCreated: '[생성]',
    statusExists:  '[있음]',
    statusFound:   '[확인]',
    statusMissing: '[없음]',
    initComplete: '설정 완료. 다음 단계:',
    nextLaunch: '기본 프로필로 실행',
    nextNew: '새 프로필 생성',
    nextLs: '프로필 목록 보기',
    placeholderName: '<이름>',
    overrideEnvsPath: '설정 위치 변경:',
    forceLanguage: '언어 강제 지정:',
    claudeMissingHint: '설치: npm i -g @anthropic-ai/claude-code',
    noEnvs: '(프로필 없음 — ccenvs new <이름>)',
    exists: (n) => `이미 존재: ${n}`,
    created: (d) => `생성됨: ${d}`,
    nextRunHint: (n) => `다음: ccenvs ${n}    # 실행 후 /plugin 으로 플러그인 설치`,
    noSuchEnv: (n) => `프로필 없음: ${n}`,
    confirmDelete: (d) => `삭제할까요? ${d} [y/N] `,
    removed: (n) => `삭제됨: ${n}`,
    cancelled: '취소됨',
    autoCreatedDefault: (d) => `(기본 프로필 자동 생성: ${d})`,
    runHintNew: (n) => `시도: ccenvs new ${n}`,
    usageNew: '사용법: ccenvs new <이름>',
    usageRm: '사용법: ccenvs rm <이름>',
    usagePath: '사용법: ccenvs path <이름>',
    helpTitle: 'ccenvs — Claude Code 프로필 관리 (claude --dangerously-skip-permissions)',
    helpRows: [
      ['ccenvs init',               'envs 디렉터리/기본 프로필 생성, claude 확인'],
      ['ccenvs',                    '기본 프로필로 실행'],
      ['ccenvs <이름> [인자...]',   '프로필로 claude 실행'],
      ['ccenvs ls',                 '프로필 목록'],
      ['ccenvs new <이름>',         '프로필 생성'],
      ['ccenvs rm <이름>',          '프로필 삭제'],
      ['ccenvs path <이름>',        '프로필 경로 출력'],
      ['ccenvs help',               '도움말'],
    ],
    helpEnvHeader: '환경 변수:',
    claudeNotFoundRun: 'claude 바이너리를 찾을 수 없습니다.',
  },
};

const t = (key, ...args) => {
  const v = messages[lang][key] ?? messages.en[key];
  return typeof v === 'function' ? v(...args) : v;
};

const ENVS_DIR = process.env.CLAUDE_ENVS_DIR || join(homedir(), '.claude-envs');
const DEFAULT_PROFILE = process.env.CCENVS_DEFAULT_PROFILE || 'default';
const CLAUDE_ARGS = ['--dangerously-skip-permissions'];

function visualWidth(s) {
  let w = 0;
  for (const c of s) {
    const cp = c.codePointAt(0);
    w += (cp >= 0x1100 && (
      cp <= 0x115f ||
      (cp >= 0x2e80 && cp <= 0x9fff) ||
      (cp >= 0xa960 && cp <= 0xa97f) ||
      (cp >= 0xac00 && cp <= 0xd7a3) ||
      (cp >= 0xf900 && cp <= 0xfaff) ||
      (cp >= 0xff00 && cp <= 0xff60) ||
      (cp >= 0xffe0 && cp <= 0xffe6)
    )) ? 2 : 1;
  }
  return w;
}

function pad(s, n) {
  return s + ' '.repeat(Math.max(0, n - visualWidth(s)));
}

function whichClaude() {
  const cmd = process.platform === 'win32' ? 'where' : 'which';
  const r = spawnSync(cmd, ['claude'], { encoding: 'utf8' });
  if (r.status !== 0) return null;
  return r.stdout.split('\n')[0].trim() || null;
}

function claudeVersion() {
  const r = spawnSync('claude', ['--version'], { encoding: 'utf8' });
  if (r.status !== 0) return null;
  return r.stdout.trim().split('\n')[0] || null;
}

function cmdInit() {
  console.log(t('initHeader'));
  console.log();

  const envsExisted = existsSync(ENVS_DIR);
  if (!envsExisted) mkdirSync(ENVS_DIR, { recursive: true });
  console.log(`  ${envsExisted ? t('statusExists') : t('statusCreated')}  ${pad(t('initEnvsDir'), 20)} ${ENVS_DIR}`);

  const defaultDir = join(ENVS_DIR, DEFAULT_PROFILE);
  const defaultExisted = existsSync(defaultDir);
  if (!defaultExisted) mkdirSync(defaultDir, { recursive: true });
  console.log(`  ${defaultExisted ? t('statusExists') : t('statusCreated')}  ${pad(t('initDefaultProfile'), 20)} ${defaultDir}`);

  const claudePath = whichClaude();
  if (claudePath) {
    const ver = claudeVersion();
    const verStr = ver ? `  (${ver})` : '';
    console.log(`  ${t('statusFound')}  ${pad(t('initClaudeBinary'), 20)} ${claudePath}${verStr}`);
  } else {
    console.log(`  ${t('statusMissing')}  ${pad(t('initClaudeBinary'), 20)} ${t('claudeMissingHint')}`);
  }

  console.log();
  console.log(t('initComplete'));
  const newCmd = `ccenvs new ${t('placeholderName')}`;
  console.log(`  ${pad('ccenvs', 22)} ${t('nextLaunch')}`);
  console.log(`  ${pad(newCmd, 22)} ${t('nextNew')}`);
  console.log(`  ${pad('ccenvs ls', 22)} ${t('nextLs')}`);
  console.log();
  console.log(`  ${pad(t('overrideEnvsPath'), 22)} CLAUDE_ENVS_DIR`);
  console.log(`  ${pad(t('forceLanguage'), 22)} CCENVS_LANG=${lang === 'ko' ? 'en' : 'ko'}`);
}

function cmdLs() {
  if (!existsSync(ENVS_DIR)) { console.log(t('noEnvs')); return; }
  const dirs = readdirSync(ENVS_DIR).filter((n) => {
    try { return statSync(join(ENVS_DIR, n)).isDirectory(); } catch { return false; }
  });
  if (!dirs.length) { console.log(t('noEnvs')); return; }
  for (const d of dirs) console.log(`  ${d}`);
}

function cmdNew(name) {
  if (!name) die(t('usageNew'));
  const dir = join(ENVS_DIR, name);
  if (existsSync(dir)) die(t('exists', name));
  mkdirSync(dir, { recursive: true });
  console.log(t('created', dir));
  console.log(t('nextRunHint', name));
}

async function cmdRm(name) {
  if (!name) die(t('usageRm'));
  const dir = join(ENVS_DIR, name);
  if (!existsSync(dir)) die(t('noSuchEnv', name));
  const ans = await prompt(t('confirmDelete', dir));
  if (/^y$/i.test(ans.trim())) {
    rmSync(dir, { recursive: true, force: true });
    console.log(t('removed', name));
  } else {
    console.log(t('cancelled'));
  }
}

function cmdPath(name) {
  if (!name) die(t('usagePath'));
  console.log(join(ENVS_DIR, name));
}

function cmdRun(name, args) {
  const dir = join(ENVS_DIR, name);
  if (!existsSync(dir)) {
    if (name === DEFAULT_PROFILE) {
      mkdirSync(dir, { recursive: true });
      console.error(t('autoCreatedDefault', dir));
    } else {
      console.error(t('noSuchEnv', name));
      console.error(t('runHintNew', name));
      process.exit(1);
    }
  }
  const child = spawn('claude', [...CLAUDE_ARGS, ...args], {
    stdio: 'inherit',
    env: { ...process.env, CLAUDE_CONFIG_DIR: dir },
  });
  child.on('error', (err) => {
    if (err.code === 'ENOENT') {
      console.error(`${t('claudeNotFoundRun')} ${t('claudeMissingHint')}`);
      process.exit(127);
    }
    console.error(err.message);
    process.exit(1);
  });
  child.on('exit', (code, signal) => {
    if (signal) process.kill(process.pid, signal);
    else process.exit(code ?? 0);
  });
}

function cmdHelp() {
  console.log(t('helpTitle'));
  console.log();
  for (const [cmd, desc] of t('helpRows')) {
    console.log(`  ${pad(cmd, 28)} ${desc}`);
  }
  console.log();
  console.log(t('helpEnvHeader'));
  console.log(`  CLAUDE_ENVS_DIR         ${ENVS_DIR}`);
  console.log(`  CCENVS_DEFAULT_PROFILE  ${DEFAULT_PROFILE}`);
  console.log(`  CCENVS_LANG             ${lang}`);
}

function die(msg) { console.error(msg); process.exit(1); }

function prompt(q) {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    rl.question(q, (ans) => { rl.close(); resolve(ans); });
  });
}

const argv = process.argv.slice(2);
const sub = argv[0];

if (!sub) {
  cmdRun(DEFAULT_PROFILE, []);
} else if (sub.startsWith('-')) {
  if (sub === '-h' || sub === '--help') cmdHelp();
  else cmdRun(DEFAULT_PROFILE, argv);
} else {
  switch (sub) {
    case 'init':                    cmdInit(); break;
    case 'ls': case 'list':         cmdLs(); break;
    case 'new': case 'add':         cmdNew(argv[1]); break;
    case 'rm': case 'remove': case 'del': await cmdRm(argv[1]); break;
    case 'path':                    cmdPath(argv[1]); break;
    case 'help':                    cmdHelp(); break;
    default:                        cmdRun(sub, argv.slice(1));
  }
}
