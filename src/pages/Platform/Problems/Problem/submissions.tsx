import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Pagination } from "react-bootstrap";
import SubmissionCard from "~/components/Platform/Problem/submission";
import SubmissionsSkeleton from "~/components/Platform/Problem/SubmissionsSkeleton";
import { apiFetch } from "~/utils/api";
import type { APIError } from "~/types/api-error";
import type { Problem } from "~/types/problem/problem";
import type { Submission } from "~/types/problem/submission";

interface ProblemEditorProps {
  problem: Problem;
}

export default function ProblemSubmissions({ problem }: ProblemEditorProps) {
  const problemSlug = problem.slug;
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const containerRef = useRef<HTMLDivElement>(null);

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
    return <SubmissionsSkeleton />;
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

  // Pagination calculations
  const totalPages = Math.ceil(sortedSubmissions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSubmissions = sortedSubmissions.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of the submissions container
    // Use setTimeout to ensure state update completes first
    setTimeout(() => {
      if (containerRef.current) {
        const elementPosition = containerRef.current.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - 100; // 100px offset for header
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }, 0);
  };

  // Generate pagination items
  const getPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <Pagination.Item
            key={i}
            active={i === currentPage}
            onClick={() => handlePageChange(i)}
          >
            {i}
          </Pagination.Item>
        );
      }
    } else {
      // Always show first page
      items.push(
        <Pagination.Item
          key={1}
          active={1 === currentPage}
          onClick={() => handlePageChange(1)}
        >
          1
        </Pagination.Item>
      );

      // Calculate range around current page
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      // Add ellipsis after first page if needed
      if (startPage > 2) {
        items.push(<Pagination.Ellipsis key="ellipsis-start" disabled />);
        startPage = Math.max(startPage, currentPage - 1);
      }

      // Add pages around current page
      for (let i = startPage; i <= endPage; i++) {
        items.push(
          <Pagination.Item
            key={i}
            active={i === currentPage}
            onClick={() => handlePageChange(i)}
          >
            {i}
          </Pagination.Item>
        );
      }

      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        items.push(<Pagination.Ellipsis key="ellipsis-end" disabled />);
      }

      // Always show last page
      items.push(
        <Pagination.Item
          key={totalPages}
          active={totalPages === currentPage}
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </Pagination.Item>
      );
    }

    return items;
  };

  return (
    <div ref={containerRef}>
      {currentSubmissions.map((sub) => (
        <SubmissionCard key={sub.id} submission={sub} />
      ))}

      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <Pagination>
            <Pagination.First
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
            />
            <Pagination.Prev
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            />
            {getPaginationItems()}
            <Pagination.Next
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            />
            <Pagination.Last
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
            />
          </Pagination>
        </div>
      )}

      {totalPages > 1 && (
        <div className="text-center text-muted small mt-2">
          Showing {startIndex + 1}-{Math.min(endIndex, sortedSubmissions.length)} of {sortedSubmissions.length} submissions
        </div>
      )}
    </div>
  )
}
