import { MapItem, RouterOptions } from "@sfajs/router";
import { OpenApiBuilder, OpenAPIObject } from "openapi3-ts";
import "reflect-metadata";
import { TagsParser } from "./tags.parser";
import { MapParser } from "./map.parser";

export class Parser {
  constructor(
    private readonly routerMap: readonly MapItem[],
    private readonly builder: OpenApiBuilder,
    private readonly routerOptions: RouterOptions & { dir: string }
  ) {
    builder.addInfo({
      title: "@sfajs/swagger",
      version: "1.0.0",
    });
  }

  public parse(): OpenAPIObject {
    new TagsParser(this.routerMap, this.builder).parse();
    new MapParser(this.routerMap, this.builder, this.routerOptions).parse();

    return this.builder.getSpec();
  }
}
