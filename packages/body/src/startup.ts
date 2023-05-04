import { Context, Startup } from "@halsp/core";
import typeis from "type-is";
import cobody from "co-body";
import formidable from "formidable";
import { BadRequestException, StatusCodes } from "@halsp/http";
import { MultipartBody } from "./multipart";

declare module "@halsp/core" {
  interface Startup {
    useHttpJsonBody(
      options?: cobody.Options,
      onError?: (ctx: Context, err: unknown) => Promise<void>
    ): this;
    useHttpTextBody(
      options?: cobody.Options,
      onError?: (ctx: Context, err: unknown) => Promise<void>
    ): this;
    useHttpUrlencodedBody(
      options?: cobody.Options,
      onError?: (ctx: Context, err: Error) => Promise<void>
    ): this;
    useHttpMultipartBody(
      options?: formidable.Options,
      onFileBegin?: (
        ctx: Context,
        formName: string,
        file: formidable.File
      ) => void,
      onError?: (ctx: Context, err: Error) => Promise<void>
    ): this;
  }
}

Startup.prototype.useHttpJsonBody = function (
  options?: cobody.Options,
  onError?: (ctx: Context, err: unknown) => Promise<void>
) {
  useBodyPraser.bind(this)(
    async (ctx) => await cobody.json(getReqStream(ctx), options),
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
};

Startup.prototype.useHttpTextBody = function (
  options?: cobody.Options,
  onError?: (ctx: Context, err: unknown) => Promise<void>
) {
  useBodyPraser.bind(this)(
    async (ctx) => await cobody.text(getReqStream(ctx), options),
    ["text/*"],
    onError
  );
  return this;
};

Startup.prototype.useHttpUrlencodedBody = function (
  options?: cobody.Options,
  onError?: (ctx: Context, err: Error) => Promise<void>
) {
  useBodyPraser.bind(this)(
    async (ctx) => await cobody.form(getReqStream(ctx), options),
    ["urlencoded"],
    onError
  );
  return this;
};

Startup.prototype.useHttpMultipartBody = function (
  options?: formidable.Options,
  onFileBegin?: (ctx: Context, formName: string, file: formidable.File) => void,
  onError?: (ctx: Context, err: Error) => Promise<void>
) {
  useBodyPraser.bind(this)(
    async (ctx) =>
      await parseMultipart.bind(this)(ctx, options, onFileBegin, onError),
    ["multipart"],
    onError
  );
  return this;
};

function getReqStream(ctx: Context) {
  return ctx["reqStream"];
}

function parseMultipart(
  this: Startup,
  ctx: Context,
  options?: formidable.Options,
  onFileBegin?: (ctx: Context, formName: string, file: formidable.File) => void,
  onError?: (ctx: Context, err: Error) => Promise<void>
): Promise<MultipartBody> {
  return new Promise<MultipartBody>((resolve) => {
    const form = new formidable.IncomingForm(options);
    if (onFileBegin) {
      form.on("fileBegin", (formName, file) => {
        onFileBegin(ctx, formName, file);
      });
    }
    form.parse(
      getReqStream(ctx),
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

function useBodyPraser(
  this: Startup,
  bodyBuilder: (ctx: Context) => Promise<unknown>,
  types: string[],
  onError?: (ctx: Context, err: Error) => Promise<void>
) {
  this.use(async (ctx, next) => {
    if (!typeis(getReqStream(ctx), types)) {
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
        const ex = new BadRequestException((err as Error).message);
        ex.inner = err;
        throw ex;
      }
      return;
    }
    if (body == undefined) return;

    ctx.req.setBody(body);
    await next();
  });
}
