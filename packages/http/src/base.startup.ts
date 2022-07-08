import * as net from "net";
import { HttpBodyPraserStartup } from "./http-body-praser.startup";
import * as http from "http";
import {
  HttpContext,
  SfaRequest,
  SfaResponse,
  Dict,
  NumericalHeadersDict,
  isString,
} from "@sfajs/core";
import urlParse from "url-parse";
import { Stream } from "stream";

export abstract class BaseStartup<
  T extends net.Server = net.Server
> extends HttpBodyPraserStartup {
  constructor() {
    super((ctx) => ctx.httpReq);
  }

  abstract readonly server: T;

  listen(
    port?: number,
    hostname?: string,
    backlog?: number,
    listeningListener?: () => void
  ): T;
  listen(port?: number, hostname?: string, listeningListener?: () => void): T;
  listen(port?: number, backlog?: number, listeningListener?: () => void): T;
  listen(port?: number, listeningListener?: () => void): T;
  listen(path: string, backlog?: number, listeningListener?: () => void): T;
  listen(path: string, listeningListener?: () => void): T;
  listen(options: net.ListenOptions, listeningListener?: () => void): T;
  listen(handle: any, backlog?: number, listeningListener?: () => void): T;
  listen(handle: any, listeningListener?: () => void): T;
  listen(...args: any[]): T {
    return this.server.listen(...args);
  }

  dynamicListen(
    port?: number,
    hostname?: string,
    backlog?: number,
    listeningListener?: () => void
  ): Promise<{ port?: number; server: T }>;
  dynamicListen(
    port?: number,
    hostname?: string,
    listeningListener?: () => void
  ): Promise<{ port?: number; server: T }>;
  dynamicListen(
    port?: number,
    backlog?: number,
    listeningListener?: () => void
  ): Promise<{ port?: number; server: T }>;
  dynamicListen(
    options: net.ListenOptions,
    listeningListener?: () => void
  ): Promise<{ port?: number; server: T }>;
  async dynamicListen(
    arg0?: number | net.ListenOptions,
    ...args: any[]
  ): Promise<{ port?: number; server: T }> {
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

    return new Promise<{ port?: number; server: T }>((resolve, reject) => {
      let error = false;
      let listen = false;
      const server = this.server.listen(arg0, ...args);
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
    });
  }

  protected requestListener = async (
    httpReq: http.IncomingMessage,
    httpRes: http.ServerResponse
  ): Promise<void> => {
    const url = urlParse(httpReq.url as string, true);
    const ctx = new HttpContext(
      new SfaRequest()
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

    const sfaRes = await this.invoke(ctx);

    if (!httpRes.writableEnded) {
      httpRes.statusCode = sfaRes.status;
      this.#writeHead(sfaRes, httpRes);
      this.#writeBody(sfaRes, httpRes);
    }
  };

  #writeHead(sfaRes: SfaResponse, httpRes: http.ServerResponse) {
    if (httpRes.headersSent) return;
    Object.keys(sfaRes.headers)
      .filter((key) => !!sfaRes.headers[key])
      .forEach((key) => {
        httpRes.setHeader(key, sfaRes.headers[key] as string | string[]);
      });
  }

  #writeBody(sfaRes: SfaResponse, httpRes: http.ServerResponse) {
    if (!sfaRes.body) {
      if (!httpRes.headersSent) {
        httpRes.removeHeader("Content-Type");
        httpRes.removeHeader("Content-Length");
      }
      httpRes.end();
      return;
    }

    if (sfaRes.body instanceof Stream) {
      sfaRes.body.pipe(httpRes);
    } else if (Buffer.isBuffer(sfaRes.body)) {
      httpRes.end(sfaRes.body);
    } else if (isString(sfaRes.body)) {
      httpRes.end(sfaRes.body);
    } else {
      httpRes.end(JSON.stringify(sfaRes.body));
    }
  }
}
