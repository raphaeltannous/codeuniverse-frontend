import { useState, useRef, useEffect } from 'react';
import {
  Modal,
  Button,
  Form,
  Spinner,
  Alert,
  ProgressBar,
  Badge,
  Row,
  Col
} from 'react-bootstrap';
import {
  Upload,
  Play,
  Trash,
  FileEarmarkPlay,
  Clock,
  CheckCircle,
  Hourglass,
  X,
  Eye
} from 'react-bootstrap-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '~/context/AuthContext';

interface VideoUploadModalProps {
  show: boolean;
  onClose: () => void;
  lessonId: string;
  lessonTitle: string;
  courseSlug: string;
  currentVideoUrl?: string;
  currentDuration?: number;
}

interface VideoUploadResponse {
  videoUrl: string;
  durationSeconds: number;
  message: string;
}

interface APIError {
  message: string;
}

const getVideoDuration = (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const videoURL = URL.createObjectURL(file);

    video.addEventListener('loadedmetadata', () => {
      URL.revokeObjectURL(videoURL);
      resolve(Math.round(video.duration));
    });

    video.addEventListener('error', () => {
      URL.revokeObjectURL(videoURL);
      reject(new Error('Failed to get video duration'));
    });

    video.preload = 'metadata';
    video.src = videoURL;
  });
};

export default function VideoUploadModal({
  show,
  onClose,
  lessonId,
  lessonTitle,
  courseSlug,
  currentVideoUrl,
  currentDuration = 0
}: VideoUploadModalProps) {
  const { auth } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [isGettingDuration, setIsGettingDuration] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string>('');
  const [uploadSuccess, setUploadSuccess] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);

  const uploadVideoMutation = useMutation<VideoUploadResponse, APIError, FormData>({
    mutationFn: async (formData: FormData) => {
      const res = await fetch(`/api/admin/courses/${courseSlug}/lessons/${lessonId}/video`, {
        method: 'PUT',
        credentials: 'include',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw data as APIError;
      }
      return data as VideoUploadResponse;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['lessons', courseSlug], (old: any) => {
        if (!old?.lessons) return old;
        return {
          ...old,
          lessons: old.lessons.map((lesson: any) =>
            lesson.id === lessonId
              ? {
                  ...lesson,
                  videoUrl: data.videoUrl,
                  durationSeconds: data.durationSeconds
                }
              : lesson
          )
        };
      });

      setUploadSuccess(data.message || 'Video uploaded successfully!');
      setSelectedFile(null);
      setVideoDuration(0);
      setUploadProgress(0);

      setTimeout(() => {
        handleClose();
      }, 2000);
    },
    onError: (error) => {
      setUploadError(error.message || 'Failed to upload video');
      setUploadProgress(0);
    },
  });

  useEffect(() => {
    if (!show) {
      resetState();
    }
  }, [show]);

  useEffect(() => {
    return () => {
      if (videoPreviewUrl) {
        URL.revokeObjectURL(videoPreviewUrl);
      }
    };
  }, [videoPreviewUrl]);

  const resetState = () => {
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
    }
    setSelectedFile(null);
    setVideoDuration(0);
    setVideoPreviewUrl(null);
    setIsGettingDuration(false);
    setUploadProgress(0);
    setUploadError('');
    setUploadSuccess('');
    setShowPreview(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['video/mp4'];
    const validExtensions = ['.mp4'];
    const fileName = file.name.toLowerCase();
    const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));

    if (!validTypes.includes(file.type) && !hasValidExtension) {
      setUploadError('Please select a valid MP4 video file (.mp4)');
      return;
    }

    if (file.size > 500 * 1024 * 1024) {
      setUploadError('Video size must be less than 500MB');
      return;
    }

    setSelectedFile(file);
    setUploadError('');
    setUploadSuccess('');
    setIsGettingDuration(true);

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setVideoPreviewUrl(previewUrl);

    try {
      const duration = await getVideoDuration(file);
      setVideoDuration(duration);
    } catch (error) {
      console.error('Error getting video duration:', error);
      setUploadError('Could not read video duration. Please try another file.');
      setSelectedFile(null);
      if (videoPreviewUrl) {
        URL.revokeObjectURL(previewUrl);
        setVideoPreviewUrl(null);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } finally {
      setIsGettingDuration(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError('Please select a video file.');
      return;
    }

    if (videoDuration === 0) {
      setUploadError('Could not read video duration. Please select a different file.');
      return;
    }

    const formData = new FormData();
    formData.append('video', selectedFile);
    formData.append('lessonId', lessonId);
    formData.append('durationSeconds', videoDuration.toString());

    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 300);

    await uploadVideoMutation.mutateAsync(formData);
    clearInterval(progressInterval);
    setUploadProgress(100);
  };

  const handleRemoveVideo = async () => {
    const res = await fetch(`/api/admin/courses/${courseSlug}/lessons/${lessonId}/video`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (res.ok) {
      queryClient.setQueryData(['lessons', courseSlug], (old: any) => {
        if (!old?.lessons) return old;
        return {
          ...old,
          lessons: old.lessons.map((lesson: any) =>
            lesson.id === lessonId
              ? {
                  ...lesson,
                  videoUrl: '',
                  durationSeconds: 0
                }
              : lesson
          )
        };
      });

      queryClient.invalidateQueries({ queryKey: ['lessons', courseSlug] });
      handleClose();
    } else {
      const data = await res.json();
      setUploadError(data.message || 'Failed to remove video');
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds === 0) return 'No video';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      size="lg"
      backdrop={uploadVideoMutation.isPending || isGettingDuration ? 'static' : true}
    >
      <Modal.Header closeButton={!uploadVideoMutation.isPending} className="border-0">
        <Modal.Title className="d-flex align-items-center gap-2">
          <FileEarmarkPlay size={24} />
          {currentVideoUrl ? 'Replace Lesson Video' : 'Upload Lesson Video'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-4">
          <h6 className="fw-medium mb-2">Lesson Information</h6>
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <Badge bg="info" className="px-3 py-2">
                {lessonTitle}
              </Badge>
            </div>
            <div className="d-flex align-items-center gap-2">
              <Clock size={18} className="text-muted" />
              <span className="fw-medium">{formatDuration(currentDuration)}</span>
            </div>
          </div>
        </div>

        {currentVideoUrl && (
          <div className="mb-4">
            <h6 className="fw-medium mb-2">Current Video</h6>
            <div className="d-flex align-items-center justify-content-between p-3 rounded">
              <div className="d-flex align-items-center gap-3">
                <Play size={24} className="text-primary" />
                <div>
                  <p className="mb-0 fw-medium">{currentVideoUrl.split('/').pop()}</p>
                  <small className="text-muted">{formatDuration(currentDuration)}</small>
                </div>
              </div>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={handleRemoveVideo}
                disabled={uploadVideoMutation.isPending || isGettingDuration}
              >
                <Trash size={14} />
              </Button>
            </div>
          </div>
        )}

        {uploadError && (
          <Alert variant="danger" dismissible onClose={() => setUploadError('')}>
            {uploadError}
          </Alert>
        )}

        {uploadSuccess && (
          <Alert variant="success" className="mb-0">
            <div className="d-flex align-items-center">
              <CheckCircle size={20} className="me-2" />
              <span>{uploadSuccess}</span>
            </div>
          </Alert>
        )}

        {!uploadSuccess && (
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4">
              <Form.Label className="fw-medium">
                {currentVideoUrl ? 'Select New Video' : 'Select Video'}
                <span className="text-muted ms-2">(MP4 only)</span>
              </Form.Label>

              <div
                className="border rounded p-5 text-center mb-3 position-relative"
                style={{
                  cursor: 'pointer',
                  borderStyle: selectedFile ? 'solid' : 'dashed',
                  backgroundColor: selectedFile ? '#f8f9fa' : 'transparent',
                  opacity: isGettingDuration ? 0.6 : 1
                }}
                onClick={() => !uploadVideoMutation.isPending && !isGettingDuration && fileInputRef.current?.click()}
              >
                {selectedFile ? (
                  <div className="text-center">
                    <FileEarmarkPlay size={48} className="text-primary mb-3" />
                    <p className="mb-1 fw-medium">{selectedFile.name}</p>
                    <p className="text-muted mb-1">
                      {formatFileSize(selectedFile.size)}
                    </p>
                    {isGettingDuration ? (
                      <div className="d-flex align-items-center justify-content-center gap-2 mt-2">
                        <Spinner animation="border" size="sm" />
                        <small>Reading video metadata...</small>
                      </div>
                    ) : videoDuration > 0 && (
                      <>
                        <p className="text-success mb-0">
                          Duration: {formatDuration(videoDuration)}
                        </p>
                        {videoPreviewUrl && (
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="mt-3 d-flex align-items-center gap-2 mx-auto"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowPreview(!showPreview);
                            }}
                          >
                            <Eye size={14} />
                            {showPreview ? 'Hide Preview' : 'Show Preview'}
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <>
                    <Upload size={48} className="text-muted mb-3" />
                    <p className="mb-2">Click here to select a video file</p>
                    <Button
                      variant="outline-primary"
                      disabled={uploadVideoMutation.isPending || isGettingDuration}
                    >
                      <Upload className="me-2" />
                      Choose MP4 Video
                    </Button>
                    <p className="text-muted mt-3 mb-0">
                      Only .mp4 files are supported
                    </p>
                  </>
                )}
              </div>

              <Form.Control
                type="file"
                accept=".mp4,video/mp4"
                onChange={handleFileChange}
                ref={fileInputRef}
                disabled={uploadVideoMutation.isPending || isGettingDuration}
                className="d-none"
              />

              <Form.Text className="text-muted">
                Maximum file size: 500MB. Only MP4 format is supported.
              </Form.Text>
            </Form.Group>

            {/* Video Preview */}
            {showPreview && videoPreviewUrl && (
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="fw-medium mb-0">Video Preview</h6>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setShowPreview(false)}
                  >
                    <X size={14} />
                  </Button>
                </div>
                <div className="border rounded overflow-hidden">
                  <video
                    ref={videoPreviewRef}
                    src={videoPreviewUrl}
                    controls
                    className="w-100"
                    style={{ maxHeight: '300px' }}
                    onLoadedMetadata={(e) => {
                      const video = e.currentTarget;
                      // Auto-play for preview (muted)
                      video.muted = true;
                      video.play().catch(() => {
                        // Auto-play might be blocked by browser policy
                        console.log('Auto-play blocked');
                      });
                    }}
                  />
                </div>
                <div className="mt-2 d-flex justify-content-between text-muted small">
                  <span>Duration: {formatDuration(videoDuration)}</span>
                  <span>Size: {formatFileSize(selectedFile?.size || 0)}</span>
                </div>
              </div>
            )}

            {/* Video Details Card */}
            {selectedFile && videoDuration > 0 && !isGettingDuration && (
              <Row className="mb-4">
                <Col>
                  <div className="card border-info">
                    <div className="card-body">
                      <h6 className="card-title d-flex align-items-center gap-2">
                        <Hourglass size={20} />
                        Video Details
                      </h6>
                      <div className="row">
                        <div className="col-md-6">
                          <p className="mb-1">
                            <strong>Duration:</strong> {formatDuration(videoDuration)}
                          </p>
                          <p className="mb-1">
                            <strong>Size:</strong> {formatFileSize(selectedFile.size)}
                          </p>
                        </div>
                        <div className="col-md-6">
                          <p className="mb-1">
                            <strong>Type:</strong> MP4
                          </p>
                          <p className="mb-0">
                            <strong>File:</strong> {selectedFile.name}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            )}

            {/* Upload Progress */}
            {uploadVideoMutation.isPending && (
              <div className="mb-4">
                <div className="d-flex justify-content-between mb-1">
                  <small>Uploading video...</small>
                  <small>{uploadProgress}%</small>
                </div>
                <ProgressBar
                  now={uploadProgress}
                  variant="success"
                  animated
                />
              </div>
            )}
          </Form>
        )}
      </Modal.Body>
      <Modal.Footer className="border-0">
        <Button
          variant="outline-secondary"
          onClick={handleClose}
          disabled={uploadVideoMutation.isPending || isGettingDuration}
        >
          {uploadSuccess ? 'Close' : 'Cancel'}
        </Button>
        {!uploadSuccess && selectedFile && videoDuration > 0 && !isGettingDuration && (
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={uploadVideoMutation.isPending || isGettingDuration}
          >
            {uploadVideoMutation.isPending ? (
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
                Upload Video
              </>
            )}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
}
