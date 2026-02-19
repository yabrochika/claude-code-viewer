export const sessionPresetIds = [
  "new-bug-collection",
  "latest-sync",
  "server-start",
  "test-case-creation",
  "test-case-review",
] as const;

export type SessionPresetId = (typeof sessionPresetIds)[number];

const TEST_CASE_CREATION_PROMPT = `QAエンジニアのAgentとして、以下の仕様でテストケースを作成してください。

【出力形式】
- TSV形式（コードブロック）で出力
- 1行目は必ず以下のヘッダーをそのまま使用
- 空欄は禁止。不明な場合は「不明」または「確認できない」を記載

テストケース名	モジュール・機能	優先度	前提条件	テスト手順	テストデータ	期待結果	状態	不具合ID	説明	想定時間（分）	事後条件	テストスイート	RTC-ID	Flow-ID	Layer	テスト種別	根拠コード	備考	プラットフォーム	端末	ドメイン	機能	実行方式	自動化状況

【テスト種別の許可値（いずれか1つ）】
- 正常系
- 異常系
- 非機能
- 初期確認
- データ整合性確認
- 状態遷移確認
- 運用確認
- 障害時確認
- 回帰

【Layerの許可値】
- Core
- Extended

【優先度の許可値】
- High
- Middium
- Low`;

const TEST_CASE_REVIEW_PROMPT = `QAエンジニアのAgentとして、添付資料にもとづいてテストケースレビューを実施し、結果を提示してください。

@c:\\Users\\市村寛子\\Documents\\fact-check-tmp-workspace\\ref-check-prompt.md
@c:\\Users\\市村寛子\\Documents\\fact-check-tmp-workspace\\content-check-plan.md
@c:\\Users\\市村寛子\\Documents\\fact-check-tmp-workspace\\content-check-prompt.md
@c:\\Users\\市村寛子\\Documents\\fact-check-tmp-workspace\\README.md
@c:\\Users\\市村寛子\\Documents\\fact-check-tmp-workspace\\ref-check-plan.md`;

const LATEST_SYNC_PROMPT = "git pull origin stagingで最新を反映して";
const SERVER_START_PROMPT =
  "@c:\\Users\\市村寛子\\Desktop\\server_local_environment_setup.md に従ってServerを起動して";

export const sessionPresets: Array<{
  id: SessionPresetId;
  label: string;
  initialMessage: string;
  colorHex: string;
}> = [
  {
    id: "new-bug-collection",
    label: "🐞 新規バグ収集",
    initialMessage: "新規バグ収集",
    colorHex: "#E53935",
  },
  {
    id: "latest-sync",
    label: "最新取得",
    initialMessage: LATEST_SYNC_PROMPT,
    colorHex: "#00BCD4",
  },
  {
    id: "server-start",
    label: "🚀 Server起動",
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
    id: "test-case-review",
    label: "🔍 テストケースレビュー",
    initialMessage: TEST_CASE_REVIEW_PROMPT,
    colorHex: "#43A047",
  },
];

export const getSessionPresetById = (presetId?: string) =>
  sessionPresets.find((preset) => preset.id === presetId);
