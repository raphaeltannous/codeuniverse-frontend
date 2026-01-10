import type { ResultStatus } from "./status";

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

  isAccepted: boolean;

  createdAt: string;
}
