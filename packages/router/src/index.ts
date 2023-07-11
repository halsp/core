import { Startup } from "@halsp/core";
import { Action } from "./action";
import MapItem from "./map/map-item";
import { RouterInitedOptions, RouterOptions } from "./router-options";
import { BlankMiddleware } from "./blank.middleware";
import { initRouterMap } from "./startup";

declare module "@halsp/core" {
  interface Startup {
    useRouter(options?: RouterOptions): this;
    get routerMap(): MapItem[];
    get routerOptions(): RouterInitedOptions;
  }

  interface Context {
    get actionMetadata(): MapItem;
    get routerMap(): MapItem[];
    get routerOptions(): RouterInitedOptions;
  }
}

const usedMap = new WeakMap<Startup, boolean>();
Startup.prototype.useRouter = function (options?: RouterOptions) {
  if (usedMap.get(this)) return this;
  usedMap.set(this, true);

  return initRouterMap.call(this, options).add((ctx) => {
    if (!ctx.actionMetadata) {
      return BlankMiddleware;
    } else {
      return ctx.actionMetadata.getAction(ctx.routerOptions.dir);
    }
  });
};

export { Action, MapItem, RouterOptions, RouterInitedOptions };
export { RouterModule, defineModule } from "./map/module";
export {
  ActionMetadata,
  SetActionMetadata,
  HttpCustom,
  HttpConnect,
  HttpDelete,
  HttpGet,
  HttpHead,
  HttpOptions,
  HttpPatch,
  HttpPost,
  HttpPut,
  HttpTrace,
  HttpCopy,
  HttpLink,
  HttpMove,
  HttpUnlink,
  HttpWrapped,
  setActionMetadata,
  getActionMetadata,
  MicroPattern,
} from "./action";
export { postbuild } from "./postbuild";
