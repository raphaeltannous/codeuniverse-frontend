import type { Problem } from "../problem";

export type UserProgress = string[];

export interface ProblemsResponse {
  problems: Problem[];
  total: number;
  page: number;
  limit: number;
}

export interface Filters {
  difficulty: string;
  search: string;
  sortBy: "title" | "createdAt";
  sortOrder: "asc" | "desc";
}
