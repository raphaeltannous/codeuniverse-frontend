import { Button, Container, Form, Image } from "react-bootstrap";
import logo from "../../../../assets/logo.svg";
import { NavLink } from "react-router";
import { Activity, useState, type ChangeEvent, type FormEvent } from "react";
import type { PasswordRequestForm, PasswordRequestResponse } from "~/types/auth/password-request";
import type { APIError } from "~/types/api-error";
import { useMutation } from "@tanstack/react-query";

export default function PlatformAccountsPasswordResetRequest() {
  const passwordRequestMutation = useMutation<PasswordRequestResponse, APIError, PasswordRequestForm>({
    mutationFn: async (body: PasswordRequestForm) => {
      const res = await fetch("/api/auth/password/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = (await res.json()) as APIError;
        throw err;
      };

      return (await res.json()) as PasswordRequestResponse;
    },
  });

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
      <div className="p-4 m-2 shadow platform-signup rounded-4 bg-body-secondary">
        <div className="text-center mb-4">
          <Image src={logo} width={60} height={60} alt="Logo" />
          <h5 className="mt-2">CodeUniverse</h5>
        </div>

        <Form onSubmit={handleSubmit}>
          <Form.Control
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Your account email"
            className="mb-3"
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

          <Button type="submit" variant="secondary" className="w-100 mb-3">
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
