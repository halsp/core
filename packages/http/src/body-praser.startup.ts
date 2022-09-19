import { HttpContext, Startup, StatusCodes } from "@ipare/core";
import typeis from "type-is";
import cobody from "co-body";
import formidable from "formidable";
import http from "http";

export type MultipartBody =
  | { fields: formidable.Fields; files: formidable.Files }
  | undefined;

export abstract class BodyPraserStartup extends Startup {
  constructor(
    private readonly sourceReqBuilder: (
      ctx: HttpContext
    ) => http.IncomingMessage
  ) {
    super();
  }

  public useHttpJsonBody(
    options?: cobody.Options,
    onError?: (ctx: HttpContext, err: unknown) => Promise<void>
  ): this {
    this.#useBodyPraser(
      async (ctx) => await cobody.json(this.sourceReqBuilder(ctx), options),
      [
        "application/json",
        "application/json-patch+json",
        "application/vnd.api+json",
        "application/csp-report",
        "text/json",
        "application/*+json",
      ],
      onError
    );
    return this;
  }

  public useHttpTextBody(
    options?: cobody.Options,
    onError?: (ctx: HttpContext, err: unknown) => Promise<void>
  ): this {
    this.#useBodyPraser(
      async (ctx) => await cobody.text(this.sourceReqBuilder(ctx), options),
      ["text/*"],
      onError
    );
    return this;
  }

  public useHttpUrlencodedBody(
    options?: cobody.Options,
    onError?: (ctx: HttpContext, err: Error) => Promise<void>
  ): this {
    this.#useBodyPraser(
      async (ctx) => await cobody.form(this.sourceReqBuilder(ctx), options),
      ["urlencoded"],
      onError
    );
    return this;
  }

  public useHttpMultipartBody(
    options?: formidable.Options,
    onFileBegin?: (
      ctx: HttpContext,
      formName: string,
      file: formidable.File
    ) => void,
    onError?: (ctx: HttpContext, err: Error) => Promise<void>
  ): this {
    this.#useBodyPraser(
      async (ctx) =>
        await this.#parseMultipart(ctx, options, onFileBegin, onError),
      ["multipart"],
      onError
    );
    return this;
  }

  #parseMultipart(
    ctx: HttpContext,
    options?: formidable.Options,
    onFileBegin?: (
      ctx: HttpContext,
      formName: string,
      file: formidable.File
    ) => void,
    onError?: (ctx: HttpContext, err: Error) => Promise<void>
  ): Promise<MultipartBody> {
    return new Promise<MultipartBody>((resolve) => {
      const form = new formidable.IncomingForm(options);
      if (onFileBegin) {
        form.on("fileBegin", (formName, file) => {
          onFileBegin(ctx, formName, file);
        });
      }
      form.parse(
        this.sourceReqBuilder(ctx),
        async (err, fields: formidable.Fields, files: formidable.Files) => {
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

  #useBodyPraser(
    bodyBuilder: (ctx: HttpContext) => Promise<unknown>,
    types: string[],
    onError?: (ctx: HttpContext, err: Error) => Promise<void>
  ): void {
    this.use(async (ctx, next) => {
      if (!typeis(this.sourceReqBuilder(ctx), types)) {
        return await next();
      }

      let body: any;
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
