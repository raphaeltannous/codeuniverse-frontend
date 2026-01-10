export const ResultStatus = {
  Pending: "Pending",
  Started: "Started",

  Accepted: "Accepted",
  Failed: "Failed",

  TimeLimitExceeded: "Time Limit Exceeded",
  MemoryLimitExceeded: "Memory Limit Exceeded",

  CompileError: "Compile Error",
  RuntimeError: "Runtime Error",

  InternalServerError: "Internal Server Error",
} as const;

export type ResultStatus = (typeof ResultStatus)[keyof typeof ResultStatus];
