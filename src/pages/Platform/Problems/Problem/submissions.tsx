import { useQuery } from "@tanstack/react-query";
import SubmissionCard from "~/components/Platform/Problem/submission";
import { useAuth } from "~/context/AuthContext";
import { apiFetch } from "~/utils/api";
import type { APIError } from "~/types/api-error";
import type { Problem } from "~/types/problem/problem";
import type { Submission } from "~/types/problem/submission";

interface ProblemEditorProps {
  problem: Problem;
}

export default function ProblemSubmissions({ problem }: ProblemEditorProps) {
  const { auth } = useAuth();

  const problemSlug = problem.slug;

  if (!problemSlug) {
    return <div>Problem not found</div>;
  }

  const { data: problemSubmissions, isLoading, isError, error } = useQuery<Submission[], APIError>({
    queryKey: [`problem-${problemSlug}-submissions-data`],
    queryFn: async () => {
      const res = await apiFetch(`/api/problems/${problemSlug}/submissions`);

      const data = await res.json();

      if (!res.ok) {
        throw data as APIError;
      }
      return data as Submission[];
    }
  })

  if (isLoading) {
    return (
      <>
        Loading...
      </>
    )
  }

  if (isError) {
    return (
      <>
        {error.message}
      </>
    )
  }

  if (!problemSubmissions || problemSubmissions.length === 0) {
    return <div>No submissions...</div>;
  }

  const sortedSubmissions = [...problemSubmissions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div>
      {sortedSubmissions.map((sub) => (
        <SubmissionCard key={sub.id} submission={sub} />
      ))}
    </div>
  )
}
