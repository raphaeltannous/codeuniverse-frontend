import type { ResultStatus } from "./status";
import type { FailedTestcase } from "./testcase";

export interface RunRequest {
  code: string;
}

export type RunResponse = {
  runId: string;
};

export type RunResultsReponse = {
  runId: string;

  language: string;
  code: string;
  status: ResultStatus;

  executionTime: number;
  memoryUsage: number;

  failedTestcases: FailedTestcase[];

  stdOut: string;
  stdErr: string;

  createdAt: string;
  updatedAt: string;
};
