import { useMicroClient, InjectMicroClient } from "@ipare/micro-client";
import { MicroRedisClient } from "./client";
import { MicroRedisClientOptions } from "./options";

export { MicroRedisClient } from "./client";
export { MicroRedisClientOptions } from "./options";

declare module "@ipare/core" {
  interface Startup {
    useMicroRedis(options?: MicroRedisClientOptions & InjectMicroClient): this;
  }
}

useMicroClient("useMicroRedis", MicroRedisClient);
