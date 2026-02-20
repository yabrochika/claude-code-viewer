import { z } from "zod";

// Request Schemas

export const CommitRequestSchema = z.object({
  files: z.array(z.string().min(1)).min(1),
  message: z.string().trim().min(1),
});

export const CommitAndPushRequestSchema = CommitRequestSchema;
export const CreateWorktreeRequestSchema = z.object({
  repositoryPath: z.string().min(1),
  worktreeName: z.string().trim().min(1),
  baseBranch: z.string().trim().min(1),
  targetPath: z.string().min(1),
});

// Response Schemas - Commit

export const CommitResultSuccessSchema = z.object({
  success: z.literal(true),
  commitSha: z.string().length(40),
  filesCommitted: z.number().int().positive(),
  message: z.string(),
});

export const CommitResultErrorSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  errorCode: z.enum([
    "EMPTY_MESSAGE",
    "NO_FILES",
    "PROJECT_NOT_FOUND",
    "NOT_A_REPOSITORY",
    "HOOK_FAILED",
    "GIT_COMMAND_ERROR",
  ]),
  details: z.string().optional(),
});

export const CommitResultSchema = z.discriminatedUnion("success", [
  CommitResultSuccessSchema,
  CommitResultErrorSchema,
]);

// Response Schemas - Push

export const PushResultSuccessSchema = z.object({
  success: z.literal(true),
  remote: z.string(),
  branch: z.string(),
  objectsPushed: z.number().int().optional(),
});

export const PushResultErrorSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  errorCode: z.enum([
    "PROJECT_NOT_FOUND",
    "NOT_A_REPOSITORY",
    "NO_UPSTREAM",
    "NON_FAST_FORWARD",
    "AUTH_FAILED",
    "NETWORK_ERROR",
    "TIMEOUT",
    "GIT_COMMAND_ERROR",
  ]),
  details: z.string().optional(),
});

export const PushResultSchema = z.discriminatedUnion("success", [
  PushResultSuccessSchema,
  PushResultErrorSchema,
]);

// Response Schemas - Commit and Push

export const CommitAndPushResultSuccessSchema = z.object({
  success: z.literal(true),
  commitSha: z.string().length(40),
  filesCommitted: z.number().int().positive(),
  message: z.string(),
  remote: z.string(),
  branch: z.string(),
});

export const CommitAndPushResultErrorSchema = z.object({
  success: z.literal(false),
  commitSucceeded: z.boolean(),
  commitSha: z.string().length(40).optional(),
  error: z.string(),
  errorCode: z.enum([
    "EMPTY_MESSAGE",
    "NO_FILES",
    "PROJECT_NOT_FOUND",
    "NOT_A_REPOSITORY",
    "HOOK_FAILED",
    "GIT_COMMAND_ERROR",
    "NO_UPSTREAM",
    "NON_FAST_FORWARD",
    "AUTH_FAILED",
    "NETWORK_ERROR",
    "TIMEOUT",
  ]),
  details: z.string().optional(),
});

export const CommitAndPushResultSchema = z.discriminatedUnion("success", [
  CommitAndPushResultSuccessSchema,
  CommitAndPushResultErrorSchema,
]);

export const CreateWorktreeResultSuccessSchema = z.object({
  success: z.literal(true),
  repositoryPath: z.string(),
  branchName: z.string(),
  baseBranch: z.string(),
  targetPath: z.string(),
});

export const CreateWorktreeResultErrorSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  details: z.string().optional(),
});

export const CreateWorktreeResultSchema = z.discriminatedUnion("success", [
  CreateWorktreeResultSuccessSchema,
  CreateWorktreeResultErrorSchema,
]);

// Type Exports

export type CommitRequest = z.infer<typeof CommitRequestSchema>;
export type CommitAndPushRequest = z.infer<typeof CommitAndPushRequestSchema>;
export type CreateWorktreeRequest = z.infer<typeof CreateWorktreeRequestSchema>;

export type CommitResultSuccess = z.infer<typeof CommitResultSuccessSchema>;
export type CommitResultError = z.infer<typeof CommitResultErrorSchema>;
export type CommitResult = z.infer<typeof CommitResultSchema>;

export type PushResultSuccess = z.infer<typeof PushResultSuccessSchema>;
export type PushResultError = z.infer<typeof PushResultErrorSchema>;
export type PushResult = z.infer<typeof PushResultSchema>;

export type CommitAndPushResultSuccess = z.infer<
  typeof CommitAndPushResultSuccessSchema
>;
export type CommitAndPushResultError = z.infer<
  typeof CommitAndPushResultErrorSchema
>;
export type CommitAndPushResult = z.infer<typeof CommitAndPushResultSchema>;
export type CreateWorktreeResultSuccess = z.infer<
  typeof CreateWorktreeResultSuccessSchema
>;
export type CreateWorktreeResultError = z.infer<
  typeof CreateWorktreeResultErrorSchema
>;
export type CreateWorktreeResult = z.infer<typeof CreateWorktreeResultSchema>;

export type CommitErrorCode = CommitResultError["errorCode"];
export type PushErrorCode = PushResultError["errorCode"];
