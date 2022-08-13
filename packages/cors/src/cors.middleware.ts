import { HttpMethod, Middleware } from "@ipare/core";
import { Options } from "./options";

export class CorsMiddleware extends Middleware {
  constructor(private readonly options: Options) {
    super();
  }

  async invoke() {
    this.ctx.res.setHeader("Vary", "Origin");

    if (!this.ctx.req.hasHeader("Origin")) {
      return await this.next();
    }
    if (
      this.ctx.req.method === HttpMethod.options &&
      !this.ctx.req.getHeader("Access-Control-Request-Method")
    ) {
      return await this.next();
    }

    await this.#setCorsHeaders();

    if (this.ctx.req.method === HttpMethod.options) {
      this.noContent();
    } else {
      await this.next();
    }
  }

  async #setCorsHeaders() {
    let origin: string | undefined;
    if (typeof this.options.origin === "function") {
      origin = await this.options.origin(this.ctx);
    } else {
      origin = this.options.origin || this.ctx.req.getHeader<string>("Origin");
    }
    if (!origin) {
      return await this.next();
    }

    let credentials: boolean;
    if (typeof this.options.credentials === "function") {
      credentials = await this.options.credentials(this.ctx);
    } else {
      credentials = !!this.options.credentials;
    }

    const allowMethods = this.options.allowMethods ?? [
      "GET",
      "HEAD",
      "PUT",
      "POST",
      "DELETE",
      "PATCH",
    ];

    this.#setHeader("Access-Control-Allow-Origin", origin);
    this.#setHeader(
      "Access-Control-Allow-Credentials",
      "true",
      () => credentials
    );
    this.#setHeader(
      "Cross-Origin-Opener-Policy",
      "same-origin",
      () => !!this.options.secureContext
    );
    this.#setHeader(
      "Cross-Origin-Embedder-Policy",
      "require-corp",
      () => !!this.options.secureContext
    );

    if (this.ctx.req.method === HttpMethod.options) {
      this.#setHeader(
        "Access-Control-Max-Age",
        this.options.maxAge,
        () => !!this.options.maxAge
      );
      this.#setHeader(
        "Access-Control-Allow-Private-Network",
        this.options.privateNetworkAccess,
        () =>
          !!this.options.privateNetworkAccess &&
          !!this.ctx.req.hasHeader("Access-Control-Request-Private-Network")
      );
      this.#setHeader(
        "Access-Control-Allow-Methods",
        allowMethods,
        () => !!allowMethods
      );

      let allowHeaders = this.options.allowHeaders;
      if (!allowHeaders) {
        allowHeaders = this.ctx.req.getHeader("Access-Control-Request-Headers");
      }
      if (allowHeaders) {
        this.ctx.res.setHeader("Access-Control-Allow-Headers", allowHeaders);
      }
    } else {
      this.#setHeader(
        "Access-Control-Expose-Headers",
        this.options.exposeHeaders,
        () => !!this.options.exposeHeaders
      );
    }
  }

  #setHeader(key: string, value: any, fn?: () => boolean) {
    if (!fn || fn()) {
      this.ctx.res.setHeader(key, value);
    }
  }
}
