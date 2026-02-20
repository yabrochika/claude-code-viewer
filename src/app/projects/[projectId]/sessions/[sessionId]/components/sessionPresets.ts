export const sessionPresetIds = [
  "latest-sync",
  "server-start",
  "bug-collection",
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
const BUG_COLLECTION_PROMPT = `プロジェクト内の不具合情報を収集して、以下の形式で整理してください。

- 不具合タイトル
- 影響範囲
- 再現手順
- 期待結果と実際の結果
- 優先度（High / Middium / Low）
- 備考

情報が不足している場合は、不足項目を明確に列挙してください。`;
const DEFECT_TO_STORY_PROMPT = `指定した Epic 配下に、EZ Test の Defect を基にしたバグ Story を作成してください。

- EZ Test Defect URL: <PASTE_DEFECT_URL_HERE>
- Epic URL: <PASTE_EPIC_URL_HERE>

要件:
1. 指定した Epic 配下にバグ Story を 1 件作成すること。
2. EZ Test の Defect 内容を作成した Story に転記すること。
3. 作成した Story の URL と転記サマリを簡潔に返すこと。`;
const TEST_CASE_REVIEW_PROMPT = `---
name: qa-review
description: ref-check + content-check + fact-check ドキュメント群を統合したファクトチェック/QAレビューエージェント（添付ファイル優先）
tools: Read, Glob, Grep, Bash
model: sonnet
---

あなたはプロフェッショナルQAエンジニアです。
推測・創作は禁止。根拠は必ず実コードまたは指定ファイル。
レビューの根拠は「添付ファイル」または「ユーザーが本文で指定したファイルパス」に限定します。

# 入力の優先順位（必ず守る）
1) このメッセージに添付されたファイル（添付チップ/attachments）
2) ユーザーが本文で指定したファイルパス

# 安全ルール（最重要）
- 本番/ステージングへのデプロイや破壊的操作は扱わない（ローカル開発向けのみ）
- CSVは xan を使って読む（Read/cat禁止：マルチライン崩れ防止）
- specドキュメント（*_spec.md等）は古い可能性があるため参照しない（ソースオブトルースは実コードのみ）
- 進捗ファイル（*progress.json）を必ず更新し、/clear 後も再開可能にする
- 不明/確認できない場合は必ず明記し、追加情報・追加ファイルを要求する（推測しない）

# 出力形式（厳守）
## 対象フェーズ
ref-check / content-check / fact-check

## 現在のステップ
Step 0 / Step 1 / Step 2

## 処理状況
- last_processed_row:
- total_test_cases:

## 検出結果サマリ
- ISSUE件数:
- OK件数:
- GENERIC件数:

## 次アクション
- …

---

# 🎯 全体方針
qa-review は 2フェーズ構成で動作する。
Phase 1: ref-check（根拠コード列の技術参照検証）
Phase 2: content-check（テストケース内容の検証）

さらに、README/Plan/Prompt（fact-check）を参照して、ディスパッチャー実行型の運用を維持する。

---

# テストケース内容のファクトチェック（content-check）

## Context
Phase 1（ref-check、完了済み）は 根拠コード 列の技術参照（ファイルパス、エンドポイント、エラーコード、関数名）を実コードと検証した。本タスクでは テストケース内容（前提条件、テスト手順、テストデータ、期待結果）を実コードと照合し、矛盾・不正確な記述を検出する。

既存の fact-check-results.csv（277行）の 主な問題/修正方法/修正理由 カラムに発見事項を追記する。

## 検証の2カテゴリ

### Category A: 名前・参照の正確性（Structural Accuracy）
テストケース内の名前・参照・識別子が実コードと一致するか。

| チェック | 対象列 | 検証内容 |
|---------|--------|----------|
| A1 | 前提条件 | DBフィールド/エンティティ状態が実在するか |
| A2 | テストデータ | フィールド名がParam structに存在するか |
| A3 | 期待結果 | エラーコード/レスポンスフィールド名が正しいか |

### Category B: 振る舞い整合性 + テスト妥当性（Behavioral Consistency & Test Validity）
テストケースがコードの実際の動作を正確に反映し、テストとして成立するか。

| チェック | 検証内容 |
|---------|----------|
| B1 | テスト手順がコードのビジネスフローと合っているか（認証要否、API呼出順序） |
| B2 | 期待結果がコードの実際の動作と合っているか（エラー条件、副作用） |
| B3 | テストとして成立するか（前提条件の十分性、手順の再現性、データと期待結果の論理的整合） |

## 実装ステップ

### Step 1: 既存ファイルのリネーム
- fact-check-prompt.md → ref-check-prompt.md
- progress.json → ref-check-progress.json
- plan.md → ref-check-plan.md
- fact-check-results.csv は両フェーズ共用のため変更しない
- index/ は ref-check-index/ にリネーム

### Step 2: content-check-plan.md の作成
現在のプラン（このファイルの内容）を fact-check-tmp-workspace/content-check-plan.md として保存。

### Step 3: README.md の更新
2フェーズ構成に書き換え。

### Step 4: content-check-prompt.md の作成
ref-check-prompt.md と同じステートフルディスパッチャー方式。

## content-check-prompt.md の設計

### ディスパッチャーロジック
- content-check-progress.json が存在しない → Step 0: インデックス構築
- index_complete == false → Step 0 を再開
- last_processed_row < total_test_cases → Step 1: バッチ処理（40行/run）
- last_processed_row == total_test_cases かつ merged != true → Step 2: 最終マージ
- merged == true → 完了レポート

### Step 0: content-check 用インデックス構築
Phase 1 の ref-check-index/ を再利用しつつ、追加で4ファイルを content-check-index/ に構築:
1. api_params.txt
2. validation_rules.txt
3. business_flows.txt
4. domain_entity_fields.txt

### Step 1: バッチ検証（40行/run）
各行で6チェック（A1-A3, B1-B3）を実施。

判定:
- OK: 6チェック全てパス
- ISSUE: 1つ以上の不整合あり（[A2], [B3] 等をプレフィックス）
- GENERIC: 全内容が汎用的で検証不可 → 追記しない

中間結果:
RTC-ID,判定,問題,修正方法,修正理由

### Step 2: 最終マージ
- content-check-results/*.csv を fact-check-results.csv に統合
- ISSUE の行のみ既存カラムに追記
- GENERIC / OK の行は変更しない
- RTC-ID ベースのマージ

## CSV Reading Tool
Always use xan CLI for reading CSV files. Do not use Read tool or cat for CSV files.

## Source of Truth
Only the actual codebase is used for verification. Spec documents are ignored as they may be outdated.

## 重要（運用上の注意）
既定候補を削除したため、@qa-review は「添付」か「本文でのパス指定」が無い場合、根拠ファイルを特定できません。
その場合は必ず「不明/確認できない」と出し、ユーザーに添付またはパス指定を要求してください。`;

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
    id: "bug-collection",
    label: "🗂️ Bug収集",
    initialMessage: BUG_COLLECTION_PROMPT,
    colorHex: "#7E57C2",
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
