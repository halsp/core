import * as net from "net";
import { HttpBodyPraserStartup } from "@ipare/http-body";
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

export class HttpServerStartup<
  T extends HttpServerOptions | HttpsServerOptions =
    | HttpServerOptions
    | HttpsServerOptions
> extends HttpBodyPraserStartup {
  readonly #server: ServerType<T>;

  public get server() {
    return this.#server;
  }

  constructor(serverOptions?: T) {
    super((ctx) => ctx.serverReq);

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
    port: number,
    hostname?: string,
    backlog?: number,
    listeningListener?: () => void
  ): Promise<{ port: number; server: ServerType<T> }>;
  dynamicListen(
    port?: number,
    hostname?: string,
    listeningListener?: () => void
  ): Promise<{ port: number; server: ServerType<T> }>;
  dynamicListen(
    port?: number,
    backlog?: number,
    listeningListener?: () => void
  ): Promise<{ port: number; server: ServerType<T> }>;
  dynamicListen(
    options: net.ListenOptions,
    listeningListener?: () => void
  ): Promise<{ port: number; server: ServerType<T> }>;
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
    serverReq: http.IncomingMessage,
    serverRes: http.ServerResponse
  ): Promise<void> => {
    const url = urlParse(serverReq.url as string, true);
    const ctx = new Context(
      new Request()
        .setPath(url.pathname)
        .setMethod(serverReq.method as string)
        .setQuery(url.query as Dict<string>)
        .setHeaders(serverReq.headers as NumericalHeadersDict)
    );

    serverRes.statusCode = 404;

    Object.defineProperty(ctx, "serverRes", {
      get: () => serverRes,
    });
    Object.defineProperty(ctx, "serverReq", {
      get: () => serverReq,
    });

    const res = await this.invoke(ctx);

    if (!serverRes.writableEnded) {
      serverRes.statusCode = res.status;
      this.#writeHead(res, serverRes);
      this.#writeBody(res, serverRes);
    }
  };

  #writeHead(ipareRes: Response, serverRes: http.ServerResponse) {
    if (serverRes.headersSent) return;
    Object.keys(ipareRes.headers)
      .filter((key) => !!ipareRes.headers[key])
      .forEach((key) => {
        serverRes.setHeader(key, ipareRes.headers[key] as string | string[]);
      });
  }

  #writeBody(ipareRes: Response, serverRes: http.ServerResponse) {
    if (!ipareRes.body) {
      serverRes.end();
      return;
    }

    if (ipareRes.body instanceof Stream) {
      ipareRes.body.pipe(serverRes);
    } else if (Buffer.isBuffer(ipareRes.body)) {
      serverRes.end(ipareRes.body);
    } else if (isString(ipareRes.body)) {
      serverRes.end(ipareRes.body);
    } else {
      serverRes.end(JSON.stringify(ipareRes.body));
    }
  }
}

function isHttpsOptions(
  options?: HttpServerOptions | HttpsServerOptions
): options is HttpsServerOptions {
  return !!options && "https" in options && options.https;
}
