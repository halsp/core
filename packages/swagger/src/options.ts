import { HttpContext } from "@ipare/core";
import { OpenApiBuilder } from "openapi3-ts";

type SwaggerBuilder = (
  builder: OpenApiBuilder,
  ctx: HttpContext
) => void | Promise<void> | OpenApiBuilder | Promise<OpenApiBuilder>;

export interface SwaggerHtmlOptions {
  lang?: string;
  title?: string;
  removeDefaultStyle?: boolean;
  favicon?: string | string[];
  css?: string | string[];
  style?: string | string[];
  js?: string | string[];
  script?: string | string[];
}

export interface SwaggerOptions {
  path?: string;
  builder?: SwaggerBuilder;
  html?: SwaggerHtmlOptions;
}
