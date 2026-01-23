import { useState } from "react";
import { Alert, Button, Container } from "react-bootstrap";
import { useUser } from "~/context/UserContext";
import { useAuth } from "~/context/AuthContext";
import { useNotification } from "~/hooks/useNotification";
import { useResendVerification } from "~/hooks/useResendVerification";

export default function VerificationBanner() {
  const { auth } = useAuth();
  const { user } = useUser();
  const notification = useNotification();
  const { resendMutation } = useResendVerification();
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't show banner if user is not authenticated, verified, or has dismissed it
  if (!auth.isAuthenticated || !user || user.isVerified || isDismissed) {
    return null;
  }

  const handleResendVerification = async () => {
    resendMutation.mutate(undefined, {
      onSuccess: (data) => {
        notification.success(data.message);
      },
      onError: (error) => {
        notification.error(error.message);
      },
    });
  };

  return (
    <Alert variant="warning" className="mb-0 rounded-0 text-center" dismissible onClose={() => setIsDismissed(true)}>
      <Container>
        <span className="me-2">
          Your email is not verified. Please verify your email to access all features.
        </span>
        <Button
          variant="link"
          size="sm"
          className="p-0 align-baseline"
          onClick={handleResendVerification}
          disabled={resendMutation.isPending}
        >
          {resendMutation.isPending ? "Sending..." : "Resend verification email"}
        </Button>
      </Container>
    </Alert>
  );
}
