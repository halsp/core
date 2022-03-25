import { HttpContext, Startup } from "@sfajs/core";
import * as typeis from "type-is";
import * as cobody from "co-body";
import * as qs from "qs";
import * as forms from "formidable";
import * as http from "http";
import { StatusCodes } from "@sfajs/header";

export type MultipartBody =
  | { fields: forms.Fields; files: forms.Files }
  | undefined;

export default abstract class HttpBodyPraserStartup extends Startup {
  constructor(
    private readonly sourceReqBuilder: (
      ctx: HttpContext
    ) => http.IncomingMessage
  ) {
    super();
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
        await cobody.json(this.sourceReqBuilder(ctx), {
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
        await cobody.text(this.sourceReqBuilder(ctx), {
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
        await cobody.form(this.sourceReqBuilder(ctx), {
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
        this.sourceReqBuilder(ctx),
        async (err, fields: forms.Fields, files: forms.Files) => {
          if (err) {
            ctx.res.status = StatusCodes.BAD_REQUEST;
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
      if (!typeis(this.sourceReqBuilder(ctx), types)) {
        return await next();
      }

      let body;
      try {
        body = await bodyBuilder(ctx);
      } catch (err) {
        ctx.res.status = StatusCodes.BAD_REQUEST;
        if (onError) {
          await onError(ctx, err as Error);
        } else {
          throw err;
        }
        return;
      }
      if (body == undefined) return;

      ctx.req.setBody(body);
      await next();
    });
  }
}
