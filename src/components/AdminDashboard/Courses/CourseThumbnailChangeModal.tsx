import { useState, useRef } from 'react';
import {
  Button,
  Modal,
  Form,
  Spinner,
  Alert,
  Image,
} from 'react-bootstrap';
import {
  Upload,
  Camera,
  Image as ImageIcon,
} from 'react-bootstrap-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from "~/utils/api";
import type { Course } from '~/types/course/course';
import type { APIError } from '~/types/api-error';

interface ThumbnailChangeModalProps {
  show: boolean;
  onClose: () => void;
  currentThumbnail: string;
  courseSlug: string;
  courseTitle: string;
}

interface UploadResponse {
  thumbnailUrl: string;
  message: string;
}

export default function CourseThumbnailChangeModal({
  show,
  onClose,
  courseSlug,
  courseTitle,
}: ThumbnailChangeModalProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string>('');

  const uploadThumbnailMutation = useMutation<UploadResponse, APIError, FormData>({
    mutationFn: async (formData: FormData) => {
      const res = await apiFetch(`/api/admin/courses/${courseSlug}/thumbnail`, {
        method: 'PUT',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw data as APIError;
      }
      return data as UploadResponse;
    },
    onSuccess: (data) => {
      // Update the specific course in cache
      queryClient.setQueryData(['courses'], (old: Course[] | undefined) => {
        if (!old) return old;
        return old.map(course =>
          course.slug === courseSlug
            ? { ...course, thumbnailURL: data.thumbnailUrl }
            : course
        );
      });

      // Invalidate queries to refetch
      queryClient.invalidateQueries({
        queryKey: ["courses"]
      });

      onClose();
      resetState();
    },
    onError: (error) => {
      setUploadError(error.message || 'Failed to upload thumbnail');
    },
  });

  const resetState = () => {
    setPreviewUrl(null);
    setSelectedFile(null);
    setUploadError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Please select a valid image file (JPEG, PNG, GIF, WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size must be less than 5MB');
      return;
    }

    setSelectedFile(file);
    setUploadError('');

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError('Please select an image file.');
      return;
    }

    const formData = new FormData();
    formData.append('thumbnail', selectedFile);
    formData.append('courseSlug', courseSlug);

    await uploadThumbnailMutation.mutateAsync(formData);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header className="border-0">
        <Modal.Title className="d-flex align-items-center gap-2">
          <Camera size={24} />
          Update Thumbnail for {courseTitle}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {uploadError && (
          <Alert variant="danger" dismissible onClose={() => setUploadError('')}>
            {uploadError}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-4">
            <div
              className="rounded border p-5 text-center mb-3"
              style={{
                cursor: 'pointer',
              }}
              onClick={() => !uploadThumbnailMutation.isPending && fileInputRef.current?.click()}
            >
              {previewUrl ? (
                <div className="text-center">
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    fluid
                    rounded
                    style={{
                      maxHeight: '200px',
                      maxWidth: '100%',
                      objectFit: 'contain'
                    }}
                    className="mb-3"
                  />
                  <p className="text-muted mb-0">
                    {selectedFile?.name} ({Math.round((selectedFile?.size || 0) / 1024)} KB)
                  </p>
                </div>
              ) : (
                <>
                  <ImageIcon size={48} className="text-muted mb-3" />
                  <p className="mb-2">Click here to select a new thumbnail</p>
                </>
              )}
            </div>

            <Form.Control
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleFileChange}
              ref={fileInputRef}
              disabled={uploadThumbnailMutation.isPending}
              className="d-none"
            />

            <Form.Text className="text-muted">
              Maximum file size: 5MB. Supported formats: JPEG, PNG, GIF, WebP.
            </Form.Text>
          </Form.Group>

          <div className="d-flex gap-2 justify-content-end">
            <Button
              variant="secondary"
              onClick={handleClose}
              disabled={uploadThumbnailMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={!selectedFile || uploadThumbnailMutation.isPending}
            >
              {uploadThumbnailMutation.isPending ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    className="me-2"
                  />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="me-2" />
                  Upload & Update
                </>
              )}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
