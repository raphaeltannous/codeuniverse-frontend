import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import {
  Container,
  ListGroup,
  Button,
  Spinner,
  Alert,
  Row,
  Col,
  Form,
  InputGroup,
  FormControl,
} from "react-bootstrap";
import { Link } from "react-router";
import DifficultyBadge from "~/components/shared/difficulty-badge";
import type { APIError } from "~/types/api-error";
import type { Problem } from "~/types/problem";

const ITEMS_PER_PAGE = 25;

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  return debounced;
}

export default function PlatformProblemsProblemset() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const isSearching = debouncedSearch.trim().length > 0;

  const paginatedQuery = useInfiniteQuery<Problem[], APIError>({
    queryKey: ["problems", "paginated"],
    initialPageParam: 0,
    enabled: !isSearching,
    queryFn: async ({ pageParam }) => {
      const offset = pageParam * ITEMS_PER_PAGE;
      const res = await fetch(
        `/api/problems?offset=${offset}&limit=${ITEMS_PER_PAGE}`
      );
      if (!res.ok) throw (await res.json()) as APIError;
      return res.json();
    },
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === ITEMS_PER_PAGE ? allPages.length : undefined,
  });

  const searchQuery = useQuery<Problem[], APIError>({
    queryKey: ["problems", "search", debouncedSearch],
    enabled: isSearching,
    queryFn: async () => {
      const res = await fetch(`/api/problems?search=${debouncedSearch}`);
      if (!res.ok) throw (await res.json()) as APIError;
      return res.json();
    },
  });

  const problems = isSearching
    ? searchQuery.data ?? []
    : paginatedQuery.data?.pages.flat() ?? [];

  const isLoading = isSearching
    ? searchQuery.isLoading
    : paginatedQuery.isLoading;

  const isError = isSearching
    ? searchQuery.isError
    : paginatedQuery.isError;

  const error = isSearching
    ? searchQuery.error
    : paginatedQuery.error;

  const onSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setSearch(e.target.value),
    []
  );

  const clearSearch = useCallback(() => setSearch(""), []);

  if (isLoading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
        <div className="mt-2">Loading problems…</div>
      </Container>
    );
  }

  if (isError) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error?.message}</Alert>
      </Container>
    );
  }

  return (
    <Container>
      <Form className="my-3">
        <InputGroup>
          <FormControl
            placeholder="Search problems…"
            value={search}
            onChange={onSearchChange}
          />
          {search && (
            <Button variant="outline-secondary" onClick={clearSearch}>
              ✕
            </Button>
          )}
        </InputGroup>
      </Form>

      {/* List */}
      {problems.length > 0 ? (
        <ListGroup variant="flush">
          {problems.map((p) => (
            <ListGroup.Item
              key={p.slug}
              as={Link}
              to={`/problems/${p.slug}`}
              action
              className="d-flex justify-content-between align-items-center"
            >
              <span>{p.title}</span>
              <DifficultyBadge difficulty={p.difficulty} />
            </ListGroup.Item>
          ))}
        </ListGroup>
      ) : (
        <Alert variant="info" className="text-center">
          No problems found
        </Alert>
      )}

      {/* Load more */}
      {!isSearching && paginatedQuery.hasNextPage && (
        <Row className="justify-content-center my-3">
          <Col xs="auto">
            <Button
              onClick={() => paginatedQuery.fetchNextPage()}
              disabled={paginatedQuery.isFetchingNextPage}
            >
              {paginatedQuery.isFetchingNextPage
                ? "Loading…"
                : "Load More"}
            </Button>
          </Col>
        </Row>
      )}
    </Container>
  );
}
