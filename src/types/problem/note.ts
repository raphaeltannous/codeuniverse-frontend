export interface ProblemNoteUpdateRequest {
  markdown: string;
}

export interface ProblemNote {
  markdown: string;

  createAt: string;
  updatedAt: string;
}
