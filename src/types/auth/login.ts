export interface LoginForm {
  username: string;
  password: string;
}

export type LoginResponse = {
  username: string; // TODO do we actually need the username?
  mfaToken: string;
};
