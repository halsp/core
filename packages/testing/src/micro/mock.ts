export function createMockRedis() {
  const subscribes = {} as Record<string, (data: string) => void>;
  return {
    subscribe: (channel: string, listener: (data: string) => void) => {
      subscribes[channel] = listener;
    },
    unsubscribe: (channel: string) => {
      delete subscribes[channel];
    },
    publish: (channel: string, data: string) => {
      subscribes[channel] && subscribes[channel](data);
    },
    connect() {
      this.isReady = true;
    },
    disconnect() {
      this.isReady = false;
    },
    isReady: true,
    isOpen: true,
  };
}

export function mockConnection(this: any) {
  this.initClients = async function () {
    const redis = createMockRedis();

    (this as any).pub = redis;
    (this as any).sub = redis;
    redis.connect();
  };
  return this;
}

export function mockConnectionFrom(this: any, target: any) {
  this.initClients = async function () {
    (this as any).pub = (target as any).pub;
    (this as any).sub = (target as any).sub;
  };
  return this;
}
