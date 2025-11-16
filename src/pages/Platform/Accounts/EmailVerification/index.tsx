import { useMutation } from "@tanstack/react-query";
import { Activity, useEffect } from "react";
import { Container, Spinner } from "react-bootstrap";
import { useNavigate, useSearchParams } from "react-router";

interface VerificationForm {
  token: string;
}

export default function PlatformAccountsEmailVerification() {
  const navigate = useNavigate();

  const emailVerificationMutation = useMutation({
    mutationFn: async (body: VerificationForm) => {
      const res = await fetch("/api/auth/signup/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Verification Failed.");
      return res.text();
    },

    onSuccess: () => {
      setTimeout(() => {
        navigate("/accounts/login");
      }, 2000);
    }
  });

  const [params] = useSearchParams();
  const token = params.get("token") || "";

  useEffect(() => {
    if (!token) {
      navigate("/accounts/login");
    } else {
      const verificationForm: VerificationForm = {
        token: token,
      }
      emailVerificationMutation.mutate(verificationForm)
    }
  }, [token, navigate]);

  return (
    <Container className="center-content-between-header-footer">
      <Activity mode={emailVerificationMutation.isPending ? "visible" : "hidden"}>
        <div className="text-center text-warning">
          <h1>Verifying your email</h1>
          <Spinner animation="border" variant="warning" />
        </div>
      </Activity>
      <Activity mode={emailVerificationMutation.isError ? "visible" : "hidden"}>
        <div className="text-danger">
          Failed to validate email.
        </div>
      </Activity>
      <Activity mode={emailVerificationMutation.isSuccess ? "visible" : "hidden"}>
        <div className="text-success">
          Email Verification Success. Redirecting...
        </div>
      </Activity>
    </Container>
  );
}
