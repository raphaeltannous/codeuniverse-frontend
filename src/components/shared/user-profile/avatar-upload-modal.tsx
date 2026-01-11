import { useState, useRef } from 'react';
import { Button, Modal, Form, Spinner, Alert, Image } from 'react-bootstrap';
import { Upload } from 'react-bootstrap-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '~/context/AuthContext';
import type { APIError } from '~/types/api-error';
import type { UserProfile } from '~/types/user';

interface AvatarUploadModalProps {
  show: boolean;
  onClose: () => void;
  currentAvatarUrl?: string | null;
  username: string;
}

interface UploadResponse {
  avatarUrl: string;
  message: string;
}

export default function AvatarUploadModal({
  show,
  onClose,
  currentAvatarUrl,
  username,
}: AvatarUploadModalProps) {
  const { auth } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string>('');

  const uploadAvatarMutation = useMutation<UploadResponse, APIError, FormData>({
    mutationFn: async (formData: FormData) => {
      const res = await fetch('/api/profile/avatar', {
        method: 'PUT',
        credentials: 'include',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw data as APIError;
      }
      return data as UploadResponse;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['user-profile', username], (old: UserProfile | undefined) => {
        if (!old) return old;
        return { ...old, avatarUrl: data.avatarUrl };
      });

      queryClient.invalidateQueries({
        queryKey: ["userProfile", auth.isAuthenticated]
      });

      onClose();
      resetState();
    },
    onError: (error) => {
      setUploadError(error.message || 'Failed to upload avatar');
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
    formData.append('avatar', selectedFile);
    formData.append('username', username);

    await uploadAvatarMutation.mutateAsync(formData);
  };

  const handleRemoveAvatar = async () => {
    const res = await fetch('/api/profile/avatar', {
      method: 'DELETE',
      credentials: 'include',
    });

    if (res.ok) {
      queryClient.setQueryData(['user-profile', username], (old: UserProfile | undefined) => {
        if (!old) return old;
        return { ...old, avatarUrl: "default.png" };
      });

      queryClient.invalidateQueries({
        queryKey: ["userProfile", auth.isAuthenticated]
      });

      onClose();
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered size="lg">
      <Modal.Header className="border-0">
        <Modal.Title>Update Profile Picture</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {uploadError && (
          <Alert variant="danger" dismissible onClose={() => setUploadError('')}>
            {uploadError}
          </Alert>
        )}

        <div className="text-center mb-4">
          <div className="position-relative d-inline-block">
            <div
              className="rounded overflow-hidden border"
              style={{
                width: '200px',
                height: '200px',
                margin: '0 auto',
              }}
            >
              {previewUrl ? (
                <Image
                  src={previewUrl}
                  alt="Preview"
                  className="w-100 h-100 object-fit-cover"
                />
              ) : currentAvatarUrl ? (
                <Image
                  src={`/api/static/avatars/${currentAvatarUrl}`}
                  alt="Current avatar"
                  className="w-100 h-100 object-fit-cover"
                />
              ) : (
                <div className="w-100 h-100 d-flex align-items-center justify-content-center">
                  <span className="text-muted fs-1">
                    {username?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-4">
            <Form.Label className="fw-medium">Choose an image</Form.Label>
            <Form.Control
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleFileChange}
              ref={fileInputRef}
              disabled={uploadAvatarMutation.isPending}
            />
            <Form.Text className="text-muted">
              Maximum file size: 5MB. Supported formats: JPEG, PNG, GIF, WebP.
            </Form.Text>
          </Form.Group>

          <div className="d-flex gap-2 justify-content-end">
            {currentAvatarUrl !== "default.png" && (
              <Button
                variant="outline-danger"
                onClick={handleRemoveAvatar}
                disabled={uploadAvatarMutation.isPending}
              >
                Remove Avatar
              </Button>
            )}
            <Button
              variant="secondary"
              onClick={() => {
                onClose();
                resetState();
              }}
              disabled={uploadAvatarMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={!selectedFile || uploadAvatarMutation.isPending}
            >
              {uploadAvatarMutation.isPending ? (
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
                  Upload
                </>
              )}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};
