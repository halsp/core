import { isUndefined, Middleware, normalizePath } from "@halsp/core";
import { Parser } from "./parser";
import { SwaggerOptions } from "./options";
import { OpenApiBuilder } from "openapi3-ts-remove-yaml";
import path from "path";
import * as fs from "fs";
import { StatusCodes, HttpMethods } from "@halsp/http";
import { Readable } from "stream";

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
    if (this.ctx.req.method != HttpMethods.get) {
      return await this.next();
    }

    if (reqPath == optPath) {
      let location: string;
      if (
        !this.ctx.req.originalPath ||
        this.ctx.req.originalPath.endsWith("/")
      ) {
        if (this.options.basePath) {
          location = `./${this.options.basePath}/index.html`;
        } else {
          location = "./index.html";
        }
      } else {
        const lastPart = this.ctx.req.path.replace(/^.+\/([^\/]+)$/, "$1");
        location = `${lastPart}/index.html`;
        location = "./" + normalizePath(location);
      }
      this.redirect(location, StatusCodes.TEMPORARY_REDIRECT);
      return;
    }

    const extendPath = normalizePath(reqPath.replace(optPath, ""));
    if (extendPath == "index.json") {
      const openApiBuilder = await this.createBuilder();
      const startup = this.ctx.startup;
      const apiDoc = await new Parser(
        startup.routerMap,
        openApiBuilder,
      ).parse();
      this.ctx.res.set("content-type", "text/json").ok(apiDoc);
      return;
    } else if (extendPath == "swagger-initializer.js") {
      const js = await this.createInitializer();
      this.ctx.res.set("content-type", "application/javascript").ok(js);
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

  private async createInitializer() {
    const uiBundleOptions = {
      url: `./index.json`,
      dom_id: "#swagger-ui",
      presets: [
        "%SwaggerUIBundle.presets.apis%",
        "%SwaggerUIStandalonePreset%",
      ],
      plugins: ["%SwaggerUIBundle.plugins.DownloadUrl%"],
      ...this.options.uiBundleOptions,
    };

    const initOAuthJson = JSON.stringify(this.options.initOAuth ?? {});

    const optionsJson = JSON.stringify(uiBundleOptions)
      .replace(/"%/g, "")
      .replace(/%"/g, "");

    return `window.onload = function() {
  const ui = SwaggerUIBundle(${optionsJson});
  ${this.options.initOAuth ? `ui.initOAuth(${initOAuthJson});\n` : ``}
  window.ui = ui;
  };`;
  }

  private async replaceBody(extendPath: string) {
    if (this.res.status != 200) return;
    if (!(this.res.body instanceof Readable)) return;

    this.res.body = await readStream(this.res.body);
    if (extendPath == "index.html") {
      await this.replaceIndexContent();
    }
  }

  private async replaceIndexContent() {
    const builder = await this.createBuilder();
    const doc = builder.getSpec();

    let content = this.res.body;
    content = content.replace(
      `<title>Swagger UI</title>`,
      `<title>${this.options.html?.title ?? doc.info.title}</title>`,
    );
    content = content.replace(/<link\srel="icon"[\s\S]+\/>/g, "");

    if (this.options.html?.removeDefaultStyle) {
      content = content.replace(
        /<link\srel="stylesheet" type="text\/css"[\s\S]+\/>/g,
        "",
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
      this.options.html?.favicon,
    );
    content = addDocumentItems(
      "head",
      content,
      (val) => `<link rel="stylesheet" type="text/css" href="${val}" />`,
      this.options.html?.css,
    );
    content = addDocumentItems(
      "head",
      content,
      (val) => `<style>
    ${val}
    </style>`,
      this.options.html?.style,
    );

    content = addDocumentItems(
      "body",
      content,
      (val) => `<script src="${val}" charset="UTF-8"> </script>`,
      this.options.html?.js,
    );

    content = addDocumentItems(
      "body",
      content,
      (val) => `<script>
    ${val}
    </script>`,
      this.options.html?.script,
    );

    this.res.body = content;
  }
}

async function readStream(stream: Readable) {
  const chunks: Buffer[] = [];
  return new Promise<string>((resolve, reject) => {
    stream.on("data", (data) => chunks.push(data as Buffer));
    stream.on("end", () => resolve(Buffer.concat(chunks).toString()));
    stream.on("error", (err) => reject(err));
  });
}

function addDocumentItems(
  tag: string,
  html: string,
  builder: (val: any) => string,
  options?: string | string[],
) {
  if (!options) return html;
  if (!Array.isArray(options)) {
    options = [options];
  }

  options.forEach((v) => {
    html = html.replace(
      new RegExp(`\\s*<\\/${tag}>`),
      `\n    ${builder(v)}
  <\/${tag}>`,
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
