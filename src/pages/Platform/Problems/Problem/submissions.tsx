import { useQuery } from "@tanstack/react-query";
import type { APIError } from "~/types/api-error";
import type { Problem } from "~/types/problem";
import type { Submission } from "~/types/problem/submission";

interface ProblemEditorProps {
  problem: Problem;
}

export default function ProblemSubmissions({ problem }: ProblemEditorProps) {
  const problemSlug = problem.slug;
  const token = localStorage.getItem("token");

  if (!problemSlug) {
    return <div>Problem not found</div>;
  }

  const { data: problemSubmissions, isLoading, isError, error } = useQuery<Submission[], APIError>({
    queryKey: [`problem-${problemSlug}-submissions-data`],
    queryFn: async () => {
      const res = await fetch(`/api/problems/${problemSlug}/submissions`, {
        headers: { "Authorization": `Bearer ${token}` },
      });
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

  return (
    <div>
      subm
    </div>
  )
}
