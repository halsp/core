function createMockClient() {
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
export function createMock(singleton = true) {
  const client = createMockClient();

  return {
    createClient: () => {
      if (singleton) {
        client.isReady = false;
        return client;
      } else {
        return createMockClient();
      }
    },
  };
}

export const mockPkgName = "";
Object.defineProperty(exports, "mockPkgName", {
  get: () => {
    return process.env.IS_LOCAL_TEST ? "jest" : "redis";
  },
});
