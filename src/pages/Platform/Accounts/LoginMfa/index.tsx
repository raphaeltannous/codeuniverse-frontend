import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import { Button, Container, Form, Image } from "react-bootstrap";
import logo from "../../../../assets/logo.svg";
import { useNavigate, useSearchParams } from "react-router";

interface MFAForm {
  code: string;
}

export default function PlatformAccountsLoginMFA() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";

  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/accounts/login");
    }
  }, [token, navigate]);

  const [form, setForm] = useState<MFAForm>({
    code: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO
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
            maxLength={6}
            autoComplete="one-time-code"
          />

          <Button type="submit" variant="secondary" className="w-100 mb-3">
            Verify Code
          </Button>

          <div className="text-center text-muted small">
            Didn’t get it? <a href="#">Resend code</a>
          </div>
        </Form>
      </div>
    </Container>
  );
}
