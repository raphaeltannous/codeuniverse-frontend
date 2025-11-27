export interface SignupForm {
  username: string;
  password: string;
  confirm: string;
  email: string;
}

export type SignupResponse = {
  jwtToken: string;
};
