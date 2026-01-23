import { Activity, useEffect } from "react";
import { Container, Spinner } from "react-bootstrap";
import { useNavigate, useSearchParams } from "react-router";
import { useEmailVerification } from "~/hooks/useEmailVerification";

export default function PlatformAccountsEmailVerification() {
  const navigate = useNavigate();
  const { verificationMutation } = useEmailVerification();

  const [params] = useSearchParams();
  const token = params.get("token") || "";

  useEffect(() => {
    if (!token) {
      navigate("/accounts/login");
    } else {
      verificationMutation.mutate(
        { token },
        {
          onSuccess: () => {
            setTimeout(() => {
              navigate("/accounts/login");
            }, 2000);
          },
        }
      );
    }
  }, [token, navigate]);

  return (
    <Container className="center-content-between-header-footer">
      <div className="text-center" style={{ maxWidth: "500px", margin: "0 auto" }}>
        <Activity mode={verificationMutation.isPending ? "visible" : "hidden"}>
          <div>
            <Spinner animation="border" variant="primary" style={{ width: "3rem", height: "3rem" }} className="mb-3" />
            <h2 className="mb-3">Verifying Your Email</h2>
            <p className="text-muted">Please wait while we verify your email address...</p>
          </div>
        </Activity>
        <Activity mode={verificationMutation.isError ? "visible" : "hidden"}>
          <div>
            <div className="text-danger mb-3" style={{ fontSize: "4rem" }}>✗</div>
            <h2 className="mb-3 text-danger">Verification Failed</h2>
            <p className="text-muted">
              {verificationMutation.error?.message || "Failed to validate email. The verification link may have expired or is invalid."}
            </p>
          </div>
        </Activity>
        <Activity mode={verificationMutation.isSuccess ? "visible" : "hidden"}>
          <div>
            <div className="text-success mb-3" style={{ fontSize: "4rem" }}>✓</div>
            <h2 className="mb-3 text-success">Email Verified!</h2>
            <p className="text-muted">Your email has been successfully verified. Redirecting to login...</p>
          </div>
        </Activity>
      </div>
    </Container>
  );
}
