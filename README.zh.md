<div align="center">

# ccenvs

**[Claude Code](https://github.com/anthropics/claude-code) 缺失的配置管理工具。**

用一条命令在隔离的 `CLAUDE_CONFIG_DIR` 配置之间切换。每个配置都有独立的设置、插件、MCP 服务器和历史记录。

[![npm version](https://img.shields.io/npm/v/ccenvs.svg?style=flat-square&color=cb3837)](https://www.npmjs.com/package/ccenvs)
[![npm downloads](https://img.shields.io/npm/dm/ccenvs.svg?style=flat-square&color=blue)](https://www.npmjs.com/package/ccenvs)
[![node](https://img.shields.io/node/v/ccenvs.svg?style=flat-square&color=success)](https://nodejs.org)
[![license](https://img.shields.io/npm/l/ccenvs.svg?style=flat-square)](https://opensource.org/licenses/MIT)

[English](./README.md) · [한국어](./README.ko.md) · [日本語](./README.ja.md) · **中文**

</div>

---

## 为什么需要它

Claude Code 把所有东西 — 设置、插件、MCP 服务器、会话历史、斜杠命令 — 都存在一个配置目录下（默认是 `~/.claude`）。这让以下场景变得困难:

- 分离工作和个人上下文
- 测试新插件组合而不污染主环境
- 在一台机器上管理多个 Anthropic 账户
- 为实验保留隔离的沙盒

`ccenvs` 通过将 `CLAUDE_CONFIG_DIR` 包装为命名配置来解决这个问题,你可以用一个词在它们之间切换。

## 特性

- **零配置启动** — `npx ccenvs init` 即可完成
- **直接兼容** — 与现有的 `~/.claude-envs/` 目录无缝兼容
- **零依赖** — 单文件 Node.js 脚本
- **双语界面** — 韩语和英语输出,根据系统区域自动检测
- **幂等** — 在任何地方重新运行 `init` 都是安全的

## 安装

```bash
# 一次性运行,无需安装
npx ccenvs init

# 或全局安装
npm install -g ccenvs
ccenvs init
```

需要 Node.js 18+ 和 [`claude` CLI](https://github.com/anthropics/claude-code)(`npm i -g @anthropic-ai/claude-code`)。

## 快速开始

```bash
ccenvs init               # 初始化(只需一次)
ccenvs new work           # 创建 'work' 配置
ccenvs work               # 用 'work' 配置启动 claude
ccenvs ls                 # 列出所有配置
ccenvs                    # 启动默认配置
```

在 Claude Code 内通过 `/plugin` 安装插件 — 它们会作用于当前激活的配置。

## 命令

| 命令                      | 说明                                                       |
| :------------------------ | :--------------------------------------------------------- |
| `ccenvs init`              | 创建 envs 目录 + 默认配置,检查 `claude`                    |
| `ccenvs`                   | 启动默认配置                                                |
| `ccenvs <name> [args...]`  | 用某个配置启动 claude(额外参数会透传)                       |
| `ccenvs ls`                | 列出所有配置                                                |
| `ccenvs new <name>`        | 创建新配置                                                  |
| `ccenvs rm <name>`         | 删除配置(带确认)                                            |
| `ccenvs path <name>`       | 打印配置的目录路径                                          |
| `ccenvs help`              | 显示帮助                                                    |

`claude` 始终以 `--dangerously-skip-permissions` 启动。

## 配置项

| 变量                    | 默认值             | 用途                                     |
| :---------------------- | :----------------- | :--------------------------------------- |
| `CLAUDE_ENVS_DIR`       | `~/.claude-envs`   | 配置目录的位置                           |
| `CCENVS_DEFAULT_PROFILE` | `default`          | 不带参数运行 `ccenvs` 时使用的配置        |
| `CCENVS_LANG`            | (系统区域)         | 强制输出语言: `en` 或 `ko`               |

## 工作原理

每个配置只是 `CLAUDE_ENVS_DIR` 下的一个目录。运行 `ccenvs <name>` 时,会把 `CLAUDE_CONFIG_DIR` 设置为该目录,然后启动 `claude --dangerously-skip-permissions`。Claude Code 会从那里读写所有状态。

```
~/.claude-envs/
├── default/        # 默认配置
├── work/           # 隔离的工作配置
│   ├── settings.json
│   ├── plugins/
│   └── ...
└── personal/       # 隔离的个人配置
```

没有守护进程,没有数据库,没有魔法。

## 许可证

[MIT](https://opensource.org/licenses/MIT)
