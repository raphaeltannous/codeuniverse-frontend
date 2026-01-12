import { Activity } from "react";
import { Button, Card } from "react-bootstrap";
import { Pencil } from "react-bootstrap-icons";

export default function ProfileSection({
  title,
  onEdit,
  showEdit = true,
  children,
}: {
  title: string;
  onEdit?: () => void;
  showEdit?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Card className="mb-4 border-0">
      <Card.Header className="border-0 d-flex justify-content-between align-items-center py-3 px-4">
        <Card.Title className="mb-0 h5 fw-bold">{title}</Card.Title>
        <Activity mode={showEdit && onEdit ? "visible" : "hidden"}>
          <Button
            variant="outline-primary"
            size="sm"
            onClick={onEdit}
            className="d-flex align-items-center rounded"
          >
            <Pencil size={14} className="me-1" />
            Edit
          </Button>
        </Activity>
      </Card.Header>

      <Card.Body className="py-3 px-4">{children}</Card.Body>
    </Card>
  );
};
