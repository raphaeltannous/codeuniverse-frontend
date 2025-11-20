export interface MfaForm {
  token: string;
  code: string;
}

export type MfaResponse = {
  jwtToken: string;
};
