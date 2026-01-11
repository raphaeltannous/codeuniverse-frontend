import type {
  RunRequest,
  RunResponse,
  RunResultsReponse,
} from "~/types/problem/run";
import type { SubmitRequest, SubmitResponse } from "~/types/problem/submission";
import type { APIError } from "~/types/api-error";

export async function runProblem(
  slug: string,
  language: string,
  body: RunRequest,
  jwt: string,
) {
  const result = await fetch(`/api/problems/${slug}/run/${language}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify(body),
  });
  if (!result.ok) throw (await result.json()) as APIError;
  return result.json() as Promise<RunResponse>;
}

export async function getRunStatus(slug: string, runId: string, jwt: string) {
  const result = await fetch(`/api/problems/${slug}/run/${runId}/check`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
  });
  if (!result.ok) throw (await result.json()) as APIError;
  return result.json() as Promise<RunResultsReponse>;
}

export async function submitProblem(
  slug: string,
  language: string,
  body: SubmitRequest,
  jwt: string,
) {
  const result = await fetch(`/api/problems/${slug}/submit/${language}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify(body),
  });
  if (!result.ok) throw (await result.json()) as APIError;
  return result.json() as Promise<SubmitResponse>;
}

export async function getSubmissionStatus(
  slug: string,
  submissionId: string,
  jwt: string,
) {
  const result = await fetch(
    `/api/problems/${slug}/submit/${submissionId}/check`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
    },
  );
  if (!result.ok) throw (await result.json()) as APIError;
  return result.json();
}
