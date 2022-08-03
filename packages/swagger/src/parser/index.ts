import { MapItem, RouterOptions } from "@ipare/router";
import { OpenApiBuilder, OpenAPIObject } from "openapi3-ts";
import "reflect-metadata";
import { TagsParser } from "./tags.parser";
import { MapParser } from "./map.parser";
import { IgnoreParser } from "./ignore.parser";

export class Parser {
  constructor(
    private readonly routerMap: readonly MapItem[],
    private readonly builder: OpenApiBuilder,
    private readonly routerOptions: RouterOptions & { dir: string }
  ) {}

  public parse(): OpenAPIObject {
    new TagsParser(this.routerMap, this.builder, this.routerOptions).parse();
    new MapParser(this.routerMap, this.builder, this.routerOptions).parse();

    new IgnoreParser(this.builder).parse();
    return this.builder.getSpec();
  }
}
