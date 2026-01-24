import { Modal } from 'react-bootstrap';
import VideoPlayer from '~/components/Shared/VideoPlayer';
import type { Lesson } from '~/types/course/lesson';

interface VideoPlayerModalProps {
  show: boolean;
  onHide: () => void;
  lesson: Lesson | null;
}

export default function VideoPlayerModal({
  show,
  onHide,
  lesson,
}: VideoPlayerModalProps) {
  return (
    <Modal
      show={show}
      onHide={onHide}
      size="xl"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>{lesson?.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-0">
        {lesson && (
          <VideoPlayer
            videoUrl={`/api/static/lessons/${lesson.videoUrl}`}
          />
        )}
      </Modal.Body>
    </Modal>
  );
}
