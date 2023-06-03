import {
  Startup,
  ObjectConstructor,
  Context,
  isFunction,
  isString,
} from "@halsp/core";
import { HookType } from "@halsp/core";
import { MAP_BAG, SINGLETON_BAG } from "./constant";
import { KeyTargetType, InjectMap } from "./interfaces";
import {
  InjectDecoratorParser,
  InjectTarget,
  isInjectClass,
} from "./inject-parser";
import { InjectType } from "./inject-type";
import { IService } from "./interfaces/service";

declare module "@halsp/core" {
  interface Startup {
    useInject(): this;

    inject<T extends KeyTargetType>(key: string, target: T): this;
    inject<T extends KeyTargetType>(
      key: string,
      target: (ctx: Context) => T | Promise<T>,
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
      target: (ctx: Context) => TTarget | Promise<TTarget>,
      type?: InjectType
    ): this;
    inject<TAnestor extends object, TTarget extends TAnestor>(
      anestor: ObjectConstructor<TAnestor>,
      target: ObjectConstructor<TTarget>,
      type?: InjectType
    ): this;
  }

  interface Context {
    getService<T extends object = any>(key: string): Promise<T | undefined>;
    getService<T extends object = any>(target: InjectTarget<T>): Promise<T>;
    getCachedService<T extends object = any>(
      target: ObjectConstructor<T> | string
    ): T | undefined;
  }
}

const usedMap = new WeakMap<Startup, boolean>();
Startup.prototype.useInject = function (): Startup {
  if (usedMap.get(this)) return this;
  usedMap.set(this, true);

  const singletons = [];
  return this.use(async (ctx, next) => {
    initContext(ctx);
    ctx.set(SINGLETON_BAG, singletons);
    await next();
  })
    .hook(HookType.Constructor, async (ctx, mh) => {
      if (isInjectClass(mh)) {
        return await ctx.getService(mh);
      }
    })
    .hook(async (ctx, mh) => {
      await ctx.getService(mh);
    });
};

Startup.prototype.inject = function (...args: any[]): Startup {
  let anestor: ObjectConstructor | string;
  let target: ObjectConstructor | any | ((ctx: Context) => any);
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
    const injectType = type ?? InjectType.Scoped;
    const injectMaps = ctx.get<InjectMap[]>(MAP_BAG) ?? [];
    injectMaps.push({
      anestor,
      target,
      type: injectType,
    });
    ctx.set(MAP_BAG, injectMaps);

    try {
      await next();
    } finally {
      await dispose(ctx, injectType, anestor);
    }
  });
  return this;
};

async function dispose<T extends object = any>(
  ctx: Context,
  injectType: InjectType,
  target: ObjectConstructor<T> | string
) {
  async function disposeObject<T extends IService = any>(instance?: T) {
    if (!instance) return;
    if (!instance.dispose || !isFunction(instance.dispose)) return;

    await instance.dispose(ctx);
  }

  if (injectType == InjectType.Scoped) {
    const instance = ctx.getCachedService(target) as IService;
    await disposeObject(instance);
  } else if (injectType == InjectType.Transient) {
    const parser = new InjectDecoratorParser<T>(ctx);
    const instances = parser.getTransientInstances(target) as IService[];
    for (const instance of instances) {
      await disposeObject(instance);
    }
  }
}

function initContext(ctx: Context) {
  ctx.getService = async function <T extends object = any>(
    target: InjectTarget<T> | string
  ) {
    if (isString(target)) {
      return await new InjectDecoratorParser<T>(ctx).parseKey(target);
    } else {
      return await new InjectDecoratorParser<T>(ctx).parseTarget(target);
    }
  };
  ctx.getCachedService = function <T extends object = any>(
    target: ObjectConstructor<T> | string
  ) {
    return new InjectDecoratorParser<T>(ctx).getCachedService(target);
  };
}
