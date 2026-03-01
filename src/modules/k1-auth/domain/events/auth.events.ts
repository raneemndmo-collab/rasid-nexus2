export const AUTH_EVENTS = {
  TOKEN_ISSUED: 'auth.token.issued',
  TOKEN_VALIDATED: 'auth.token.validated',
  TOKEN_REVOKED: 'auth.token.revoked',
  LOGIN_SUCCESS: 'auth.login.success',
  LOGIN_FAILED: 'auth.login.failed',
  RATE_LIMIT_EXCEEDED: 'auth.rate_limit.exceeded',
} as const;

export interface TokenIssuedPayload {
  userId: string;
  email: string;
  roles: string[];
}

export interface LoginFailedPayload {
  email: string;
  reason: string;
  ipAddress: string;
}
