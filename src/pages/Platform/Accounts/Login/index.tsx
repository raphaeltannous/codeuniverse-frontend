import { Button, Container, Form, Image } from "react-bootstrap";
import logo from "~/assets/logo.svg";
import { Activity, useState, type ChangeEvent, type FormEvent } from "react";
import { NavLink } from "react-router";
import type { LoginForm } from "~/types/auth/login";
import { useLogin } from "~/hooks/useLogin";

export default function PlatformAccountsLogin() {
  const { loginMutation } = useLogin();

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
      <div className="p-4 m-2 platform-signup rounded-4 bg-body-secondary">
        <div className="text-center mb-4">
          <Image src={logo} width={60} height={60} alt="Logo" />
          <h5 className="mt-2">Login</h5>
        </div>

        <Form onSubmit={handleSubmit}>
          <Form.Control
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="Username"
            className="mb-3"
            autoComplete="username"
          />
          <Form.Control
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            className="mb-3"
            autoComplete="current-password"
          />

          <Activity mode={loginMutation.isError ? 'visible' : 'hidden'}>
            <div className="text-danger mb-3 text-center">
              {loginMutation.error?.message}
            </div>
          </Activity>

          <Button type="submit" variant="secondary" className="w-100 mb-3" disabled={loginMutation.isPending}>
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
