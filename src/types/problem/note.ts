export interface ProblemNoteSaveRequest {
  method: string;
  markdown: string | undefined;
}

export interface ProblemNoteSaveResponse {
  message: string;
}

export interface ProblemNote {
  markdown: string;

  createAt: string;
  updatedAt: string;
}
