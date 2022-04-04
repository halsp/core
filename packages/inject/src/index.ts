import "@sfajs/core";
import { Startup, ObjectConstructor } from "@sfajs/core";
import { INJECT_MAP_BAG } from "./constant";

import {
  Inject,
  parseInject,
  InjectTypes,
  InjectDecoratorMiddleware,
} from "./decorators";
import { InjectMap } from "./inject-map";

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
  this.add(InjectDecoratorMiddleware).hook((ctx, mh) => {
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
    const injectMaps = ctx.bag<InjectMap[]>(INJECT_MAP_BAG) ?? [];
    injectMaps.push({ anestor, target, type });
    ctx.bag(INJECT_MAP_BAG, injectMaps);
    await next();
  });
  return this;
};

export { Inject, parseInject, InjectTypes };
