export interface RunRequest {
  problemSlug: string;
  languageSlug: string;
  code: string;
}

export type RunResponse = {
  message: string;
};
