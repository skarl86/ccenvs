<div align="center">

# ccenvs

**The missing profile manager for [Claude Code](https://github.com/anthropics/claude-code).**

Switch between isolated `CLAUDE_CONFIG_DIR` profiles with one command. Each profile keeps its own settings, plugins, MCP servers, and history.

[![npm version](https://img.shields.io/npm/v/ccenvs.svg?style=flat-square&color=cb3837)](https://www.npmjs.com/package/ccenvs)
[![npm downloads](https://img.shields.io/npm/dm/ccenvs.svg?style=flat-square&color=blue)](https://www.npmjs.com/package/ccenvs)
[![node](https://img.shields.io/node/v/ccenvs.svg?style=flat-square&color=success)](https://nodejs.org)
[![license](https://img.shields.io/npm/l/ccenvs.svg?style=flat-square)](https://opensource.org/licenses/MIT)

**English** · [한국어](./README.ko.md) · [日本語](./README.ja.md) · [中文](./README.zh.md)

</div>

---

## Why

Claude Code stores everything — settings, plugins, MCP servers, session history, slash commands — under a single config directory (`~/.claude` by default). That makes it hard to:

- Separate work and personal contexts
- Test new plugin combinations without polluting your main setup
- Manage multiple Anthropic accounts on one machine
- Keep an isolated playground for experiments

`ccenvs` solves this by wrapping `CLAUDE_CONFIG_DIR` into named profiles you can switch with a single word.

## Features

- **Zero-config bootstrap** — `npx ccenvs init` and you're done
- **Drop-in compatible** — works with existing `~/.claude-envs/` directories
- **No dependencies** — single-file Node.js script
- **Bilingual UI** — Korean and English output, auto-detected from system locale
- **Idempotent** — safe to re-run `init` anywhere

## Install

```bash
# one-shot, no install
npx ccenvs init

# or install globally
npm install -g ccenvs
ccenvs init
```

Requires Node.js 18+ and the [`claude` CLI](https://github.com/anthropics/claude-code) (`npm i -g @anthropic-ai/claude-code`).

## Quick start

```bash
ccenvs init               # bootstrap (one time)
ccenvs new work           # create a 'work' profile
ccenvs work               # launch claude with the 'work' profile
ccenvs ls                 # list all profiles
ccenvs                    # launch the default profile
```

Inside Claude Code, install plugins via `/plugin` — they're scoped to the active profile.

## Commands

| Command                   | Description                                              |
| :------------------------ | :------------------------------------------------------- |
| `ccenvs init`              | Create envs dir + default profile, check `claude`        |
| `ccenvs`                   | Launch the default profile                               |
| `ccenvs <name> [args...]`  | Launch claude with a profile (extra args passed through) |
| `ccenvs ls`                | List all profiles                                        |
| `ccenvs new <name>`        | Create a new profile                                     |
| `ccenvs rm <name>`         | Delete a profile (with confirmation)                     |
| `ccenvs path <name>`       | Print a profile's directory path                         |
| `ccenvs help`              | Show help                                                |

`claude` is always launched with `--dangerously-skip-permissions`.

## Configuration

| Variable                | Default            | Purpose                                  |
| :---------------------- | :----------------- | :--------------------------------------- |
| `CLAUDE_ENVS_DIR`       | `~/.claude-envs`   | Where profile directories live           |
| `CCENVS_DEFAULT_PROFILE` | `default`          | Profile used when running bare `ccenvs`   |
| `CCENVS_LANG`            | (system locale)    | Force output language: `en` or `ko`      |

## How it works

Each profile is just a directory under `CLAUDE_ENVS_DIR`. When you run `ccenvs <name>`, it sets `CLAUDE_CONFIG_DIR` to that directory and spawns `claude --dangerously-skip-permissions`. Claude Code reads/writes all its state there.

```
~/.claude-envs/
├── default/        # default profile
├── work/           # isolated work profile
│   ├── settings.json
│   ├── plugins/
│   └── ...
└── personal/       # isolated personal profile
```

No daemons, no databases, no magic.

## Plugin scopes

Claude Code supports three scopes when installing plugins. ccenvs only isolates **user** scope — `project` and `local` scope live in `<cwd>/.claude/` and are shared across profiles launched from the same directory:

| Scope     | Stored in                            | Isolated by ccenvs?  |
| :-------- | :----------------------------------- | :------------------- |
| `user`    | `$CLAUDE_CONFIG_DIR/settings.json`   | ✅ per profile        |
| `project` | `<cwd>/.claude/settings.json`        | ❌ shared (CWD)       |
| `local`   | `<cwd>/.claude/settings.local.json`  | ❌ shared (CWD)       |

When ccenvs detects `.claude/settings*.json` in the current directory, it prints a one-line stderr notice as a reminder. For full per-profile isolation, install plugins with the default **user** scope.

## License

[MIT](https://opensource.org/licenses/MIT)
