import "@sfajs/core";
import { Startup, ObjectConstructor } from "@sfajs/core";
import { HookType } from "@sfajs/core/dist/middlewares";
import { DECORATOR_SCOPED_BAG, IS_INJECT_USED, MAP_BAG } from "./constant";
import { Inject } from "./decorators";
import { InjectMap } from "./inject-map";
import { isInjectClass, parseInject } from "./inject-parser";
import { InjectType } from "./inject-type";

declare module "@sfajs/core" {
  interface Startup {
    useInject(): this;
    inject<TAnestor extends object, TTarget extends TAnestor>(
      anestor: ObjectConstructor<TAnestor>,
      target: ObjectConstructor<TTarget>,
      type?: InjectType
    ): this;
    inject<TAnestor extends object, TTarget extends TAnestor>(
      anestor: ObjectConstructor<TAnestor>,
      target: TTarget,
      type?: InjectType
    ): this;
  }
}

Startup.prototype.useInject = function (): Startup {
  if (this[IS_INJECT_USED]) {
    return this;
  }
  this[IS_INJECT_USED] = true;
  this.use(async (ctx, next) => {
    ctx.bag(DECORATOR_SCOPED_BAG, []);
    await next();
  })
    .hook((ctx, mh) => {
      parseInject(ctx, mh);
    })
    .hook((ctx, mh) => {
      if (isInjectClass(mh)) {
        return parseInject(ctx, mh);
      }
    }, HookType.Constructor);
  return this;
};

Startup.prototype.inject = function <
  TAnestor extends object,
  TTarget extends TAnestor
>(
  anestor: ObjectConstructor<TAnestor>,
  target: ObjectConstructor<TTarget> | TTarget,
  type = InjectType.Transient
): Startup {
  this.use(async (ctx, next) => {
    const injectMaps = ctx.bag<InjectMap[]>(MAP_BAG) ?? [];
    injectMaps.push({ anestor, target, type });
    ctx.bag(MAP_BAG, injectMaps);
    await next();
  });
  return this;
};

export { Inject, parseInject, InjectType };
