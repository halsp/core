import { MicroRedisConnection } from "../../src/redis";

export function createMockRedis() {
  const subscribes = {} as Record<string, (data: string) => void>;
  return {
    subscribe: (channel: string, listener: (data: string) => void) => {
      subscribes[channel] = listener;
    },
    publish: (channel: string, data: string) => {
      subscribes[channel] && subscribes[channel](data);
    },
    connect() {
      this.isReady = false;
    },
    disconnect() {
      this.isReady = false;
    },
    isReady: true,
    isOpen: true,
  };
}

export function mockConnection(this: MicroRedisConnection) {
  this.initClients = async function () {
    const redis = createMockRedis();

    (this as any).pub = redis;
    (this as any).sub = redis;
    redis.connect();
  };
}

export function mockConnectionFrom(
  this: MicroRedisConnection,
  target: MicroRedisConnection
) {
  this.initClients = async function () {
    (this as any).pub = (target as any).pub;
    (this as any).sub = (target as any).sub;
  };
}
