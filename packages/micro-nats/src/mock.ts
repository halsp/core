import { MicroNatsConnection } from "./connection";
import * as nats from "nats";

export function createMockNats() {
  let isClosed = true;
  const subscribes = {} as Record<
    string,
    (err: Error | undefined, msg: nats.Msg) => void
  >;

  const subscribe = (
    channel: string,
    options: { callback: (err: Error | undefined, msg: nats.Msg) => void }
  ) => {
    subscribes[channel] = options.callback;
    return {
      unsubscribe: () => {
        delete subscribes[channel];
      },
    };
  };

  const publish = (
    channel: string,
    data: Uint8Array,
    options?: { reply?: string; headers?: nats.MsgHdrsImpl }
  ) => {
    subscribes[channel] &&
      subscribes[channel](undefined, {
        subject: "",
        data: data,
        sid: 1,
        reply: options?.reply,
        headers: options?.headers,
        respond: (data, resOpts) => {
          if (!isClosed && options?.reply && data) {
            publish(options.reply, data, {
              headers: resOpts?.headers as nats.MsgHdrsImpl,
            });
          }
          return true;
        },
      });
  };

  return {
    subscribe: subscribe,
    publish: publish,
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
