import { Middleware } from "@ipare/core";
import { HttpMethods } from "@ipare/methods";
import { Options } from "./options";

export class CorsMiddleware extends Middleware {
  constructor(private readonly options: Options) {
    super();
  }

  async invoke() {
    this.ctx.res.set("Vary", "Origin");

    if (
      this.ctx.req.method === HttpMethods.options &&
      !this.ctx.req.get("Access-Control-Request-Method")
    ) {
      return await this.next();
    }

    await this.#setCorsHeaders();

    if (this.ctx.req.method === HttpMethods.options) {
      this.noContent();
    } else {
      await this.next();
    }
  }

  async #setCorsHeaders() {
    let origin: string | undefined;
    if (typeof this.options.origin === "function") {
      origin = await this.options.origin(this.ctx);
      if (!origin) return await this.next();
    } else {
      origin = this.options.origin || this.ctx.req.get<string>("Origin");
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

    this.#set("Access-Control-Allow-Origin", origin);
    this.#set("Access-Control-Allow-Credentials", "true", () => credentials);
    this.#set(
      "Cross-Origin-Opener-Policy",
      "same-origin",
      () => !!this.options.secureContext
    );
    this.#set(
      "Cross-Origin-Embedder-Policy",
      "require-corp",
      () => !!this.options.secureContext
    );

    if (this.ctx.req.method === HttpMethods.options) {
      this.#set(
        "Access-Control-Max-Age",
        this.options.maxAge,
        () => !!this.options.maxAge
      );
      this.#set(
        "Access-Control-Allow-Private-Network",
        this.options.privateNetworkAccess,
        () =>
          !!this.options.privateNetworkAccess &&
          !!this.ctx.req.has("Access-Control-Request-Private-Network")
      );
      this.#set(
        "Access-Control-Allow-Methods",
        allowMethods,
        () => !!allowMethods
      );

      let allowHeaders = this.options.allowHeaders;
      if (!allowHeaders) {
        allowHeaders = this.ctx.req.get("Access-Control-Request-Headers");
      }
      if (allowHeaders) {
        this.ctx.res.set("Access-Control-Allow-Headers", allowHeaders);
      }
    } else {
      this.#set(
        "Access-Control-Expose-Headers",
        this.options.exposeHeaders,
        () => !!this.options.exposeHeaders
      );
    }
  }

  #set(key: string, value: any, fn?: () => boolean) {
    if (!fn || fn()) {
      this.ctx.res.set(key, value);
    }
  }
}
