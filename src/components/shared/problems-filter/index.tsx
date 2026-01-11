import { Form, Row, Col, InputGroup, Button, Badge } from 'react-bootstrap';
import { Search } from 'react-bootstrap-icons';
import { ProblemDifficulty } from '~/types/problem/difficulty';
import type { Filters } from '~/types/problem/problemset';

interface ProblemsFilterProps {
  filters: Filters;
  appliedFilters: Filters;
  showOnlyPremium: 'all' | 'premium' | 'free';
  appliedShowOnlyPremium: 'all' | 'premium' | 'free';
  total: number;
  page: number;
  totalPages: number;
  onFilterChange: (key: keyof Filters, value: string) => void;
  onShowOnlyPremiumChange: (value: 'all' | 'premium' | 'free') => void;
  onSearch: (e: React.FormEvent) => void;
  onResetFilters: () => void;
  onApplyFilters: () => void;
  onSortByChange: (value: string) => void;
  onSortOrderChange: (value: string) => void;
  // Admin-only filters
  showAdminFilters?: boolean;
  visibilityFilter?: 'all' | 'public' | 'private';
  appliedVisibilityFilter?: 'all' | 'public' | 'private';
  onVisibilityFilterChange?: (value: 'all' | 'public' | 'private') => void;
}

export default function ProblemsFilter({
  filters,
  appliedFilters,
  showOnlyPremium,
  appliedShowOnlyPremium,
  total,
  page,
  totalPages,
  onFilterChange,
  onShowOnlyPremiumChange,
  onSearch,
  onResetFilters,
  onApplyFilters,
  onSortByChange,
  onSortOrderChange,
  showAdminFilters = false,
  visibilityFilter = 'all',
  appliedVisibilityFilter = 'all',
  onVisibilityFilterChange,
}: ProblemsFilterProps) {
  // Get difficulty options from the imported enum
  const difficultyOptions = Object.values(ProblemDifficulty);

  // Check if filters have changed
  const hasFilterChanges = () => {
    const baseChanges =
      filters.search !== appliedFilters.search ||
      filters.difficulty !== appliedFilters.difficulty ||
      filters.sortBy !== appliedFilters.sortBy ||
      filters.sortOrder !== appliedFilters.sortOrder ||
      showOnlyPremium !== appliedShowOnlyPremium;

    // Include visibility filter changes if admin filters are enabled
    if (showAdminFilters && onVisibilityFilterChange) {
      return baseChanges || visibilityFilter !== appliedVisibilityFilter;
    }

    return baseChanges;
  };

  return (
    <Form onSubmit={onSearch}>
      <Row className="g-3">
        <Col md={showAdminFilters ? 3 : 4}>
          <InputGroup>
            <InputGroup.Text>
              <Search size={18} />
            </InputGroup.Text>
            <Form.Control
              type="search"
              placeholder="Search problems..."
              value={filters.search}
              onChange={(e) => onFilterChange('search', e.target.value)}
            />
            <Button
              type="submit"
              variant={hasFilterChanges() ? 'primary' : 'secondary'}
              disabled={!hasFilterChanges()}
            >
              Search
            </Button>
          </InputGroup>
        </Col>

        <Col md={2}>
          <Form.Select
            value={filters.difficulty}
            onChange={(e) => onFilterChange('difficulty', e.target.value)}
          >
            <option value="all">All Difficulties</option>
            {difficultyOptions.map((diff) => (
              <option key={diff} value={diff}>
                {diff}
              </option>
            ))}
          </Form.Select>
        </Col>

        <Col md={2}>
          <Form.Select
            value={showOnlyPremium}
            onChange={(e) =>
              onShowOnlyPremiumChange(
                e.target.value as 'all' | 'premium' | 'free',
              )
            }
          >
            <option value="all">All Problems</option>
            <option value="free">Free Only</option>
            <option value="premium">Premium Only</option>
          </Form.Select>
        </Col>

        {showAdminFilters && onVisibilityFilterChange && (
          <Col md={2}>
            <Form.Select
              value={visibilityFilter}
              onChange={(e) =>
                onVisibilityFilterChange(
                  e.target.value as 'all' | 'public' | 'private',
                )
              }
            >
              <option value="all">All Visibility</option>
              <option value="public">Public Only</option>
              <option value="private">Private Only</option>
            </Form.Select>
          </Col>
        )}

        <Col md={2}>
          <Form.Select
            value={appliedFilters.sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
          >
            <option value="title">Sort by Title</option>
            <option value="createdAt">Sort by Date</option>
          </Form.Select>
        </Col>

        <Col md={showAdminFilters ? 1 : 2}>
          <Form.Select
            value={appliedFilters.sortOrder}
            onChange={(e) => onSortOrderChange(e.target.value)}
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </Form.Select>
        </Col>
      </Row>

      <Row className="mt-3">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex gap-2">
              <Badge bg="light" text="dark" className="px-3 py-2">
                {total} problems • Page {page} of {totalPages}
              </Badge>
              {(appliedFilters.search ||
                appliedFilters.difficulty !== 'all' ||
                appliedShowOnlyPremium !== 'all' ||
                (showAdminFilters && appliedVisibilityFilter !== 'all')) && (
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={onResetFilters}
                >
                  Clear Filters
                </Button>
              )}
              {hasFilterChanges() && (
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={onApplyFilters}
                >
                  Apply Filters
                </Button>
              )}
            </div>
          </div>
        </Col>
      </Row>
    </Form>
  );
}
