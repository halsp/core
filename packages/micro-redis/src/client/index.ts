import "@halsp/micro/client";
import { useMicroClient, InjectMicroClient } from "@halsp/micro/client";
import { MicroRedisClientOptions } from "./options";
import { MicroRedisClient } from "./client";

export { MicroRedisClient };
export { MicroRedisClientOptions };

declare module "@halsp/core" {
  interface Startup {
    useMicroRedisClient(
      options?: MicroRedisClientOptions & InjectMicroClient,
    ): this;
  }
}

useMicroClient("useMicroRedisClient", MicroRedisClient);
