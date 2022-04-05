import "@sfajs/core";
import { Startup, ObjectConstructor } from "@sfajs/core";
import { DECORATOR_SCOPED_BAG, MAP_BAG } from "./constant";
import { Inject } from "./decorators";
import { InjectMap } from "./inject-map";
import { parseInject } from "./inject-parser";
import { InjectTypes } from "./inject-types";

declare module "@sfajs/core" {
  interface Startup {
    useInject(): this;
    inject<TAnestor extends object, TTarget extends TAnestor>(
      anestor: ObjectConstructor<TAnestor>,
      target: ObjectConstructor<TTarget>,
      type?: InjectTypes
    ): this;
    inject<TAnestor extends object, TTarget extends TAnestor>(
      anestor: ObjectConstructor<TAnestor>,
      target: TTarget,
      type?: InjectTypes
    ): this;
  }
}

Startup.prototype.useInject = function (): Startup {
  if ((this as any).useInjected) {
    return this;
  }
  (this as any).useInjected = true;
  this.use(async (ctx, next) => {
    ctx.bag(DECORATOR_SCOPED_BAG, []);
    await next();
  }).hook((ctx, mh) => {
    parseInject(ctx, mh);
  });
  return this;
};

Startup.prototype.inject = function <
  TAnestor extends object,
  TTarget extends TAnestor
>(
  anestor: ObjectConstructor<TAnestor>,
  target: ObjectConstructor<TTarget> | TTarget,
  type: InjectTypes = InjectTypes.Transient
): Startup {
  this.use(async (ctx, next) => {
    const injectMaps = ctx.bag<InjectMap[]>(MAP_BAG) ?? [];
    injectMaps.push({ anestor, target, type });
    ctx.bag(MAP_BAG, injectMaps);
    await next();
  });
  return this;
};

export { Inject, parseInject, InjectTypes };
