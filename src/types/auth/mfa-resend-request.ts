export interface MfaResendRequest {
  token: string;
}

export type MfaResendRequestResponse = {
  newToken: string;
};
