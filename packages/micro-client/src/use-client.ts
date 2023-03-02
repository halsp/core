import { ObjectConstructor, Startup } from "@halsp/common";
import { InjectType } from "@halsp/inject";
import { IMicroClient } from "./client";
import { MICRO_IDENTITY_KEY } from "./constant";

export type InjectMicroClient = {
  identity?: string;
  injectType?: InjectType;
};

export function useMicroClient(
  fnName: string,
  clientConstructor: ObjectConstructor<IMicroClient>
) {
  Startup.prototype[fnName] = function (
    options: InjectMicroClient = {}
  ): Startup {
    const injectKey = MICRO_IDENTITY_KEY + (options.identity ?? "");
    return this.useInject().inject(
      injectKey,
      async () => {
        const opts = { ...options } as InjectMicroClient;
        delete opts.identity;
        delete opts.injectType;

        const client = new clientConstructor(opts);
        Object.defineProperty(client, "logger", {
          configurable: true,
          enumerable: false,
          get: () => this.logger,
          set: (val) => {
            this.logger = val;
          },
        });
        await client["connect"]();
        return client;
      },
      options.injectType ?? InjectType.Singleton
    );
  };
}
