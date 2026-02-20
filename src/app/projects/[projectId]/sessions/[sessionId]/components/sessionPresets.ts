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
const SERVER_START_PROMPT =
  "サーバー起動は @server_local_environment_setup.md の手順に従って実施してください。";
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
    label: "🚀 Start Server",
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
