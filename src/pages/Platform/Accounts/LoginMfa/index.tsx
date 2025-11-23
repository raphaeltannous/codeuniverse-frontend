import { useState, useEffect, type ChangeEvent, type FormEvent, Activity } from "react";
import { Button, Container, Form, Image } from "react-bootstrap";
import logo from "../../../../assets/logo.svg";
import { useNavigate, useSearchParams } from "react-router";
import { useMutation } from "@tanstack/react-query";
import type { MfaForm, MfaResponse } from "~/types/auth/mfa";
import type { APIError } from "~/types/api-error";
import type { MfaResendRequestResponse, MfaResendRequest } from "~/types/auth/mfa-resend-request";

export default function PlatformAccountsLoginMFA() {
  const navigate = useNavigate();

  const mfaMutation = useMutation<MfaResponse, APIError, MfaForm>({
    mutationFn: async (body: MfaForm) => {
      const res = await fetch("/api/auth/login/mfa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = (await res.json()) as APIError;
        throw err;
      }

      return (await res.json()) as MfaResponse;
    },

    onSuccess: (response) => {
      localStorage.setItem("token", response.jwtToken)

      navigate("/problems")
    },
  });

  const mfaResendRequestMutation = useMutation<MfaResendRequestResponse, APIError, MfaResendRequest>({
    mutationFn: async (body: MfaResendRequest) => {
      const res = await fetch("/api/auth/login/mfa/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = (await res.json()) as APIError;
        throw err;
      }

      return (await res.json()) as MfaResendRequestResponse;
    },

    onSuccess: (response) => {
      form.token = response.newToken
      navigate(`?token=${response.newToken}`)
    },
  })

  const [params] = useSearchParams();
  const token = params.get("token") || "";

  useEffect(() => {
    if (!token) {
      navigate("/accounts/login");
    }
  }, [token, navigate]);

  const [form, setForm] = useState<MfaForm>({
    token: token,
    code: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    mfaMutation.mutate(form);
  };

  const handleResendClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    mfaResendRequestMutation.mutate({ token: token })
  };

  return (
    <Container className="center-content-between-header-footer">
      <div className="p-4 m-2 shadow platform-signup rounded-4 bg-body-secondary">
        <div className="text-center mb-4">
          <Image src={logo} width={60} height={60} alt="Logo" />
          <h5 className="mt-2">CodeUniverse</h5>
          <p className="text-muted small mt-2">Enter your 6-digit MFA code</p>
        </div>

        <Form onSubmit={handleSubmit}>
          <Form.Control
            name="code"
            value={form.code}
            onChange={handleChange}
            placeholder="123456"
            className="mb-3 text-center"
            maxLength={7}
            autoComplete="one-time-code"
          />

          <Activity mode={mfaMutation.isError ? 'visible' : 'hidden'}>
            <div className="text-danger mb-3 text-center">
              {mfaMutation.error?.message}
            </div>
          </Activity>

          <Button type="submit" variant="secondary" className="w-100 mb-3">
            Verify Code
          </Button>

          <div className="text-center text-muted small">
            Didn’t get it? <a href="#" onClick={handleResendClick}>Resend code</a>
          </div>

          <Activity mode={mfaResendRequestMutation.isError ? 'visible' : 'hidden'}>
            <div className="text-danger mt-3 text-center">
              {mfaResendRequestMutation.error?.message}
            </div>
          </Activity>
          <Activity mode={mfaResendRequestMutation.isSuccess ? 'visible' : 'hidden'}>
            <div className="text-success mt-3 text-center">
              Email is sent.
            </div>
          </Activity>
        </Form>
      </div>
    </Container>
  );
}
