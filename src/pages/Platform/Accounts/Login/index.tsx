import { Button, Container, Form, Image } from "react-bootstrap";
import logo from "../../../../assets/logo.svg";
import { Activity, useState, type ChangeEvent, type FormEvent } from "react";
import { NavLink } from "react-router";
import { useMutation } from "@tanstack/react-query";

interface LoginForm {
  username: string;
  password: string;
}

type APIError = {
  code: string;
  message: string;
}

type LoginResponse = {
  username: string; // TODO do we actually need the username?
  mfaToken: string;
};

export default function PlatformAccountsLogin() {
  const loginMutation = useMutation<LoginResponse, APIError, LoginForm>({
    mutationFn: async (body: LoginForm) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = (await res.json()) as APIError;
        throw err;
      };

      return (await res.json()) as LoginResponse;
    },
  });

  const [form, setForm] = useState<LoginForm>({
    username: "",
    password: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    loginMutation.mutate(form);
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

          <Activity mode={loginMutation.isSuccess ? 'visible' : 'hidden'}>
            <div className="text-success mb-3 text-center">
              User login: {loginMutation.data?.username}
            </div>
          </Activity>
          <Activity mode={loginMutation.isError ? 'visible' : 'hidden'}>
            <div className="text-danger mb-3 text-center">
              {loginMutation.error?.message}
            </div>
          </Activity>

          <Button type="submit" variant="secondary" className="w-100 mb-3">
            Sign In
          </Button>

          <div className="d-flex justify-content-between text-muted">
            <NavLink to="/accounts/password/request">Forgot Password?</NavLink>
            <NavLink to="/accounts/signup">Sign Up</NavLink>
          </div>
        </Form>
      </div>
    </Container>
  )
}
