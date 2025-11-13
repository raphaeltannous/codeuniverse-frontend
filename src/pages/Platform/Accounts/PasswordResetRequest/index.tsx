import { useState, ChangeEvent, FormEvent } from "react";
import { Button, Container, Form, Image } from "react-bootstrap";
import logo from "../../../../assets/logo.svg";
import { NavLink } from "react-router";

interface PasswordRequestForm {
  email: string;
}

export default function PlatformAccountsPasswordResetRequest() {
  const [form, setForm] = useState<PasswordRequestForm>({
    email: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    // TODO
    e.preventDefault();
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
