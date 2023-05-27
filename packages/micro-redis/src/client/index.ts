import "@halsp/micro/dist/client";
import { useMicroClient, InjectMicroClient } from "@halsp/micro/dist/client";
import { MicroRedisClientOptions } from "../options";
import { MicroRedisClient } from "./client";

declare module "@halsp/core" {
  interface Startup {
    useMicroRedisClient(
      options?: MicroRedisClientOptions & InjectMicroClient
    ): this;
  }
}

useMicroClient("useMicroRedisClient", MicroRedisClient);
