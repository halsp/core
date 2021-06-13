import "sfa";
import { Startup } from "sfa";
import Router from "./Router";
import Config, {
  TsConfig,
  AppConfig,
  RouterConfig,
  TsStaticItemConfig,
} from "./Config";
import Action from "./Action";
import Authority from "./Authority";
import ApiDocs from "./ApiDocs";
import ApiDocsParam from "./ApiDocs/ApiDocsParam";
import ApiDocsIOParams from "./ApiDocs/ApiDocsParam/ApiDocsIOParams";
import ApiDocsInputParams from "./ApiDocs/ApiDocsParam/ApiDocsInputParams";
import ApiDocsOutputParams from "./ApiDocs/ApiDocsParam/ApiDocsOutputParams";
import ApiDocsStateCode from "./ApiDocs/ApiDocsParam/ApiDocsStateCode";
import ApiDocsConfig from "./ApiDocs/ApiDocsConfig";
import ApiDocsConfigPart from "./ApiDocs/ApiDocsConfig/ApiDocsConfigPart";

export {
  Action,
  Authority,
  ApiDocs,
  ApiDocsParam,
  ApiDocsIOParams,
  ApiDocsInputParams,
  ApiDocsOutputParams,
  ApiDocsStateCode,
  ApiDocsConfigPart,
  ApiDocsConfig,
  Config,
  TsConfig,
  AppConfig,
  RouterConfig,
  TsStaticItemConfig,
};

declare module "sfa" {
  interface Startup {
    useRouter<T extends this>(config?: { authBuilder?: () => Authority }): T;
  }

  interface Request {
    readonly query: Record<string, string>;
  }
}

Startup.prototype.useRouter = function <T extends Startup>(config?: {
  authBuilder?: () => Authority;
}): T {
  new Router(this, config?.authBuilder).use();
  return this as T;
};
