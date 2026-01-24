import { Card, Table, Button, Spinner, Image, Pagination } from "react-bootstrap";
import { Person, Eye, Pencil, Trash, Clock } from "react-bootstrap-icons";
import RoleBadge from "~/components/Shared/RoleBadge";
import ActiveStatusBadge from "~/components/Shared/ActiveStatusBadge";
import VerificationBadge from "~/components/Shared/VerificationBadge";
import PremiumBadge from "~/components/Shared/PremiumBadge";
import UsersTableSkeleton from "./UsersTableSkeleton";
import type { User } from "~/types/admin/user";

interface UsersTableProps {
    users: User[];
    total: number;
    isLoading: boolean;
    searchTerm: string;
    currentPage: number;
    totalPages: number;
    offset: number;
    limit: number;
    isDeletingUser: boolean;
    deletingUsername?: string;
    onViewDetails: (user: User) => void;
    onEditUser: (user: User) => void;
    onDeleteUser: (user: User) => void;
    onPageChange: (newOffset: number) => void;
    onFirstPage: () => void;
    onPrevPage: () => void;
    onNextPage: () => void;
    onLastPage: () => void;
}

export default function UsersTable({
    users,
    total,
    isLoading,
    searchTerm,
    currentPage,
    totalPages,
    offset,
    limit,
    isDeletingUser,
    deletingUsername,
    onViewDetails,
    onEditUser,
    onDeleteUser,
    onPageChange,
    onFirstPage,
    onPrevPage,
    onNextPage,
    onLastPage,
}: UsersTableProps) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getAvatar = (user: User) => {
        if (user.avatarUrl) {
            return (
                <Image
                    src={`/api/static/avatars/${user.avatarUrl}`}
                    alt={user.username}
                    rounded
                    width={50}
                    height={50}
                    className="me-3"
                />
            );
        }

        return (
            <div
                className="bg-primary bg-opacity-10 rounded-circle p-2 me-3 d-flex align-items-center justify-content-center"
                style={{ width: "40px", height: "40px" }}
            >
                <Person size={20} className="text-primary" />
            </div>
        );
    };

    if (isLoading && users.length === 0) {
        return <UsersTableSkeleton />;
    }

    return (
        <Card className="border-0">
            <Card.Body className="p-0">
                <div className={`table-responsive ${isLoading ? "opacity-50" : ""}`}>
                    <Table hover className="mb-0">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Verification</th>
                                <th>Premium</th>
                                <th>Joined</th>
                                <th>Last Updated</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {!isLoading && users.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-5">
                                        <Person size={48} className="text-muted mb-3" />
                                        <h5 className="mb-2">No users found</h5>
                                        <p className="text-muted mb-0">
                                            {searchTerm
                                                ? "Try a different search term"
                                                : "No users match your filters"}
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id}>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                {getAvatar(user)}
                                                <div>
                                                    <div className="fw-semibold">{user.username}</div>
                                                    <small className="text-muted">{user.email}</small>
                                                    <div className="mt-1">
                                                        <small className="text-muted">
                                                            ID: {user.id.substring(0, 8)}...
                                                        </small>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <RoleBadge role={user.role} />
                                            </div>
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <ActiveStatusBadge isActive={user.isActive} />
                                            </div>
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <VerificationBadge isVerified={user.isVerified} />
                                            </div>
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <PremiumBadge
                                                    isPremium={user.premiumStatus === "premium"}
                                                />
                                            </div>
                                        </td>
                                        <td>
                                            <div className="d-flex flex-column">
                                                <span>{formatDate(user.createdAt)}</span>
                                                <small className="text-muted">
                                                    <Clock size={10} className="me-1" />
                                                    {formatDateTime(user.createdAt)}
                                                </small>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="d-flex flex-column">
                                                <span>{formatDate(user.updatedAt)}</span>
                                                <small className="text-muted">
                                                    <Clock size={10} className="me-1" />
                                                    {formatDateTime(user.updatedAt)}
                                                </small>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="d-flex gap-1">
                                                <Button
                                                    variant="outline-info"
                                                    size="sm"
                                                    onClick={() => onViewDetails(user)}
                                                    title="View Details"
                                                >
                                                    <Eye size={14} />
                                                </Button>
                                                <Button
                                                    variant="outline-warning"
                                                    size="sm"
                                                    onClick={() => onEditUser(user)}
                                                    title="Edit User"
                                                >
                                                    <Pencil size={14} />
                                                </Button>
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => onDeleteUser(user)}
                                                    title="Delete User"
                                                    disabled={isDeletingUser}
                                                >
                                                    {isDeletingUser && deletingUsername === user.username ? (
                                                        <Spinner animation="border" size="sm" />
                                                    ) : (
                                                        <Trash size={14} />
                                                    )}
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </Table>
                </div>
            </Card.Body>

            {/* Pagination with Offset */}
            {total > limit && (
                <Card.Footer className="border-0">
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="text-muted small">
                            Showing {offset + 1} to {Math.min(offset + limit, total)} of{" "}
                            {total} users
                        </div>
                        <Pagination className="mb-0">
                            <Pagination.First onClick={onFirstPage} disabled={offset === 0} />
                            <Pagination.Prev onClick={onPrevPage} disabled={offset === 0} />

                            {/* Generate page numbers based on offset */}
                            {(() => {
                                const pages = [];
                                const maxVisiblePages = 5;
                                const currentPageNum = currentPage;

                                let startPage = Math.max(
                                    1,
                                    currentPageNum - Math.floor(maxVisiblePages / 2),
                                );
                                let endPage = Math.min(
                                    totalPages,
                                    startPage + maxVisiblePages - 1,
                                );

                                // Adjust start page if we're near the end
                                if (endPage - startPage + 1 < maxVisiblePages) {
                                    startPage = Math.max(1, endPage - maxVisiblePages + 1);
                                }

                                for (let i = startPage; i <= endPage; i++) {
                                    pages.push(
                                        <Pagination.Item
                                            key={i}
                                            active={i === currentPageNum}
                                            onClick={() => onPageChange((i - 1) * limit)}
                                        >
                                            {i}
                                        </Pagination.Item>,
                                    );
                                }

                                return pages;
                            })()}

                            <Pagination.Next
                                onClick={onNextPage}
                                disabled={offset + limit >= total}
                            />
                            <Pagination.Last
                                onClick={onLastPage}
                                disabled={offset + limit >= total}
                            />
                        </Pagination>
                    </div>
                </Card.Footer>
            )}
        </Card>
    );
}
