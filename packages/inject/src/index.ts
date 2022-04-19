import "@sfajs/core";
import { Startup, ObjectConstructor, HttpContext } from "@sfajs/core";
import { HookType } from "@sfajs/core/dist/middlewares";
import { DECORATOR_SCOPED_BAG, IS_INJECT_USED, MAP_BAG } from "./constant";
import { Inject, CreateInject } from "./decorators";
import { KeyTargetType } from "./inject-key";
import { InjectMap } from "./inject-map";
import { isInjectClass, parseInject } from "./inject-parser";
import { InjectType } from "./inject-type";

declare module "@sfajs/core" {
  interface Startup {
    useInject(): this;

    inject<T extends KeyTargetType>(key: string, target: T): this;
    inject<T extends KeyTargetType>(
      key: string,
      target: (ctx: HttpContext) => T | Promise<T>,
      type?: InjectType
    ): this;
    inject<TTarget extends object>(
      key: string,
      target: ObjectConstructor<TTarget>,
      type?: InjectType
    ): this;

    inject<TAnestor extends object, TTarget extends TAnestor>(
      anestor: ObjectConstructor<TAnestor>,
      target: TTarget
    ): this;
    inject<TAnestor extends object>(
      target: ObjectConstructor<TAnestor>,
      type?: InjectType
    ): this;
    inject<TAnestor extends object, TTarget extends TAnestor>(
      anestor: ObjectConstructor<TAnestor>,
      target: (ctx: HttpContext) => TTarget | Promise<TTarget>,
      type?: InjectType
    ): this;
    inject<TAnestor extends object, TTarget extends TAnestor>(
      anestor: ObjectConstructor<TAnestor>,
      target: ObjectConstructor<TTarget>,
      type?: InjectType
    ): this;
  }
}

Startup.prototype.useInject = function (): Startup {
  if (this[IS_INJECT_USED]) {
    return this;
  }
  this[IS_INJECT_USED] = true;

  return this.use(async (ctx, next) => {
    ctx.bag(DECORATOR_SCOPED_BAG, []);
    await next();
  })
    .hook(async (ctx, mh) => {
      if (isInjectClass(mh)) {
        return await parseInject(ctx, mh);
      }
    }, HookType.Constructor)
    .hook(async (ctx, mh) => {
      await parseInject(ctx, mh);
    });
};

Startup.prototype.inject = function (...args: any[]): Startup {
  let anestor: ObjectConstructor | string;
  let target: ObjectConstructor | any | ((ctx: HttpContext) => any);
  let type: InjectType | undefined;
  if (typeof args[0] == "string") {
    anestor = args[0];
    target = args[1];
    type = args[2];
  } else if (args[1] == undefined) {
    anestor = args[0];
    target = args[0];
  } else {
    if (typeof args[1] == typeof InjectType.Singleton) {
      anestor = args[0];
      target = args[0];
      type = args[1];
    } else {
      anestor = args[0];
      target = args[1];
      type = args[2];
    }
  }

  this.use(async (ctx, next) => {
    const injectMaps = ctx.bag<InjectMap[]>(MAP_BAG) ?? [];
    injectMaps.push({
      anestor,
      target,
      type: type ?? InjectType.Scoped,
    });
    ctx.bag(MAP_BAG, injectMaps);
    await next();
  });
  return this;
};

export { Inject, CreateInject, parseInject, InjectType };
