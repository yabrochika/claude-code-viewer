export const sessionPresetIds = [
  "latest-sync",
  "server-start",
  "test-case-creation",
  "defect-to-story",
  "test-case-review",
] as const;

export type SessionPresetId = (typeof sessionPresetIds)[number];

const TEST_CASE_CREATION_PROMPT = `QAエンジニアとして、以下の仕様でテストケースを作成してください。

[出力形式]
- コードブロック内でTSV形式で出力すること
- 1行目のヘッダーは以下を厳密に使用すること
- 空欄は禁止。情報が不足している場合も必ず記載すること
- 「状態」は必ず ACTIVE を入れること

テストケース名	モジュール・機能	優先度	前提条件	テスト手順	テストデータ	期待結果	状態	不具合ID	説明	想定時間（分）	事後条件	テストスイート	RTC-ID	Flow-ID	Layer	テスト種別	根拠コード	備考	プラットフォーム	端末	ドメイン	機能	実行方式	自動化状況

[テスト種別]
以下から適切なものを1つ選択すること:
- 正常系
- 異常系
- 非機能
- 初期確認
- データ整合性確認
- 状態遷移確認
- 運用確認
- 障害時確認
- 回帰

[Layer]
以下のいずれかを指定すること:
- Smoke
- Core
- Extended

[優先度]
以下のいずれかを指定すること:
- High
- Middium
- Low`;

const LATEST_SYNC_PROMPT =
  "最新変更を同期するため、git pull origin staging を実行してください。";
const SERVER_START_PROMPT = `---
name: server-launch
description: Falcon9 Serverのローカル環境構築～起動～ヘルスチェックまでを、安全にコマンド実行しながらガイドする
tools: Bash, Read, Glob, Grep
model: sonnet
---

あなたは「Falcon9 Server」ローカル環境の起動支援エージェントです。
目的は **ローカル開発環境の日常作業**（Docker/DB/Redis起動、API起動、healthz確認）です。
推測・創作は禁止。状況が分からない場合は必ず質問するか、確認コマンドを先に実行する。

# 安全ルール（最重要）
- 本番/ステージングへのデプロイコマンドは絶対に案内しない・実行しない。
- 破壊的コマンド（例: make down-clean、volume削除など）は、実行前に「ユーザーの明確な許可」を必ず取る。
- 1Passwordや秘密情報は出力しない（.env内容を表示しない）。存在確認のみ行う。
- コマンドは「1ステップずつ」。各ステップで期待結果を説明し、失敗したら切り分けに入る。

# 進め方（基本）
- まず「現在の作業ディレクトリ」「OS/シェル環境」「必須ツール有無」を確認する
- OKなら Quick Start を順番に実行（setup → env → direnv → make up → make run → curl /healthz）
- 途中で詰まったら Troubleshooting に沿って原因切り分け

# このエージェントが案内する対象ドキュメント（ユーザー提供）
以下のガイド内容を“ローカル起動の手順”として扱う（本番デプロイは含めない）。

---
# Falcon9 Server アプリケーション ローカル環境構築ガイド

> **⚠️ 重要な注意事項**: このドキュメントはローカル開発環境での日常的な作業を対象としています。
> ステージング環境や本番環境への直接デプロイコマンドは、事故防止のため記載していません。
> 本番環境へのリリースはCI/CDパイプラインを通じて管理されています。

このドキュメントは、Falcon9 ServerアプリケーションのGo言語バックエンドAPI（Clean Architecture）のローカル開発環境を構築するためのガイドです。

## 📋 概要

- **Server**: Go言語 バックエンドAPI (\`server/\`)
- **アーキテクチャ**: Clean Architecture
- **データベース**: MySQL 8.0 + Redis 7.0
- **Docker**: 開発環境のインフラ管理

## 🚀 クイックスタート

### 前提条件

以下のツールが必要です：

- **asdf** の確認
- **direnv**の確認
- **Docker & Docker Compose**の確認
- **Make**の確認
- **Git**の確認

### 1. リポジトリのクローンと移動

asdf plugin add golang || true
asdf install

go version

cd server

### 2. 開発ツールのセットアップ
make setup

### 3. 環境変数の設定
falcon9/server/.env を確認

### 4. direnvの設定
cd server
direnv allow
echo $MYSQL_HOST

### 5. Docker環境の起動
make up

### 6. APIサーバーの起動
make run

### 7. 動作確認
curl http://localhost:$APP_PORT/healthz`;
const DEFECT_TO_STORY_PROMPT = `指定した Epic 配下に、EZ Test の Defect を基にしたバグ Story を作成してください。

- EZ Test Defect URL: <PASTE_DEFECT_URL_HERE>
- Epic URL: <PASTE_EPIC_URL_HERE>

要件:
1. 指定した Epic 配下にバグ Story を 1 件作成すること。
2. EZ Test の Defect 内容を作成した Story に転記すること。
3. 作成した Story の URL と転記サマリを簡潔に返すこと。`;
const TEST_CASE_REVIEW_PROMPT = `QA エンジニアとして、添付資料を基に対象テストケースをレビューし、指摘事項を報告してください。

@c:\\Users\\市村寛子\\Documents\\fact-check-tmp-workspace\\content-check-plan.md
@c:\\Users\\市村寛子\\Documents\\fact-check-tmp-workspace\\content-check-prompt.md
@c:\\Users\\市村寛子\\Documents\\fact-check-tmp-workspace\\README.md
@c:\\Users\\市村寛子\\Documents\\fact-check-tmp-workspace\\ref-check-plan.md
@c:\\Users\\市村寛子\\Documents\\fact-check-tmp-workspace\\ref-check-prompt.md`;

export const sessionPresets: Array<{
  id: SessionPresetId;
  label: string;
  initialMessage: string;
  colorHex: string;
}> = [
  {
    id: "latest-sync",
    label: "Latest Sync",
    initialMessage: LATEST_SYNC_PROMPT,
    colorHex: "#00BCD4",
  },
  {
    id: "server-start",
    label: "🚀 Server Launch",
    initialMessage: SERVER_START_PROMPT,
    colorHex: "#FB8C00",
  },
  {
    id: "test-case-creation",
    label: "📝 テストケース作成",
    initialMessage: TEST_CASE_CREATION_PROMPT,
    colorHex: "#1E88E5",
  },
  {
    id: "defect-to-story",
    label: "🐞 DefectをStory化",
    initialMessage: DEFECT_TO_STORY_PROMPT,
    colorHex: "#E53935",
  },
  {
    id: "test-case-review",
    label: "🔍 テストケースレビュー",
    initialMessage: TEST_CASE_REVIEW_PROMPT,
    colorHex: "#43A047",
  },
];

export const getSessionPresetById = (presetId?: string) =>
  sessionPresets.find((preset) => preset.id === presetId);
