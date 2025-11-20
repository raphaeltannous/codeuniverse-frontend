import { Button, Container, Form, Image } from "react-bootstrap";
import logo from "../../../../assets/logo.svg";
import { NavLink, useNavigate, useSearchParams } from "react-router";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import type { PasswordResetForm } from "~/types/auth/password-reset";

export default function PlatformAccountsPasswordReset() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";

  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/accounts/password/request");
    }
  }, [token, navigate]);

  const [form, setForm] = useState<PasswordResetForm>({
    password: "",
    confirm: "",
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
        </div>

        <Form onSubmit={handleSubmit}>
          <Form.Control
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="New password"
            className="mb-3"
          />

          <Form.Control
            type="password"
            name="confirm"
            value={form.confirm}
            onChange={handleChange}
            placeholder="Confirm password"
            className="mb-3"
          />

          <Button type="submit" variant="secondary" className="w-100 mb-3">
            Reset Password
          </Button>

          <div className="text-center text-muted">
            Remember Password? <NavLink to="accounts/login">Sign In</NavLink>
          </div>
        </Form>
      </div>
    </Container>
  );
}
