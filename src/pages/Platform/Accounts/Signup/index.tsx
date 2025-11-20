import { Button, Container, Form, Image } from "react-bootstrap";
import logo from "../../../../assets/logo.svg";
import { Activity, useState, type ChangeEvent, type FormEvent } from "react";
import { NavLink } from "react-router";
import { useMutation } from "@tanstack/react-query";
import type { APIError } from "~/types/api_error";
import type { SignupForm, SignupResponse } from "~/types/auth/signup";

export default function PlatformAccountsSignup() {
  const signupMutation = useMutation<SignupResponse, APIError, SignupForm>({
    mutationFn: async (body: SignupForm) => {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = (await res.json()) as APIError;
        throw err;
      };

      return (await res.json()) as SignupResponse;
    },
  });

  const [form, setForm] = useState<SignupForm>({
    username: "",
    password: "",
    confirm: "",
    email: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    signupMutation.mutate(form);
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
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="Username"
            className="mb-3"
          />
          <Form.Control
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            className="mb-3"
          />
          <Form.Control
            type="password"
            name="confirm"
            value={form.confirm}
            onChange={handleChange}
            placeholder="Confirm Password"
            className="mb-3"
          />
          <Form.Control
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            className="mb-3"
          />

          <Activity mode={signupMutation.isSuccess ? 'visible' : 'hidden'}>
            <div className="text-success mb-3 text-center">
              User created: {signupMutation.data?.username}
            </div>
          </Activity>
          <Activity mode={signupMutation.isError ? 'visible' : 'hidden'}>
            <div className="text-danger mb-3 text-center">
              {signupMutation.error?.message}
            </div>
          </Activity>

          <Button type="submit" variant="secondary" className="w-100 mb-3">
            Sign Up
          </Button>

          <div className="text-center text-muted">
            Have an account? <NavLink to="/accounts/login">Sign In</NavLink>
          </div>
        </Form>
      </div>
    </Container>
  )
}
