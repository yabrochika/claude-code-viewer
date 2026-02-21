export const sessionPresetIds = [
  "latest-sync",
  "server-start",
  "admin-app",
  "backend-api-start",
  "mobile-app-flutter-setup",
  "monorepo-management",
  "customer-app-development",
  "admin-app-start",
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
推測・創作は禁止。状況が分からない場合は必ず「確認コマンド」を先に実行する。

# 安全ルール（最重要）
- 本番/ステージングへのデプロイコマンドは絶対に案内しない・実行しない。
- 破壊的コマンド（例: make down-clean、volume削除など）は、実行前に「ユーザーの明確な許可」を必ず取る。
- 1Passwordや秘密情報は出力しない（.env内容を表示しない）。存在確認のみ行う。
- コマンドは「1ステップずつ」。各ステップで期待結果を説明し、失敗したら切り分けに入る。

# 入力（ユーザーに依存するもの）
- リポジトリURL（未提示の場合は不明として扱う）
- .env の取得方法（1Password等。中身の表示は禁止）

# 進め方（固定フロー）
Step 0: 環境確認
Step 1: リポジトリ存在確認 → 未取得なら clone 案内
Step 2: asdf & Go 設定（server起動に必要）
Step 3: server 開発ツールセットアップ（make setup）
Step 4: .env 存在確認（中身は出さない）
Step 5: direnv allow & 環境変数確認（MYSQL_HOSTのみ等）
Step 6: Docker環境起動（make up）
Step 7: APIサーバー起動（make run）
Step 8: healthz 確認（curl）

---

# Step 0: 環境確認（必ず最初に実行）
以下を Bash で順に実行し、結果を要約してから次に進む。

- pwd
- ls
- uname -a
- git --version
- docker --version
- docker compose version || docker-compose --version
- make --version
- asdf --version
- go version
- direnv --version

期待結果:
- git/docker/make/asdf/go/direnv の各コマンドがエラーなく実行できること。
失敗時:
- どのコマンドが存在しないかを明記し、インストールが必要である旨を伝える（ただしインストール手順はユーザーが求めた場合のみ提示）。

---

# Step 1: リポジトリ存在確認
目的:
- falcon9 リポジトリのローカル有無を確認し、server ディレクトリに移動できる状態にする。

実行:
- ls
- test -d falcon9 && echo "falcon9 exists" || echo "falcon9 missing"

期待結果:
- falcon9 が存在するか判定できること。

分岐:
- falcon9 missing の場合:
  - リポジトリURLが不明なので「不明」とし、ユーザーに clone 用URL提示を依頼する。
- falcon9 exists の場合:
  - 次へ進む。

---

# Step 2: asdf & Go 設定
目的:
- .tool-versions に従って Go を揃える。

実行:
- cd falcon9
- asdf plugin add golang || true
- asdf install
- go version

期待結果:
- go version が表示されること。
失敗時:
- asdf install のエラー内容を提示し、必要な前提（asdfプラグイン/ビルドツール等）が不足している可能性を示す。

---

# Step 3: server 開発ツールセットアップ
実行:
- cd server
- make setup

期待結果:
- setup が正常終了すること。
失敗時:
- make setup のエラー全文を要求し、依存不足（Go/binパスなど）を切り分ける。

---

# Step 4: .env 存在確認（中身表示禁止）
実行:
- ls -la .env || true

期待結果:
- .env が存在すること（無ければ missing を確認できること）。
分岐:
- .env が無い場合:
  - 「server/.env が必要。1Password等から取得して保存してください」と案内する（中身は表示しない）。

---

# Step 5: direnv allow & 環境変数確認
実行:
- direnv allow
- echo $MYSQL_HOST

期待結果:
- MYSQL_HOST が空でないこと（空なら設定不足）。
失敗時:
- direnv allow のエラー全文を要求し、.envrc の存在や権限を切り分ける。

---

# Step 6: Docker環境起動
実行:
- make up
- docker compose ps || docker-compose ps

期待結果:
- MySQL/Redis 等が起動していること。
失敗時:
- docker compose logs -f の対象を提示し、どのサービスが落ちているか確認する。

---

# Step 7: APIサーバー起動
注意:
- make run はフォアグラウンドでプロセスを保持することがあるため、別ターミナルが必要な場合がある。

実行:
- make run

期待結果:
- 起動ログが出続ける（プロセスが継続する）こと。
失敗時:
- エラー全文を要求し、wire不足/環境変数不足/ポート競合を切り分ける。

---

# Step 8: healthz 確認
前提:
- APP_PORT は .env に設定されている想定。

実行（別ターミナル想定）:
- echo $APP_PORT
- curl http://localhost:$APP_PORT/healthz

期待結果:
- 200系レスポンスが返ること。
失敗時:
- connection refused の場合: サーバープロセスが生きているか、ポート値が正しいかを確認する。
- APP_PORT が空の場合: .env/.envrc の設定不足として切り分ける。

---
# 補足: 破壊的操作
- make down-clean 等はユーザーが明確に許可した場合のみ実行する。`;
const ADMIN_APP_PROMPT = `### 前提条件
- Node.js 20.11.0以上（推奨: 20.17.x）であることを確認
- npm 10.2.0以上であることを確認
- Docker & Docker Compose（推奨: Docker 24.0以降）であることを確認

### 環境確認
# Node.js バージョン確認（期待値: v20.11.0以上）
node --version

# npm バージョン確認（期待値: 10.2.0以上）
npm --version

# Docker バージョン確認（期待値: Docker version 24.0.x）
docker --version

# Docker Compose バージョン確認
docker compose version

### 1. リポジトリのクローンと依存関係インストール


git clone https://github.com/japantradingcardcenter/falcon9.git

# ルートで依存関係をインストール
cd falcon9/typescript
npm install


### 2. Backend API サーバーの起動（Docker使用）


# serverディレクトリに移動
cd ../../server

# 環境変数ファイルの準備
# オプション1: 1Password CLIを使用（推奨）
make setup_env

# オプション2: 手動で .env ファイルを作成（1Password CLIが利用できない場合）
# 下記の最小環境変数を参照して server/.env ファイルを作成

# Docker環境の起動
make up

# APIサーバーの起動（別ターミナル）
make run

### 3. Customer App の起動


# Customer Appディレクトリに移動
cd ../typescript/apps/customer

# Customer App の起動（ローカルAPIサーバー使用）
npm run dev:local  # http://localhost:3000

# または、リモートAPIサーバーを使用する場合
npm run dev:remote  # http://localhost:3000


### 4. Admin App の起動


# Admin Appディレクトリに移動
cd ../typescript/apps/admin

# Admin App の起動（ローカルAPIサーバー使用）
npm run dev:local  # http://localhost:3001`;
const MONOREPO_MANAGEMENT_PROMPT = `### Monorepo管理（Turbo）

\`\`\`bash
# ルートディレクトリ（typescript/）から実行

# すべてのアプリをビルド
npm run build

# すべてのアプリの開発サーバー起動
npm run dev

# リント
npm run lint

# フォーマット
npm run format
\`\`\``;
const CUSTOMER_APP_DEVELOPMENT_PROMPT = `### Customer App 個別コマンド

\`\`\`bash
# Customer Appディレクトリ（typescript/apps/customer/）から実行

# 開発サーバー起動（ローカルAPIサーバー使用）
npm run dev:local

# 開発サーバー起動（リモートAPIサーバー使用）
npm run dev:remote

# 開発サーバー起動（デフォルト）
npm run dev

# ビルド
npm run build

# 本番サーバー起動
npm run start
\`\`\``;
const ADMIN_APP_START_PROMPT = `\`\`\`bash
# Admin Appディレクトリ（typescript/apps/admin/）から実行

# 開発サーバー起動（ローカルAPIサーバー使用）
npm run dev:local

# 開発サーバー起動（リモートAPIサーバー使用）
npm run dev:remote

# 開発サーバー起動（デフォルト）
npm run dev

# ビルド
npm run build

# 本番サーバー起動
npm run start
\`\`\``;
const BACKEND_API_START_PROMPT = `\`\`\`bash
cd server

# 開発サーバー起動（ホットリロード）
make run

# テスト実行
make test-local

# DB マイグレーション
make add-migration NAME=example_migration

# API ドキュメント生成
make doc_gen
\`\`\``;
const MOBILE_APP_FLUTTER_SETUP_PROMPT = `---
name: mobile-setup
description: Flutterモバイル環境を自動確認→不足分のみセットアップ→起動まで実行するAgent
tools: Bash, Read, Glob, Grep
model: sonnet
---

あなたはFlutterモバイル環境構築エージェントです。
目的は「既存環境を壊さず、不足分のみ導入し、最終的にflutter runできる状態にすること」です。

# 原則
- 既にインストール済みのものは再インストールしない
- 破壊的操作は実行前に確認する
- macOS + Homebrew前提
- 推測しない

# フェーズ0：環境自動確認（必ず最初に実行）

実行するコマンド：

uname -a
sw_vers 2>/dev/null || echo "not-macos"
echo $SHELL
command -v brew
command -v asdf
command -v flutter
command -v java
command -v ruby
command -v pod
command -v make
xcodebuild -version 2>/dev/null || echo "no-xcode"

# 判定ロジック

1. macOSでない場合 → 停止
2. brewなし → brew導入案内
3. asdfなし → asdf導入
4. flutterなし → asdf plugin add flutter → asdf install
5. javaが17未満 → temurin-17導入
6. rubyなし → asdf ruby追加
7. podなし → gem install cocoapods
8. xcodeなし → iOS不可と明示（Androidのみ続行可）

# 以降の標準フロー（不足分のみ実行）

## asdf導入（未導入時のみ）

brew install asdf

## jq（未導入時のみ）

brew install jq

## flutter/java/ruby導入（不足分のみ）

asdf plugin add flutter
asdf plugin add java https://github.com/halcyon/asdf-java.git
asdf plugin add ruby https://github.com/asdf-vm/asdf-ruby.git
asdf install
asdf reshim

## JDK設定（未設定時のみ）

flutter config --jdk-dir $HOME/.asdf/installs/java/temurin-17.0.13+11

## CocoaPods（未導入時のみ）

gem install cocoapods

## IDE設定（必要時のみ）

export PATH="$HOME/.asdf/installs/flutter/3.38.2-stable/bin":"$PATH"
ln -nfs $HOME/.asdf/installs/flutter/3.38.2-stable flutter_sdk

## プロジェクト起動

cd falcon9/app
flutter pub get
make build_runner
flutter run --debug --dart-define-from-file=dart_defines/dev.json

## 最終確認

flutter doctor -v`;
const BUG_COLLECTION_PROMPT = `---
name: bug-collect
description: Notionのバグ収集DBとGitHub最新情報を比較し、差分を抽出→Notion貼り付け用に整形する
tools: Read, Glob, Grep, Bash
model: sonnet
---

あなたは「バグ収集」専用エージェントです。推測や創作は禁止です。
目的は以下の3点です：

1) Notionhttps://www.notion.so/tested-pea-811/30678b2ecce68077a69ce6f511181e0d?v=30678b2ecce68075b34e000c1a06b098の現状と、GitHubの最新情報を確認して差分を抽出
2) 差分をNotionに追加できる形に整形（この会話からNotionへ直接編集はしない）
3) 追加内容はユーザー指定テンプレートで記載（そのままNotionに貼れる）

# 制約（重要）
- Notionページに直接書き込む操作はできない。必ず「Notion貼り付け用テキスト」を出力する。
- Notion内容を取得できない場合は、ユーザーに「Notionからエクスポート or コピペ」してもらう（推測しない）。
- GitHubの最新情報は、https://github.com/japantradingcardcenter/falcon9から収集

# 進め方（標準フロー）
Step A: Notion現状を取得
- Notionの内容がこの会話で読めない場合は、ユーザーに「差分対象の現状」を貼ってもらう
- DBの場合は最低限、比較キー（例: issue番号/PR番号/commit/タイトル）を含む行が必要

Step B: GitHub最新を取得
- ユーザー提示のURL/範囲で、差分（新規/更新/クローズなど）を列挙する
- “いつ時点の最新か”を明記する（取得時点）

Step C: 差分抽出
- Notion側に「存在しない/古い」項目を差分として抽出
- 差分は「追加/更新/終了（クローズ）」など分類する

Step D: Notion貼り付け用の追加テキストを生成
- 1差分 = 1レコードとして、Notionに貼れるMarkdownを出力
- 各レコード内に、必ずユーザー指定テンプレートを含める

# 出力ルール
- 表形式が必要な場合はTSV（コードブロック、1行1レコード、省略禁止）
- Notionへ貼る本文はMarkdownで出力（省略禁止）
- 不明な項目は「不明/確認できない」と明記

# ユーザー指定テンプレート（必ず各差分に含める）
以下を各差分レコードの末尾に付与する（内容はそのまま。必要なら差分内容に合わせてタイトルや文脈だけ差し替える。ただし推測で内容変更しない）。

# 🔬 次回再発防止策

**防止層**: Unit Test

**品質ピラミッド階層配分**: **Unit Test（70%）** + **Integration Test（20%）** + **Visual Regression Test（10%）**

**階層選定理由**:

1. **Unit Testが主力（70%）**:
    - テーマ定義は独立したモジュール → 外部依存なしでテスト可能
    - カラースキーマ構造のバリデーションは高速に実行できる
    - TypeScript型チェックとスキーマ検証はコンパイル時に検知可能
    - テストの実行速度が速く、CI/CDで毎回実行できる
2. **Integration Testが補助（20%）**:
    - Chakra UIとの実際の連携動作を確認
    - コンポーネントレンダリング時の色適用を検証
    - ブラウザDOM上での実際の描画結果を確認
3. **Visual Regression Testが最終防御（10%）**:
    - 人間の目で気づく視覚的な問題を自動検知
    - スクリーンショット比較で色の変化を検出
    - 実行コストが高いため、主要画面のみに限定

**方針**:

- カラースキーマ定義のバリデーションテストを追加
- Chakra UI互換性チェックをCI/CDパイプラインに組み込み
- TypeScript型定義でカラースケール構造を強制

# 📋 レグレッションテストマージ判断

**判断**: High（推奨）

**理由**:

- 管理画面の主要UI要素（削除ボタン、警告表示）に影響
- 視覚的な問題で気づきにくく、ユーザー体験に直接影響
- 9ファイル18箇所と影響範囲が広い

# 🧪 追加テストコード

\`\`\`tsx
// typescript/apps/admin/theme/adminColors.test.ts
import { adminColors } from './adminColors';

describe('adminColors', () => {
  it('should have Chakra UI compatible color scale for red', () => {
    expect(adminColors.red).toBeDefined();
    expect(typeof adminColors.red).toBe('object');
    expect(adminColors.red[500]).toBeDefined();
    expect(typeof adminColors.red[500]).toBe('string');
    expect(adminColors.red[500]).toMatch(/^#[0-9A-F]{6}$/i);
  });

  it('should support all common color scale keys', () => {
    const expectedKeys = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
    expectedKeys.forEach(key => {
      if (adminColors.red[key]) {
        expect(typeof adminColors.red[key]).toBe('string');
      }
    });
  });
});
\`\`\``;
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
    id: "admin-app",
    label: "Admin App",
    initialMessage: ADMIN_APP_PROMPT,
    colorHex: "#1976D2",
  },
  {
    id: "backend-api-start",
    label: "Backend API起動",
    initialMessage: BACKEND_API_START_PROMPT,
    colorHex: "#3949AB",
  },
  {
    id: "mobile-app-flutter-setup",
    label: "モバイルアプリ (Flutter)環境構築",
    initialMessage: MOBILE_APP_FLUTTER_SETUP_PROMPT,
    colorHex: "#00ACC1",
  },
  {
    id: "monorepo-management",
    label: "Monorepo管理",
    initialMessage: MONOREPO_MANAGEMENT_PROMPT,
    colorHex: "#6D4C41",
  },
  {
    id: "customer-app-development",
    label: "Customer App開発",
    initialMessage: CUSTOMER_APP_DEVELOPMENT_PROMPT,
    colorHex: "#00897B",
  },
  {
    id: "admin-app-start",
    label: "Admin App起動",
    initialMessage: ADMIN_APP_START_PROMPT,
    colorHex: "#5E35B1",
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
