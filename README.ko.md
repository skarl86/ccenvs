<div align="center">

# ccenvs

**[Claude Code](https://github.com/anthropics/claude-code)에 빠져있던 프로필 매니저.**

격리된 `CLAUDE_CONFIG_DIR` 프로필을 명령어 한 줄로 전환하세요. 각 프로필은 자체 설정, 플러그인, MCP 서버, 히스토리를 갖습니다.

[![npm version](https://img.shields.io/npm/v/ccenvs.svg?style=flat-square&color=cb3837)](https://www.npmjs.com/package/ccenvs)
[![npm downloads](https://img.shields.io/npm/dm/ccenvs.svg?style=flat-square&color=blue)](https://www.npmjs.com/package/ccenvs)
[![node](https://img.shields.io/node/v/ccenvs.svg?style=flat-square&color=success)](https://nodejs.org)
[![license](https://img.shields.io/npm/l/ccenvs.svg?style=flat-square)](https://opensource.org/licenses/MIT)

[English](./README.md) · **한국어** · [日本語](./README.ja.md) · [中文](./README.zh.md)

</div>

---

## 왜 필요한가요

Claude Code는 모든 것 — 설정, 플러그인, MCP 서버, 세션 히스토리, 슬래시 명령어 — 을 단일 설정 디렉터리(기본 `~/.claude`)에 저장합니다. 이 구조는 다음을 어렵게 만듭니다:

- 업무용과 개인용 컨텍스트 분리
- 메인 환경을 오염시키지 않고 새 플러그인 조합 테스트
- 한 머신에서 여러 Anthropic 계정 관리
- 실험을 위한 격리된 플레이그라운드 유지

`ccenvs`는 `CLAUDE_CONFIG_DIR`을 이름 붙은 프로필로 감싸서, 한 단어로 전환할 수 있게 합니다.

## 특징

- **제로 설정 부트스트랩** — `npx ccenvs init` 한 번이면 끝
- **드롭인 호환** — 기존 `~/.claude-envs/` 디렉터리와 그대로 호환
- **의존성 0개** — 단일 파일 Node.js 스크립트
- **이중 언어 UI** — 한국어/영어 출력, 시스템 로케일 자동 감지
- **멱등성** — `init` 어디서 다시 실행해도 안전

## 설치

```bash
# 한 번만 실행, 설치 불필요
npx ccenvs init

# 또는 글로벌 설치
npm install -g ccenvs
ccenvs init
```

Node.js 18+ 와 [`claude` CLI](https://github.com/anthropics/claude-code) 가 필요합니다 (`npm i -g @anthropic-ai/claude-code`).

## 빠른 시작

```bash
ccenvs init               # 부트스트랩 (최초 1회)
ccenvs new work           # 'work' 프로필 생성
ccenvs work               # 'work' 프로필로 claude 실행
ccenvs ls                 # 모든 프로필 목록
ccenvs                    # 기본 프로필로 실행
```

Claude Code 안에서 `/plugin`으로 플러그인을 설치하면 활성 프로필 범위로 적용됩니다.

## 명령어

| 명령어                    | 설명                                                      |
| :------------------------ | :-------------------------------------------------------- |
| `ccenvs init`              | envs 디렉터리 + 기본 프로필 생성, `claude` 확인           |
| `ccenvs`                   | 기본 프로필로 실행                                        |
| `ccenvs <이름> [인자...]`  | 프로필로 claude 실행 (추가 인자 그대로 전달)              |
| `ccenvs ls`                | 모든 프로필 목록                                          |
| `ccenvs new <이름>`        | 새 프로필 생성                                            |
| `ccenvs rm <이름>`         | 프로필 삭제 (확인 프롬프트)                               |
| `ccenvs path <이름>`       | 프로필 디렉터리 경로 출력                                 |
| `ccenvs help`              | 도움말 표시                                               |

`claude`는 항상 `--dangerously-skip-permissions`로 실행됩니다.

## 환경 변수

| 변수                    | 기본값             | 용도                                     |
| :---------------------- | :----------------- | :--------------------------------------- |
| `CLAUDE_ENVS_DIR`       | `~/.claude-envs`   | 프로필 디렉터리 위치                     |
| `CCENVS_DEFAULT_PROFILE` | `default`          | 인자 없이 `ccenvs` 실행 시 사용할 프로필  |
| `CCENVS_LANG`            | (시스템 로케일)    | 출력 언어 강제: `en` 또는 `ko`           |

## 동작 원리

각 프로필은 `CLAUDE_ENVS_DIR` 아래의 디렉터리일 뿐입니다. `ccenvs <이름>` 실행 시 `CLAUDE_CONFIG_DIR`를 해당 디렉터리로 설정하고 `claude --dangerously-skip-permissions`를 띄웁니다. Claude Code는 모든 상태를 그곳에서 읽고 씁니다.

```
~/.claude-envs/
├── default/        # 기본 프로필
├── work/           # 격리된 업무 프로필
│   ├── settings.json
│   ├── plugins/
│   └── ...
└── personal/       # 격리된 개인 프로필
```

데몬도, 데이터베이스도, 마법도 없습니다.

## 라이선스

[MIT](https://opensource.org/licenses/MIT)
