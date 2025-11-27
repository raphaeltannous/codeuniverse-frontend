import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";

export default function PlatformProblemsProblem() {
  const { problemSlug } = useParams();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: [`problem-${problemSlug}-data`],
    queryFn: async () => {
      const response = await fetch("/api/problems/");

      if (!response.ok) {
        throw new Error('Network reponse was not ok');
      }
      return response.json();
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
        Error { error.message }
      </>
    )
  }

  return (
    <>
    { problemSlug }
    </>
  )
}
