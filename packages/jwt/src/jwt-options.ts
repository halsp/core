import { Request } from "@ipare/core";
import * as jwt from "jsonwebtoken";

export enum JwtSecretRequestType {
  SIGN,
  VERIFY,
}

export interface JwtOptions {
  signOptions?: jwt.SignOptions;
  secret?: string | Buffer;
  publicKey?: string | Buffer;
  privateKey?: jwt.Secret;
  secretOrKeyProvider?: (
    requestType: JwtSecretRequestType,
    tokenOrPayload: string | object | Buffer,
    options?: jwt.VerifyOptions | jwt.SignOptions
  ) => jwt.Secret;
  verifyOptions?: jwt.VerifyOptions;
  tokenProvider?: (req: Request) => string;
  prefix?: string;
}

export interface JwtSignOptions extends jwt.SignOptions {
  secret?: string | Buffer;
  privateKey?: string | Buffer;
}

export interface JwtVerifyOptions extends jwt.VerifyOptions {
  secret?: string | Buffer;
  publicKey?: string | Buffer;
}
