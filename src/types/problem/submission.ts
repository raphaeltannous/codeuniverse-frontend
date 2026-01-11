import type { ResultStatus } from "./status";
import type { FailedTestcase } from "./testcase";

export interface SubmitRequest {
  problemSlug: string;
  languageSlug: string;
  code: string;
}

export type SubmitResponse = {
  submissionId: string;
};

export interface Submission {
  id: string;

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
}
