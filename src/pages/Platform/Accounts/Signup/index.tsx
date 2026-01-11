import { Button, Container, Form, Image } from "react-bootstrap";
import logo from "../../../../assets/logo.svg";
import { Activity, useState, type ChangeEvent, type FormEvent } from "react";
import { NavLink } from "react-router";
import type { SignupForm } from "~/types/auth/signup";
import { useSignup } from "~/hooks/useSignup";

export default function PlatformAccountsSignup() {
  const { signupMutation } = useSignup();

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
          <h5 className="mt-2">Signup</h5>
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
            autoComplete="new-password"
          />
          <Form.Control
            type="password"
            name="confirm"
            value={form.confirm}
            onChange={handleChange}
            placeholder="Confirm Password"
            className="mb-3"
            autoComplete="new-password"
          />
          <Form.Control
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            className="mb-3"
            autoComplete="email"
          />

          <Activity mode={signupMutation.isError ? 'visible' : 'hidden'}>
            <div className="text-danger mb-3 text-center">
              {signupMutation.error?.message}
            </div>
          </Activity>

          <Button type="submit" variant="secondary" className="w-100 mb-3" disabled={signupMutation.isPending}>
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
