import { OpenApiBuilder, OpenAPIObject } from "openapi3-ts";

export class Parser {
  constructor(private readonly builder: OpenApiBuilder) {
    builder.addInfo({
      title: "@sfajs/swagger",
      version: "1.0.0",
    });
  }

  public parse(): OpenAPIObject {
    return this.builder.getSpec();
  }
}
