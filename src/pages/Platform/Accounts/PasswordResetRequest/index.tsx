import { Button, Container, Form, Image } from "react-bootstrap";
import logo from "../../../../assets/logo.svg";
import { NavLink } from "react-router";
import { Activity, useState, type ChangeEvent, type FormEvent } from "react";
import type { PasswordRequestForm } from "~/types/auth/password-request";
import { usePasswordRequest } from "~/hooks/usePasswordRequest";

export default function PlatformAccountsPasswordResetRequest() {
  const { passwordRequestMutation } = usePasswordRequest();

  const [form, setForm] = useState<PasswordRequestForm>({
    email: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    passwordRequestMutation.mutate(form);
  };

  return (
    <Container className="center-content-between-header-footer">
      <div className="p-4 m-2 platform-signup rounded-4 bg-body-secondary">
        <div className="text-center mb-4">
          <Image src={logo} width={60} height={60} alt="Logo" />
          <h5 className="mt-2">Password Reset</h5>
        </div>

        <Form onSubmit={handleSubmit}>
          <Form.Control
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Your account email"
            className="mb-3"
            autoComplete="email"
          />

          <Activity mode={passwordRequestMutation.isError ? 'visible' : 'hidden'}>
            <div className="text-danger mb-3 text-center">
              {passwordRequestMutation.error?.message}
            </div>
          </Activity>
          <Activity mode={passwordRequestMutation.isSuccess ? 'visible' : 'hidden'}>
            <div className="text-success mb-3 text-center">
              {passwordRequestMutation.data?.message}
            </div>
          </Activity>

          <Button type="submit" variant="secondary" className="w-100 mb-3" disabled={passwordRequestMutation.isPending}>
            Send reset email
          </Button>

          <div className="text-center text-muted">
            Remember your password? <NavLink to="/accounts/login">Sign In</NavLink>
          </div>
        </Form>
      </div>
    </Container>
  );
}
