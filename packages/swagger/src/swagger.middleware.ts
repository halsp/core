import {
  HttpMethod,
  isString,
  isUndefined,
  Middleware,
  normalizePath,
} from "@ipare/core";
import { Parser } from "./parser";
import { SwaggerOptions } from "./swagger-options";
import { OpenApiBuilder } from "openapi3-ts";
import path from "path";
import * as fs from "fs";
import { getAbsoluteFSPath } from "swagger-ui-dist";
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

    const extendPath = normalizePath(
      reqPath.replace(optPath, "") || "index.html"
    );
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

    let openApiVersion = "3.0.0";
    const openApiPkgPath = path.join(getAbsoluteFSPath(), "package.json");
    if (fs.existsSync(openApiPkgPath)) {
      const openApiPkg = JSON.parse(fs.readFileSync(openApiPkgPath, "utf-8"));
      openApiVersion = openApiVersion ?? openApiPkg.version;
    }

    return new OpenApiBuilder()
      .addTitle("Swagger UI")
      .addVersion(version)
      .addOpenApiVersion(openApiVersion);
  }

  private async createBuilder() {
    let openApiBuilder = this.defaultBuilder;
    if (this.options.builder) {
      openApiBuilder = await this.options.builder(openApiBuilder, this.ctx);
    }
    return openApiBuilder;
  }

  private async createApiDoc() {
    if (!this.ctx.startup[DOC_RECORD]) {
      const openApiBuilder = await this.createBuilder();
      this.ctx.startup[DOC_RECORD] = new Parser(
        this.ctx.startup.routerMap,
        openApiBuilder,
        this.ctx.startup.routerOptions
      ).parse();

      return this.ctx.startup[DOC_RECORD];
    }
  }

  private async replaceBody(extendPath: string) {
    if (this.res.status != 200) return;
    if (isUndefined(this.res.body)) return;
    if (!isString(this.res.body)) return;

    const optPath = this.options.path as string;
    const builder = await this.createBuilder();
    const doc = builder.getSpec();

    let content = this.res.body;
    if (extendPath == "swagger-initializer.js") {
      content = content.replace(
        `https://petstore.swagger.io/v2/swagger.json`,
        `./${optPath}/index.json`
      );
    }

    if (extendPath == "index.html") {
      const prefixPath = optPath ? `./${optPath}/` : `./`;
      content = content.replace(/(href|src)="\.\//g, `$1="${prefixPath}`);
      content = content.replace(
        'href="index.css"',
        `href="${prefixPath}index.css"`
      );
      content = content.replace(
        `<title>Swagger UI</title>`,
        `<title>${doc.info.title}</title>`
      );
    }

    this.res.body = content;
  }
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
