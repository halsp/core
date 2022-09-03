import { HttpContext } from "@ipare/core";
import { OpenApiBuilder } from "openapi3-ts";

type SwaggerBuilder = (
  builder: OpenApiBuilder,
  ctx: HttpContext
) => OpenApiBuilder | Promise<OpenApiBuilder>;

export interface SwaggerOptions {
  path?: string;
  builder?: SwaggerBuilder;
}
