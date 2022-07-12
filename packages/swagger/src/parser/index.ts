import { MapItem, RouterOptions } from "@ipare/router";
import { OpenApiBuilder, OpenAPIObject } from "openapi3-ts";
import "reflect-metadata";
import { TagsParser } from "./tags.parser";
import { MapParser } from "./map.parser";
import { SwaggerOptions } from "../swagger-options";
import { IgnoreParser } from "./ignore.parser";

export class Parser {
  constructor(
    private readonly routerMap: readonly MapItem[],
    private readonly builder: OpenApiBuilder,
    private readonly routerOptions: RouterOptions & { dir: string },
    private readonly options: SwaggerOptions
  ) {}

  public parse(): OpenAPIObject {
    new TagsParser(this.routerMap, this.builder).parse();
    new MapParser(this.routerMap, this.builder, this.routerOptions).parse();

    new IgnoreParser(this.builder).parse();
    return this.builder.getSpec();
  }
}
