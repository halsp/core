import {
  JwtSecretRequestType,
  JwtSignOptions,
  JwtVerifyOptions,
} from "./jwt-options";
import * as jwt from "jsonwebtoken";
import { HttpContext } from "@ipare/core";
import { OPTIONS } from "./constant";
import { Inject } from "@ipare/inject";

export class JwtService {
  @Inject((ctx) => ctx)
  private readonly ctx!: HttpContext;

  get #options() {
    return this.ctx[OPTIONS];
  }

  sign(
    payload: string | Buffer | object,
    options?: JwtSignOptions
  ): Promise<string> {
    const signOptions = this.#mergeJwtOptions(
      { ...options },
      "signOptions"
    ) as jwt.SignOptions;
    const secret = this.#getSecretKey(
      payload,
      options,
      "privateKey",
      JwtSecretRequestType.SIGN
    );

    return new Promise((resolve, reject) =>
      jwt.sign(payload, secret, signOptions, (err, encoded) =>
        err ? reject(err) : resolve(encoded as string)
      )
    );
  }

  verify(
    token: string,
    options?: JwtVerifyOptions & { complete: true }
  ): Promise<jwt.Jwt>;
  verify(token: string, options?: JwtVerifyOptions): Promise<jwt.JwtPayload>;
  verify(token: string, options?: JwtVerifyOptions) {
    token = this.#fixToken(token);
    const verifyOptions = this.#mergeJwtOptions(
      { ...options },
      "verifyOptions"
    );
    const secret = this.#getSecretKey(
      token,
      options,
      "publicKey",
      JwtSecretRequestType.VERIFY
    );

    return new Promise((resolve, reject) =>
      jwt.verify(token, secret, verifyOptions, (err, decoded) =>
        err ? reject(err) : resolve(decoded)
      )
    );
  }

  decode(
    token: string,
    options?: jwt.DecodeOptions & { complete: true }
  ): jwt.Jwt | null;
  decode(
    token: string,
    options?: jwt.DecodeOptions & { json: true }
  ): jwt.JwtPayload | null;
  decode(
    token: string,
    options?: jwt.DecodeOptions & { json: false }
  ): any | null;
  decode(token: string, options?: jwt.DecodeOptions): any {
    token = this.#fixToken(token);
    return jwt.decode(token, options);
  }

  #mergeJwtOptions(
    options: JwtVerifyOptions | JwtSignOptions,
    key: "verifyOptions" | "signOptions"
  ): jwt.VerifyOptions | jwt.SignOptions {
    delete options.secret;
    if (key === "signOptions") {
      delete (options as JwtSignOptions).privateKey;
    } else {
      delete (options as JwtVerifyOptions).publicKey;
    }
    return {
      ...(this.#options[key] || {}),
      ...options,
    };
  }

  #getSecretKey(
    token: string | object | Buffer,
    options: JwtVerifyOptions | JwtSignOptions | undefined,
    key: "publicKey" | "privateKey",
    secretRequestType: JwtSecretRequestType
  ): string | Buffer | jwt.Secret {
    if (this.#options.secretOrKeyProvider) {
      return this.#options.secretOrKeyProvider(
        secretRequestType,
        token,
        options
      );
    }

    return (
      options?.secret ||
      this.#options.secret ||
      (options && options[key]) ||
      this.#options[key]
    );
  }

  #fixToken(token: string) {
    const prefix = this.#options.prefix ?? "Bearer";
    if (token?.startsWith(prefix)) {
      token = token.substring(prefix.length, token.length).trim();
    }
    return token;
  }
}
