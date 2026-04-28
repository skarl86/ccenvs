<div align="center">

# ccenvs

**[Claude Code](https://github.com/anthropics/claude-code) のための、これまで存在しなかったプロファイル管理ツール。**

`CLAUDE_CONFIG_DIR` の隔離されたプロファイルをワンコマンドで切り替え。各プロファイルは独自の設定、プラグイン、MCP サーバー、履歴を保持します。

[![npm version](https://img.shields.io/npm/v/ccenvs.svg?style=flat-square&color=cb3837)](https://www.npmjs.com/package/ccenvs)
[![npm downloads](https://img.shields.io/npm/dm/ccenvs.svg?style=flat-square&color=blue)](https://www.npmjs.com/package/ccenvs)
[![node](https://img.shields.io/node/v/ccenvs.svg?style=flat-square&color=success)](https://nodejs.org)
[![license](https://img.shields.io/npm/l/ccenvs.svg?style=flat-square)](https://opensource.org/licenses/MIT)

[English](./README.md) · [한국어](./README.ko.md) · **日本語** · [中文](./README.zh.md)

</div>

---

## なぜ必要か

Claude Code はすべて — 設定、プラグイン、MCP サーバー、セッション履歴、スラッシュコマンド — を単一の設定ディレクトリ（デフォルトは `~/.claude`）に保存します。これでは以下が困難です:

- 仕事用と個人用のコンテキストの分離
- メイン環境を汚さずに新しいプラグインの組み合わせをテスト
- 1 台のマシンで複数の Anthropic アカウントを管理
- 実験用の隔離されたプレイグラウンドを維持

`ccenvs` は `CLAUDE_CONFIG_DIR` を名前付きプロファイルでラップし、一語で切り替えられるようにします。

## 特徴

- **設定不要のブートストラップ** — `npx ccenvs init` だけで完了
- **ドロップイン互換** — 既存の `~/.claude-envs/` ディレクトリと互換
- **依存関係なし** — 単一ファイルの Node.js スクリプト
- **バイリンガル UI** — 韓国語・英語の出力、システムロケールを自動検出
- **冪等性** — `init` をどこで再実行しても安全

## インストール

```bash
# ワンショット、インストール不要
npx ccenvs init

# またはグローバルインストール
npm install -g ccenvs
ccenvs init
```

Node.js 18+ と [`claude` CLI](https://github.com/anthropics/claude-code) が必要です（`npm i -g @anthropic-ai/claude-code`）。

## クイックスタート

```bash
ccenvs init               # ブートストラップ（初回のみ）
ccenvs new work           # 'work' プロファイルを作成
ccenvs work               # 'work' プロファイルで claude を起動
ccenvs ls                 # 全プロファイルを一覧表示
ccenvs                    # デフォルトプロファイルで起動
```

Claude Code 内で `/plugin` を使ってプラグインをインストールすると、アクティブなプロファイルにスコープされます。

## コマンド

| コマンド                  | 説明                                                       |
| :------------------------ | :--------------------------------------------------------- |
| `ccenvs init`              | envs ディレクトリ + デフォルトプロファイル作成、`claude` 確認 |
| `ccenvs`                   | デフォルトプロファイルを起動                                |
| `ccenvs <name> [args...]`  | プロファイルで claude を起動（追加引数はそのまま渡される）   |
| `ccenvs ls`                | 全プロファイルを一覧表示                                    |
| `ccenvs new <name>`        | 新しいプロファイルを作成                                    |
| `ccenvs rm <name>`         | プロファイルを削除（確認プロンプトあり）                    |
| `ccenvs path <name>`       | プロファイルのディレクトリパスを表示                        |
| `ccenvs help`              | ヘルプを表示                                                |

`claude` は常に `--dangerously-skip-permissions` 付きで起動されます。

## 設定

| 変数                    | デフォルト         | 用途                                     |
| :---------------------- | :----------------- | :--------------------------------------- |
| `CLAUDE_ENVS_DIR`       | `~/.claude-envs`   | プロファイルディレクトリの場所           |
| `CCENVS_DEFAULT_PROFILE` | `default`          | 引数なしで `ccenvs` を実行する際のプロファイル |
| `CCENVS_LANG`            | （システムロケール） | 出力言語の強制指定: `en` または `ko`     |

## 仕組み

各プロファイルは `CLAUDE_ENVS_DIR` 配下のディレクトリに過ぎません。`ccenvs <name>` を実行すると、`CLAUDE_CONFIG_DIR` をそのディレクトリに設定し、`claude --dangerously-skip-permissions` を起動します。Claude Code はすべての状態をそこから読み書きします。

```
~/.claude-envs/
├── default/        # デフォルトプロファイル
├── work/           # 隔離された仕事用プロファイル
│   ├── settings.json
│   ├── plugins/
│   └── ...
└── personal/       # 隔離された個人用プロファイル
```

デーモンも、データベースも、魔法もありません。

## プラグインスコープ

Claude Code はプラグインのインストール時に 3 つのスコープをサポートします。ccenvs が隔離するのは **user** スコープのみで、`project` と `local` スコープは `<cwd>/.claude/` に保存され、同じディレクトリから起動したプロファイル間で共有されます:

| スコープ  | 保存場所                              | ccenvs で隔離?        |
| :-------- | :------------------------------------ | :-------------------- |
| `user`    | `$CLAUDE_CONFIG_DIR/settings.json`    | ✅ プロファイルごと    |
| `project` | `<cwd>/.claude/settings.json`         | ❌ 共有（CWD 単位）    |
| `local`   | `<cwd>/.claude/settings.local.json`   | ❌ 共有（CWD 単位）    |

カレントディレクトリで `.claude/settings*.json` が検出されると、ccenvs は一行の通知を stderr に出力します。完全なプロファイル隔離が必要な場合は、デフォルトの **user** スコープでプラグインをインストールしてください。

## ライセンス

[MIT](https://opensource.org/licenses/MIT)
