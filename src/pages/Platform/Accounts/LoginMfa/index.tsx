import { useState, useEffect, type ChangeEvent, type FormEvent, Activity } from "react";
import { Button, Container, Form, Image } from "react-bootstrap";
import logo from "../../../../assets/logo.svg";
import { useNavigate, useSearchParams } from "react-router";
import type { MfaForm } from "~/types/auth/mfa";
import { useMfa } from "~/hooks/useMfa";

export default function PlatformAccountsLoginMFA() {
  const navigate = useNavigate();
  const { mfaMutation, mfaResendRequestMutation } = useMfa();

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
          <h5 className="mt-2">MFA Verification</h5>
          <p className="text-muted small mt-2">Enter your 7-digit MFA code</p>
        </div>

        <Form onSubmit={handleSubmit}>
          <Form.Control
            name="code"
            value={form.code}
            onChange={handleChange}
            placeholder="1234567"
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
