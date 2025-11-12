import { Button, Container, Form, Image } from "react-bootstrap";
import logo from "../../../../assets/logo.svg";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { NavLink } from "react-router";

interface SignupForm {
  username: string;
  password: string;
  confirm: string;
  email: string;
}

export default function PlatformAccountsSignup() {
  const [form, setForm] = useState<SignupForm>({
    username: "",
    password: "",
    confirm: "",
    email: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    console.log(form)
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // TODO: POST Request
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
