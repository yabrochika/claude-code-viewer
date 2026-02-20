export const sessionPresetIds = [
  "latest-sync",
  "server-start",
  "test-case-creation",
] as const;

export type SessionPresetId = (typeof sessionPresetIds)[number];

const TEST_CASE_CREATION_PROMPT = `As a QA engineer agent, create test cases according to the specification below.

[Output format]
- Output in TSV format (inside a code block)
- Use the following header exactly as-is for the first row
- Empty values are not allowed. If unknown, write "Unknown" or "Cannot be confirmed"

Test Case Name	Module/Feature	Priority	Prerequisites	Test Steps	Test Data	Expected Result	Status	Bug ID	Description	Estimated Time (min)	Postconditions	Test Suite	RTC-ID	Flow-ID	Layer	Test Type	Code Reference	Notes	Platform	Device	Domain	Function	Execution Method	Automation Status

[Allowed values for Test Type (choose exactly one)]
- Normal
- Abnormal
- Non-functional
- Initial check
- Data consistency check
- State transition check
- Operational check
- Failure scenario check
- Regression

[Allowed values for Layer]
- Core
- Extended

[Allowed values for Priority]
- High
- Medium
- Low`;

const LATEST_SYNC_PROMPT =
  "Run git pull origin staging to sync the latest changes.";
const SERVER_START_PROMPT =
  "Start the server by following @server_local_environment_setup.md.";

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
    label: "📝 Create Test Cases",
    initialMessage: TEST_CASE_CREATION_PROMPT,
    colorHex: "#1E88E5",
  },
];

export const getSessionPresetById = (presetId?: string) =>
  sessionPresets.find((preset) => preset.id === presetId);
