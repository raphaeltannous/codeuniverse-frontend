export interface PasswordResetForm {
  token: string;
  password: string;
  confirm: string;
}

export type PasswordResetResponse = {
  message: string;
};
