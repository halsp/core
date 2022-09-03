import {
  HttpMethod,
  isString,
  isUndefined,
  Middleware,
  normalizePath,
  StatusCodes,
} from "@ipare/core";
import { Parser } from "./parser";
import { SwaggerOptions } from "./options";
import { OpenApiBuilder, OpenAPIObject } from "openapi3-ts";
import path from "path";
import * as fs from "fs";
import { DOC_RECORD } from "./constant";

export class SwaggerMiddlware extends Middleware {
  constructor(private readonly options: SwaggerOptions) {
    super();
  }

  async invoke() {
    const reqPath = this.ctx.req.path;
    const optPath = this.options.path as string;
    if (!reqPath.startsWith(optPath)) {
      return await this.next();
    }
    if (this.ctx.req.method != HttpMethod.get) {
      return await this.next();
    }

    if (reqPath == optPath) {
      let location: string;
      if (this.ctx.req.originalPath.endsWith("/")) {
        location = "./index.html";
      } else {
        if (!/[^\/]\/{1}[^\/]/.test(this.ctx.req.path)) {
          location = "./index.html";
        } else {
          const lastPart = this.ctx.req.path.replace(/^.+\/([^\/]+)$/, "$1");
          location = `./${lastPart}/index.html`;
        }
      }
      this.redirect(location, StatusCodes.PERMANENT_REDIRECT);
      return;
    }

    const extendPath = normalizePath(reqPath.replace(optPath, ""));
    if (extendPath == "index.json") {
      const apiDoc = await this.createApiDoc();
      this.ctx.set("content-type", "text/json").ok(apiDoc);
      return;
    }

    await this.next();

    await this.replaceBody(extendPath);
  }

  private get defaultBuilder() {
    let version = "0.0.1";
    const pkgPath = getPackage();
    if (pkgPath) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
      version = pkg.version ?? version;
    }

    return new OpenApiBuilder()
      .addTitle("Swagger UI")
      .addVersion(version)
      .addOpenApiVersion("3.0.0");
  }

  private async createBuilder() {
    let openApiBuilder = this.defaultBuilder;
    if (this.options.builder) {
      const builder = await this.options.builder(openApiBuilder, this.ctx);
      openApiBuilder = builder ?? openApiBuilder;
    }
    return openApiBuilder;
  }

  private async createApiDoc(): Promise<OpenAPIObject> {
    if (!this.ctx.startup[DOC_RECORD]) {
      const openApiBuilder = await this.createBuilder();
      this.ctx.startup[DOC_RECORD] = new Parser(
        this.ctx.startup.routerMap,
        openApiBuilder,
        this.ctx.startup.routerOptions
      ).parse();
    }

    return this.ctx.startup[DOC_RECORD];
  }

  private async replaceBody(extendPath: string) {
    if (this.res.status != 200) return;
    if (isUndefined(this.res.body)) return;
    if (!isString(this.res.body)) return;

    if (extendPath == "swagger-initializer.js") {
      await this.replaceInitializer();
    }

    if (extendPath == "index.html") {
      await this.replaceIndexContent();
    }
  }

  private async replaceInitializer() {
    let content = this.res.body;
    content = content.replace(
      `https://petstore.swagger.io/v2/swagger.json`,
      `./index.json`
    );
    this.res.body = content;
  }

  private async replaceIndexContent() {
    const builder = await this.createBuilder();
    const doc = builder.getSpec();

    let content = this.res.body;
    content = content.replace(
      `<title>Swagger UI</title>`,
      `<title>${this.options.html?.title ?? doc.info.title}</title>`
    );
    content = content.replace(/<link\srel="icon"[\s\S]+\/>/g, "");

    if (this.options.html?.removeDefaultStyle) {
      content = content.replace(
        /<link\srel="stylesheet" type="text\/css"[\s\S]+\/>/g,
        ""
      );
    }

    const lang = this.options.html?.lang;
    if (!isUndefined(lang)) {
      content = content.replace(/<html lang="(.+?)">/, `<html lang="${lang}">`);
    }

    content = addDocumentItems(
      "head",
      content,
      (val) => `<link rel="icon" type="image/png" href="${val}" />`,
      this.options.html?.favicon
    );
    content = addDocumentItems(
      "head",
      content,
      (val) => `<link rel="stylesheet" type="text/css" href="${val}" />`,
      this.options.html?.css
    );
    content = addDocumentItems(
      "head",
      content,
      (val) => `<style>
    ${val}
    </style>`,
      this.options.html?.style
    );

    content = addDocumentItems(
      "body",
      content,
      (val) => `<script src="${val}" charset="UTF-8"> </script>`,
      this.options.html?.js
    );

    content = addDocumentItems(
      "body",
      content,
      (val) => `<script>
    ${val}
    </script>`,
      this.options.html?.script
    );

    this.res.body = content;
  }
}

function addDocumentItems(
  tag: string,
  html: string,
  builder: (val: any) => string,
  options?: string | string[]
) {
  if (!options) return html;
  if (!Array.isArray(options)) {
    options = [options];
  }

  options.forEach((v) => {
    html = html.replace(
      new RegExp(`\\s*<\\/${tag}>`),
      `\n    ${builder(v)}
  <\/${tag}>`
    );
  });
  return html;
}

function getPackage(): string | undefined {
  let pkgPath = "package.json";
  while (true) {
    const absolutePath = path.join(process.cwd(), pkgPath);
    if (fs.existsSync(absolutePath)) {
      return absolutePath;
    } else {
      pkgPath = path.join("..", pkgPath);
      if (path.resolve(absolutePath) == path.resolve(process.cwd(), pkgPath)) {
        break;
      }
    }
  }
}
