export interface JWTHeader {
  alg: string;
  typ: string;
}

export interface JWTPayload {
  sub: string;
  name: string;
  iat: number;
  role?: string;
}
