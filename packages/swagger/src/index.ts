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
  PropertyDescription,
  PropertyAllowEmptyValue,
  PropertyDeprecated,
  PropertyIgnore,
  PropertyRequired,
  PropertyBodyArrayType,
  PropertyExample,
  PropertyParameterSchema,
  PropertyParameterStyle,
  PropertyDefault,
  PropertyNumRange,
  PropertyPattern,
  PropertyPropertiesRange,
  PropertyReadOnly,
  PropertyTitle,
  PropertyWriteOnly,
  PropertyEnum,
  PropertyFormat,
  PropertyXml,
} from "./decorators";
export { beforeCompile } from "./before-compile";
