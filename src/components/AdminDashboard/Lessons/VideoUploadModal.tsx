import { useState, useRef, useEffect } from 'react';
import {
  Modal,
  Button,
  Form,
  Spinner,
  ProgressBar,
  Badge,
  Row,
  Col
} from 'react-bootstrap';
import {
  Upload,
  FileEarmarkPlay,
  Clock,
  X,
  Eye
} from 'react-bootstrap-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from "~/utils/api";
import { useNotification } from '~/hooks/useNotification';

interface VideoUploadModalProps {
  show: boolean;
  onClose: () => void;
  lessonId: string;
  lessonTitle: string;
  courseSlug: string;
  currentVideoUrl?: string;
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
  currentVideoUrl
}: VideoUploadModalProps) {
  const queryClient = useQueryClient();
  const notification = useNotification();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [isGettingDuration, setIsGettingDuration] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showPreview, setShowPreview] = useState(false);

  const uploadVideoMutation = useMutation<VideoUploadResponse, APIError, FormData>({
    mutationFn: async (formData: FormData) => {
      const res = await apiFetch(`/api/admin/courses/${courseSlug}/lessons/${lessonId}/video`, {
        method: 'PUT',
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

      // Invalidate to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['lessons', courseSlug] });

      notification.success(data.message || 'Video uploaded successfully!', 3000);
      setSelectedFile(null);
      setVideoDuration(0);
      setUploadProgress(0);
      handleClose();
    },
    onError: (error) => {
      notification.error(error.message || 'Failed to upload video', 5000);
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
      notification.error('Please select a valid MP4 video file (.mp4)', 5000);
      return;
    }

    if (file.size > 500 * 1024 * 1024) {
      notification.error('Video size must be less than 500MB', 5000);
      return;
    }

    setSelectedFile(file);
    setIsGettingDuration(true);

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setVideoPreviewUrl(previewUrl);

    try {
      const duration = await getVideoDuration(file);
      setVideoDuration(duration);
    } catch (error) {
      console.error('Error getting video duration:', error);
      notification.error('Could not read video duration. Please try another file.', 5000);
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
      notification.error('Please select a video file.', 5000);
      return;
    }

    if (videoDuration === 0) {
      notification.error('Could not read video duration. Please select a different file.', 5000);
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
      <Modal.Header closeButton={!uploadVideoMutation.isPending} className="border-0 pb-2">
        <div className="d-flex align-items-center gap-3 w-100">
          <div className="border-0 p-2 rounded">
            <FileEarmarkPlay size={24} className="text-primary" />
          </div>
          <div>
            <Modal.Title className="mb-1 h5">
              {currentVideoUrl ? 'Replace Video' : 'Upload Video'}
            </Modal.Title>
            <p className="text-muted mb-0 small">{lessonTitle}</p>
          </div>
        </div>
      </Modal.Header>
      
      <Modal.Body className="pt-3">
        <Form onSubmit={handleSubmit}>
            {/* Upload Area */}
            <div className="mb-4">
              <Form.Label className="fw-semibold mb-3">
                Video File <span className="text-muted fw-normal">(MP4 only, max 500MB)</span>
              </Form.Label>

              <div
                className={`border-2 rounded-3 p-4 text-center position-relative transition-all ${
                  selectedFile 
                    ? 'border-primary' 
                    : 'border-dashed'
                }`}
                style={{
                  cursor: uploadVideoMutation.isPending || isGettingDuration ? 'not-allowed' : 'pointer',
                  borderStyle: selectedFile ? 'solid' : 'dashed',
                  opacity: isGettingDuration ? 0.7 : 1,
                  transition: 'all 0.3s ease'
                }}
                onClick={() => !uploadVideoMutation.isPending && !isGettingDuration && fileInputRef.current?.click()}
              >
                {selectedFile ? (
                  <div>
                    <div className="mb-3">
                      <div className="border rounded-circle d-inline-flex p-3 mb-3">
                        <FileEarmarkPlay size={32} className="text-primary" />
                      </div>
                    </div>
                    <h6 className="fw-semibold mb-2">{selectedFile.name}</h6>
                    <p className="text-muted small mb-2">
                      {formatFileSize(selectedFile.size)}
                    </p>
                    
                    {isGettingDuration ? (
                      <div className="d-flex align-items-center justify-content-center gap-2 mt-3">
                        <Spinner animation="border" size="sm" variant="primary" />
                        <small className="text-muted">Analyzing video...</small>
                      </div>
                    ) : videoDuration > 0 ? (
                      <div className="mt-3">
                        <Badge className="border px-3 py-2">
                          <Clock size={14} className="me-1" />
                          Duration: {formatDuration(videoDuration)}
                        </Badge>
                        {videoPreviewUrl && (
                          <div className="mt-3">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowPreview(!showPreview);
                              }}
                            >
                              <Eye size={14} className="me-1" />
                              {showPreview ? 'Hide Preview' : 'Show Preview'}
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="py-4">
                    <div className="rounded-circle d-inline-flex p-3 mb-3">
                      <Upload size={32} className="text-muted" />
                    </div>
                    <h6 className="mb-2">Drop your video here or click to browse</h6>
                    <p className="text-muted small mb-3">
                      Supports MP4 format up to 500MB
                    </p>
                  </div>
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
            </div>

            {/* Video Preview */}
            {showPreview && videoPreviewUrl && (
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-semibold mb-0">Video Preview</h6>
                  <Button
                    variant="link"
                    size="sm"
                    className="text-decoration-none p-0"
                    onClick={() => setShowPreview(false)}
                  >
                    <X size={18} />
                  </Button>
                </div>
                <div className="border rounded-3 overflow-hidden bg-black">
                  <video
                    ref={videoPreviewRef}
                    src={videoPreviewUrl}
                    controls
                    className="w-100"
                    style={{ maxHeight: '350px', objectFit: 'contain' }}
                    onLoadedMetadata={(e) => {
                      const video = e.currentTarget;
                      video.muted = true;
                      video.play().catch(() => {
                        console.log('Auto-play blocked');
                      });
                    }}
                  />
                </div>
              </div>
            )}

            {/* Video Stats */}
            {selectedFile && videoDuration > 0 && !isGettingDuration && !showPreview && (
              <Row className="g-3 mb-4">
                <Col xs={6}>
                  <div className="border rounded-3 p-3 h-100">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <Clock size={16} className="text-primary" />
                      <small className="text-muted text-uppercase fw-semibold">Duration</small>
                    </div>
                    <h6 className="mb-0">{formatDuration(videoDuration)}</h6>
                  </div>
                </Col>
                <Col xs={6}>
                  <div className="border rounded-3 p-3 h-100">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <FileEarmarkPlay size={16} className="text-primary" />
                      <small className="text-muted text-uppercase fw-semibold">File Size</small>
                    </div>
                    <h6 className="mb-0">{formatFileSize(selectedFile.size)}</h6>
                  </div>
                </Col>
              </Row>
            )}

            {/* Upload Progress */}
            {uploadVideoMutation.isPending && (
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <small className="fw-semibold">Uploading video...</small>
                  <small className="text-primary fw-semibold">{uploadProgress}%</small>
                </div>
                <ProgressBar
                  now={uploadProgress}
                  variant="primary"
                  animated
                  style={{ height: '8px' }}
                />
                <p className="text-muted small mb-0 mt-2">Please don't close this window</p>
              </div>
            )}
          </Form>
      </Modal.Body>
      <Modal.Footer className="border-0 pt-0">
        <Button
          variant="outline-secondary"
          onClick={handleClose}
          disabled={uploadVideoMutation.isPending || isGettingDuration}
        >
          Cancel
        </Button>
        {selectedFile && videoDuration > 0 && !isGettingDuration && (
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
                <Upload size={16} className="me-2" />
                Upload Video
              </>
            )}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
}
