import { BodyPraserStartup } from "@halsp/body";
import * as net from "net";
import * as http from "http";
import * as https from "https";
import {
  Request,
  Response,
  Dict,
  isString,
  Context,
  closeServer,
  dynamicListen,
  logAddress,
} from "@halsp/common";
import { NumericalHeadersDict } from "@halsp/http";
import qs from "qs";
import { Stream } from "stream";

type HttpNativeOptions = http.ServerOptions;
type HttpsNativeOptions = https.ServerOptions & { https: true };
type ServerType<T extends HttpNativeOptions | HttpsNativeOptions> =
  T extends HttpNativeOptions ? http.Server : https.Server;

export class NativeStartup<
  T extends HttpNativeOptions | HttpsNativeOptions =
    | HttpNativeOptions
    | HttpsNativeOptions
> extends BodyPraserStartup {
  protected readonly server!: ServerType<T>;

  constructor(serverOptions?: T) {
    super((ctx) => ctx.reqStream);

    if (isHttpsOptions(serverOptions)) {
      this.server = https.createServer(serverOptions, this.#requestListener);
    } else if (serverOptions) {
      this.server = http.createServer(
        serverOptions,
        this.#requestListener
      ) as ServerType<T>;
    } else {
      this.server = http.createServer(this.#requestListener) as ServerType<T>;
    }

    this.server.on("listening", () => {
      logAddress(this.server, this.logger, "http://localhost");
    });
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
  listen(...args: any[]) {
    return this.server.listen(...args);
  }

  dynamicListen(
    port?: number,
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
  async dynamicListen(...args: any[]) {
    const port = await dynamicListen(this.server, ...args);
    return {
      port,
      server: this.server,
    };
  }

  #requestListener = async (
    reqStream: http.IncomingMessage,
    resStream: http.ServerResponse
  ): Promise<void> => {
    const pathname = (reqStream.url as string).split("?")[0];
    const query = qs.parse((reqStream.url as string).split("?")[1]);
    const ctx = new Context(
      new Request()
        .setPath(pathname)
        .setMethod(reqStream.method as string)
        .setQuery(query as Dict<string>)
        .setHeaders(reqStream.headers as NumericalHeadersDict)
    );

    resStream.statusCode = 404;

    Object.defineProperty(ctx, "resStream", {
      get: () => resStream,
    });
    Object.defineProperty(ctx, "reqStream", {
      get: () => reqStream,
    });

    const res = await this.invoke(ctx);

    if (!resStream.writableEnded) {
      resStream.statusCode = res.status;
      this.#writeHead(res, resStream);
      this.#writeBody(res, resStream);
    }
  };

  #writeHead(halspRes: Response, resStream: http.ServerResponse) {
    if (resStream.headersSent) return;
    Object.keys(halspRes.headers)
      .filter((key) => !!halspRes.headers[key])
      .forEach((key) => {
        resStream.setHeader(key, halspRes.headers[key] as string | string[]);
      });
  }

  #writeBody(halspRes: Response, resStream: http.ServerResponse) {
    if (!halspRes.body) {
      resStream.end();
      return;
    }

    if (halspRes.body instanceof Stream) {
      halspRes.body.pipe(resStream);
    } else if (Buffer.isBuffer(halspRes.body)) {
      resStream.end(halspRes.body);
    } else if (isString(halspRes.body)) {
      resStream.end(halspRes.body);
    } else {
      resStream.end(JSON.stringify(halspRes.body));
    }
  }

  async close() {
    await closeServer(this.server, this.logger);
  }
}

function isHttpsOptions(
  options?: HttpNativeOptions | HttpsNativeOptions
): options is HttpsNativeOptions {
  return !!options && "https" in options && !!options.https;
}
