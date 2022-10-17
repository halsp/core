import * as net from "net";
import { BodyPraserStartup } from "./body-praser.startup";
import * as http from "http";
import * as https from "https";
import { Request, Response, Dict, isString, Context } from "@ipare/core";
import { NumericalHeadersDict } from "@ipare/http";
import urlParse from "url-parse";
import { Stream } from "stream";

type HttpServerOptions = http.ServerOptions;
type HttpsServerOptions = https.ServerOptions & { https: true };
type ServerType<T extends HttpServerOptions | HttpsServerOptions> =
  T extends HttpServerOptions ? http.Server : https.Server;

export class ServerStartup<
  T extends HttpServerOptions | HttpsServerOptions =
    | HttpServerOptions
    | HttpsServerOptions
> extends BodyPraserStartup {
  readonly #server: ServerType<T>;

  constructor(serverOptions?: T) {
    super((ctx) => ctx.httpReq);

    if (isHttpsOptions(serverOptions)) {
      this.#server = https.createServer(serverOptions, this.#requestListener);
    } else if (serverOptions) {
      this.#server = http.createServer(
        serverOptions,
        this.#requestListener
      ) as ServerType<T>;
    } else {
      this.#server = http.createServer(this.#requestListener) as ServerType<T>;
    }
  }

  listen(
    port?: number,
    hostname?: string,
    backlog?: number,
    listeningListener?: () => void
  ): ServerType<T>;
  listen(
    port?: number,
    hostname?: string,
    listeningListener?: () => void
  ): ServerType<T>;
  listen(
    port?: number,
    backlog?: number,
    listeningListener?: () => void
  ): ServerType<T>;
  listen(port?: number, listeningListener?: () => void): ServerType<T>;
  listen(
    path: string,
    backlog?: number,
    listeningListener?: () => void
  ): ServerType<T>;
  listen(path: string, listeningListener?: () => void): ServerType<T>;
  listen(
    options: net.ListenOptions,
    listeningListener?: () => void
  ): ServerType<T>;
  listen(
    handle: any,
    backlog?: number,
    listeningListener?: () => void
  ): ServerType<T>;
  listen(handle: any, listeningListener?: () => void): ServerType<T>;
  listen(...args: any[]): ServerType<T> {
    return this.#server.listen(...args);
  }

  dynamicListen(
    port?: number,
    hostname?: string,
    backlog?: number,
    listeningListener?: () => void
  ): Promise<{ port?: number; server: ServerType<T> }>;
  dynamicListen(
    port?: number,
    hostname?: string,
    listeningListener?: () => void
  ): Promise<{ port?: number; server: ServerType<T> }>;
  dynamicListen(
    port?: number,
    backlog?: number,
    listeningListener?: () => void
  ): Promise<{ port?: number; server: ServerType<T> }>;
  dynamicListen(
    options: net.ListenOptions,
    listeningListener?: () => void
  ): Promise<{ port?: number; server: ServerType<T> }>;
  async dynamicListen(
    arg0?: number | net.ListenOptions,
    ...args: any[]
  ): Promise<{ port?: number; server: ServerType<T> }> {
    function getPort() {
      let port: number | undefined = undefined;
      if (typeof arg0 == "number") {
        port = arg0;
      } else if (typeof arg0 == "object" && arg0.port) {
        port = arg0.port;
      }

      const nextPort = port ? port + 1 : undefined;
      let next: number | net.ListenOptions | undefined = undefined;
      if (typeof arg0 == "number") {
        next = nextPort;
      } else if (typeof arg0 == "object" && arg0.port) {
        next = { ...arg0, port: nextPort };
      }

      return { port, next: next as any };
    }

    return new Promise<{ port?: number; server: ServerType<T> }>(
      (resolve, reject) => {
        let error = false;
        let listen = false;
        const server = this.#server.listen(arg0, ...args);
        server.once("listening", () => {
          listen = true;
          if (error) return;
          const { port } = getPort();
          resolve({
            port,
            server,
          });
        });
        server.once("error", (err) => {
          error = true;
          if (listen) return;

          server.close();
          if ((err as any).code == "EADDRINUSE") {
            const { next } = getPort();
            this.dynamicListen(next, ...args).then((svr) => {
              resolve(svr);
            });
          } else {
            reject(err);
          }
        });
      }
    );
  }

  #requestListener = async (
    httpReq: http.IncomingMessage,
    httpRes: http.ServerResponse
  ): Promise<void> => {
    const url = urlParse(httpReq.url as string, true);
    const ctx = new Context(
      new Request()
        .setPath(url.pathname)
        .setMethod(httpReq.method as string)
        .setQuery(url.query as Dict<string>)
        .setHeaders(httpReq.headers as NumericalHeadersDict)
    );

    httpRes.statusCode = 404;

    Object.defineProperty(ctx, "httpRes", {
      configurable: false,
      enumerable: false,
      get: () => httpRes,
    });
    Object.defineProperty(ctx, "httpReq", {
      configurable: false,
      enumerable: false,
      get: () => httpReq,
    });

    const res = await this.invoke(ctx);

    if (!httpRes.writableEnded) {
      httpRes.statusCode = res.status;
      this.#writeHead(res, httpRes);
      this.#writeBody(res, httpRes);
    }
  };

  #writeHead(ipareRes: Response, httpRes: http.ServerResponse) {
    if (httpRes.headersSent) return;
    Object.keys(ipareRes.headers)
      .filter((key) => !!ipareRes.headers[key])
      .forEach((key) => {
        httpRes.setHeader(key, ipareRes.headers[key] as string | string[]);
      });
  }

  #writeBody(ipareRes: Response, httpRes: http.ServerResponse) {
    if (!ipareRes.body) {
      httpRes.end();
      return;
    }

    if (ipareRes.body instanceof Stream) {
      ipareRes.body.pipe(httpRes);
    } else if (Buffer.isBuffer(ipareRes.body)) {
      httpRes.end(ipareRes.body);
    } else if (isString(ipareRes.body)) {
      httpRes.end(ipareRes.body);
    } else {
      httpRes.end(JSON.stringify(ipareRes.body));
    }
  }
}

function isHttpsOptions(
  options?: HttpServerOptions | HttpsServerOptions
): options is HttpsServerOptions {
  return !!options && "https" in options && options.https;
}
