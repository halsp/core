import { useMicroClient, InjectMicroClient } from "@halsp/micro-client";
import { MicroRedisClient } from "./client";
import { MicroRedisClientOptions } from "./options";

export { MicroRedisClient } from "./client";
export { MicroRedisClientOptions } from "./options";

declare module "@halsp/core" {
  interface Startup {
    useMicroRedisClient(
      options?: MicroRedisClientOptions & InjectMicroClient
    ): this;
  }
}

useMicroClient("useMicroRedisClient", MicroRedisClient);
