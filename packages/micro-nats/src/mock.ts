import { MicroNatsConnection } from "./connection";

export function createMockNats() {
  let isClosed = true;
  const subscribes = {} as Record<string, (data: string) => void>;
  return {
    subscribe: (channel: string) => {
      const asyncIterable: AsyncIterable<any> = {
        [Symbol.asyncIterator]: async function* () {
          while (true) {
            const data = await new Promise<any>((resolve) => {
              subscribes[channel] = (data) => {
                resolve(data);
              };
            });
            if (isClosed) break;

            yield {
              data: Buffer.from(data, "utf-8"),
            };
          }
        },
      };

      return asyncIterable;
    },
    publish: (channel: string, data: string) => {
      subscribes[channel] && subscribes[channel](data);
    },
    connect() {
      isClosed = false;
    },
    close() {
      isClosed = true;
    },
    isClosed() {
      return isClosed;
    },
  };
}

export function mockConnection(this: MicroNatsConnection) {
  this.initClients = async function () {
    const nats = createMockNats();

    (this as any).connection = nats;
    nats.connect();
  };
  return this;
}

export function mockConnectionFrom(
  this: MicroNatsConnection,
  target: MicroNatsConnection
) {
  this.initClients = async function () {
    (this as any).connection = (target as any).connection;
  };
  return this;
}
