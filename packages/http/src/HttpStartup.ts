import * as http from "http";
import * as net from "net";
import * as tls from "tls";
import {
  HttpContext,
  Request,
  Response,
  ResponseError,
  Startup,
  status,
} from "sfa";
import * as urlParse from "url-parse";
import * as typeis from "type-is";
import * as cobody from "co-body";
import * as qs from "qs";
import * as forms from "formidable";
import { Stream } from "stream";
import * as mime from "mime-types";

export type MultipartBody =
  | { fields: forms.Fields; files: forms.Files }
  | undefined;

export default abstract class HttpStartup extends Startup {
  abstract readonly server: net.Server | tls.Server;

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public get listen() {
    return this.server.listen.bind(this.server);
  }

  protected requestListener = async (
    httpReq: http.IncomingMessage,
    httpRes: http.ServerResponse
  ): Promise<void> => {
    const url = urlParse(httpReq.url as string, true);
    const ctx = new HttpContext(
      new Request()
        .setPath(url.pathname)
        .setMethod(httpReq.method as string)
        .setParams(url.query)
        .setHeaders(httpReq.headers)
    );
    ctx.res.setHeader("sfa-http", "https://github.com/sfajs/http");

    httpRes.statusCode = 404;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ctx as any).httpRes = httpRes;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ctx as any).httpReq = httpReq;

    const sfaRes = await this.invoke(ctx);

    if (!httpRes.writableEnded) {
      httpRes.statusCode = sfaRes.status;
      this.writeHead(sfaRes, httpRes);
      this.writeBody(sfaRes, httpRes);
    }
  };

  private writeHead(sfaRes: Response, httpRes: http.ServerResponse) {
    if (httpRes.headersSent) return;
    Object.keys(sfaRes.headers)
      .filter((key) => !!sfaRes.headers[key])
      .forEach((key) => {
        httpRes.setHeader(key, sfaRes.headers[key] as string | string[]);
      });
  }

  private writeBody(sfaRes: Response, httpRes: http.ServerResponse) {
    if (!sfaRes.body) {
      if (!httpRes.headersSent) {
        httpRes.removeHeader("Content-Type");
        httpRes.removeHeader("Content-Length");
      }
      httpRes.end();
      return;
    }

    const writeType =
      !sfaRes.hasHeader("content-type") && !httpRes.hasHeader("Content-Type");
    const writeLength =
      !sfaRes.hasHeader("content-length") &&
      !httpRes.hasHeader("Content-Length");

    if (typeof sfaRes.body == "string") {
      if (writeLength) {
        httpRes.setHeader("Content-Length", Buffer.byteLength(sfaRes.body));
      }
      if (writeType) {
        const type = /^\s*</.test(sfaRes.body) ? "html" : "text";
        httpRes.setHeader("Content-Type", mime.contentType(type) as string);
      }
      httpRes.end(sfaRes.body);
    } else if (Buffer.isBuffer(sfaRes.body)) {
      if (writeLength) {
        httpRes.setHeader("Content-Length", sfaRes.body.byteLength);
      }
      if (writeType) {
        httpRes.setHeader("Content-Type", mime.contentType("bin") as string);
      }
      httpRes.end(sfaRes.body);
    } else if (sfaRes.body instanceof Stream) {
      if (writeType) {
        httpRes.setHeader("Content-Type", mime.contentType("bin") as string);
      }
      sfaRes.body.pipe(httpRes);
    } else {
      const str = JSON.stringify(sfaRes.body);
      if (writeLength) {
        httpRes.setHeader("Content-Length", Buffer.byteLength(str));
      }
      if (writeType) {
        httpRes.setHeader("Content-Type", mime.contentType("json") as string);
      }
      httpRes.end(str);
    }
  }

  public useHttpJsonBody<T extends this>(
    strict = true,
    limit = "1mb",
    encoding: BufferEncoding = "utf-8",
    returnRawBody = false,
    onError?: (ctx: HttpContext, err: unknown) => Promise<void>
  ): T {
    this.useBodyPraser(
      async (ctx) =>
        await cobody.json(ctx.httpReq, {
          encoding: encoding,
          limit: limit,
          strict: strict,
          returnRawBody: returnRawBody,
        }),
      [
        "application/json",
        "application/json-patch+json",
        "application/vnd.api+json",
        "application/csp-report",
      ],
      onError
    );
    return this as T;
  }

  public useHttpTextBody<T extends this>(
    limit = "56kb",
    encoding: BufferEncoding = "utf-8",
    returnRawBody = false,
    onError?: (ctx: HttpContext, err: unknown) => Promise<void>
  ): T {
    this.useBodyPraser(
      async (ctx) =>
        await cobody.text(ctx.httpReq, {
          encoding: encoding,
          limit: limit,
          returnRawBody: returnRawBody,
        }),
      ["text/*"],
      onError
    );
    return this as T;
  }

  public useHttpUrlencodedBody<T extends this>(
    queryString?: qs.IParseOptions,
    limit = "56kb",
    encoding: BufferEncoding = "utf-8",
    returnRawBody = false,
    onError?: (ctx: HttpContext, err: Error) => Promise<void>
  ): T {
    this.useBodyPraser(
      async (ctx) =>
        await cobody.form(ctx.httpReq, {
          encoding: encoding,
          limit: limit,
          returnRawBody: returnRawBody,
          queryString: queryString,
        }),
      ["urlencoded"],
      onError
    );
    return this as T;
  }

  public useHttpMultipartBody<T extends this>(
    opts?: Partial<forms.Options | undefined>,
    onFileBegin?: (
      ctx: HttpContext,
      formName: string,
      file: forms.File
    ) => void,
    onError?: (ctx: HttpContext, err: Error) => Promise<void>
  ): T {
    this.useBodyPraser(
      async (ctx) => await this.parseMultipart(ctx, opts, onFileBegin, onError),
      ["multipart"],
      onError
    );
    return this as T;
  }

  private parseMultipart(
    ctx: HttpContext,
    opts?: Partial<forms.Options | undefined>,
    onFileBegin?: (
      ctx: HttpContext,
      formName: string,
      file: forms.File
    ) => void,
    onError?: (ctx: HttpContext, err: Error) => Promise<void>
  ): Promise<MultipartBody> {
    return new Promise<MultipartBody>((resolve) => {
      const form = new forms.IncomingForm(opts);
      if (onFileBegin) {
        form.on("fileBegin", (formName, file) => {
          onFileBegin(ctx, formName, file);
        });
      }
      form.parse(
        ctx.httpReq,
        async (err, fields: forms.Fields, files: forms.Files) => {
          if (err) {
            ctx.res.status = status.StatusCodes.BAD_REQUEST;
            if (onError) await onError(ctx, err);
            resolve(undefined);
          } else {
            resolve({
              fields: fields,
              files: files,
            });
          }
        }
      );
    });
  }

  private useBodyPraser(
    bodyBuilder: (ctx: HttpContext) => Promise<unknown>,
    types: string[],
    onError?: (ctx: HttpContext, err: Error) => Promise<void>
  ): void {
    this.use(async (ctx, next) => {
      if (!typeis(ctx.httpReq, types)) {
        return await next();
      }

      let body;
      try {
        body = await bodyBuilder(ctx);
      } catch (err) {
        ctx.res.status = status.StatusCodes.BAD_REQUEST;
        if (onError) {
          await onError(ctx, err);
        } else {
          throw new ResponseError(err.message)
            .setBody({
              message: err.message,
            })
            .setStatus(status.StatusCodes.BAD_REQUEST);
        }
        return;
      }
      if (body == undefined) return;

      ctx.req.setBody(body);
      await next();
    });
  }
}
