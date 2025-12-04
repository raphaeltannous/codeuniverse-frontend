export interface SubmitRequest {
  problemSlug: string;
  languageSlug: string;
  code: string;
}

export type SubmitResponse = {
  submissionId: string;
};
