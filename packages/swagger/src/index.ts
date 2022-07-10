import "@sfajs/core";
import "@sfajs/router";
import { Startup } from "@sfajs/core";
import { USED } from "./constant";
import { SwaggerOptions } from "./swagger-options";
import { useSetup } from "./use-setup";

declare module "@sfajs/core" {
  interface Startup {
    useSwagger(options?: SwaggerOptions): this;
  }
  interface HttpContext {
    get swaggerOptions(): SwaggerOptions;
  }
}

Startup.prototype.useSwagger = function (
  options: SwaggerOptions = {}
): Startup {
  if (!!this[USED]) {
    return this;
  }
  this[USED] = true;

  return useSetup(this, options);
};

export {
  ApiTags,
  ApiSummary,
  ApiCallback,
  ApiDeprecated,
  ApiDescription,
  ApiExternalDocs,
  ApiOperationId,
  ApiResponses,
  ApiSecurity,
  ApiServers,
  setPropertyValue,
  SetPropertyValueCallback,
  createCallbackDecorator,
  CreateCallback,
  createCommonDecorator,
  SetCommonValueCallback,
  Description,
  AllowEmptyValue,
  Deprecated,
  Ignore,
  Required,
  ArrayType,
  Example,
  Schema,
  ParameterStyle,
  Default,
  NumRange,
  Pattern,
  PropertiesRange,
  ReadOnly,
  Title,
  WriteOnly,
  Enum,
  Format,
  Xml,
  Examples,
} from "./decorators";
export { beforeCompile } from "./before-compile";
