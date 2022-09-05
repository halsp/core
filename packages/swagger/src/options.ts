import { HttpContext } from "@ipare/core";
import { OpenApiBuilder } from "openapi3-ts-remove-yaml";
import type swaggerUi from "swagger-ui-dist";

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

export type SwaggerUIBundleConfig = Omit<
  Omit<swaggerUi.SwaggerConfigs, "url">,
  "dom_id"
>;

export interface SwaggerOptions {
  path?: string;
  builder?: SwaggerBuilder;
  html?: SwaggerHtmlOptions;
  initOAuth?: any;
  uiBundleOptions?: SwaggerUIBundleConfig;
}
