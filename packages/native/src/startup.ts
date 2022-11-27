import { BodyPraserStartup } from "@ipare/body";
import * as http from "http";
import * as https from "https";
import {
  Request,
  Response,
  Dict,
  isString,
  Context,
  IpareNetListener,
  initNetListener,
} from "@ipare/core";
import { NumericalHeadersDict } from "@ipare/http";
import urlParse from "url-parse";
import { Stream } from "stream";

type HttpNativeOptions = http.ServerOptions;
type HttpsNativeOptions = https.ServerOptions & { https: true };
type ServerType<T extends HttpNativeOptions | HttpsNativeOptions> =
  T extends HttpNativeOptions ? http.Server : https.Server;

export class NativeStartup<
    T extends HttpNativeOptions | HttpsNativeOptions =
      | HttpNativeOptions
      | HttpsNativeOptions
  >
  extends BodyPraserStartup
  implements IpareNetListener<ServerType<T>>
{
  readonly #server!: ServerType<T>;

  constructor(serverOptions?: T) {
    super((ctx) => ctx.reqStream);

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

    initNetListener(this, this.#server);
  }

  listen = undefined as any as IpareNetListener<ServerType<T>>["listen"];
  dynamicListen = undefined as any as IpareNetListener<
    ServerType<T>
  >["dynamicListen"];

  // listen(
  //   port?: number,
  //   hostname?: string,
  //   backlog?: number,
  //   listeningListener?: () => void
  // ): ServerType<T>;
  // listen(
  //   port?: number,
  //   hostname?: string,
  //   listeningListener?: () => void
  // ): ServerType<T>;
  // listen(
  //   port?: number,
  //   backlog?: number,
  //   listeningListener?: () => void
  // ): ServerType<T>;
  // listen(port?: number, listeningListener?: () => void): ServerType<T>;
  // listen(
  //   path: string,
  //   backlog?: number,
  //   listeningListener?: () => void
  // ): ServerType<T>;
  // listen(path: string, listeningListener?: () => void): ServerType<T>;
  // listen(
  //   options: net.ListenOptions,
  //   listeningListener?: () => void
  // ): ServerType<T>;
  // listen(
  //   handle: any,
  //   backlog?: number,
  //   listeningListener?: () => void
  // ): ServerType<T>;
  // listen(handle: any, listeningListener?: () => void): ServerType<T>;
  // listen(...args: any[]) {
  //   return args as any;
  // }

  // dynamicListen(
  //   port?: number,
  //   hostname?: string,
  //   backlog?: number,
  //   listeningListener?: () => void
  // ): Promise<{ port: number; server: ServerType<T> }>;
  // dynamicListen(
  //   port?: number,
  //   hostname?: string,
  //   listeningListener?: () => void
  // ): Promise<{ port: number; server: ServerType<T> }>;
  // dynamicListen(
  //   port?: number,
  //   backlog?: number,
  //   listeningListener?: () => void
  // ): Promise<{ port: number; server: ServerType<T> }>;
  // dynamicListen(...args: any[]) {
  //   return args as any;
  // }

  #requestListener = async (
    reqStream: http.IncomingMessage,
    resStream: http.ServerResponse
  ): Promise<void> => {
    const url = urlParse(reqStream.url as string, true);
    const ctx = new Context(
      new Request()
        .setPath(url.pathname)
        .setMethod(reqStream.method as string)
        .setQuery(url.query as Dict<string>)
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

  #writeHead(ipareRes: Response, resStream: http.ServerResponse) {
    if (resStream.headersSent) return;
    Object.keys(ipareRes.headers)
      .filter((key) => !!ipareRes.headers[key])
      .forEach((key) => {
        resStream.setHeader(key, ipareRes.headers[key] as string | string[]);
      });
  }

  #writeBody(ipareRes: Response, resStream: http.ServerResponse) {
    if (!ipareRes.body) {
      resStream.end();
      return;
    }

    if (ipareRes.body instanceof Stream) {
      ipareRes.body.pipe(resStream);
    } else if (Buffer.isBuffer(ipareRes.body)) {
      resStream.end(ipareRes.body);
    } else if (isString(ipareRes.body)) {
      resStream.end(ipareRes.body);
    } else {
      resStream.end(JSON.stringify(ipareRes.body));
    }
  }

  async close() {
    this.#server.removeAllListeners();
    await new Promise<void>((resolve) => {
      this.#server.close(() => {
        resolve();
      });
    });
    this.logger.info("Server shutdown success");
  }
}

function isHttpsOptions(
  options?: HttpNativeOptions | HttpsNativeOptions
): options is HttpsNativeOptions {
  return !!options && "https" in options && !!options.https;
}
