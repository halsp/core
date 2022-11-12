import type nats from "nats";

function createMockClient() {
  let isClosed = false;
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
    options?: {
      reply?: string;
      headers?: nats.MsgHdrs;
      err?: Error; // just for test err
      resErr?: Error; // just for test err
    }
  ) => {
    subscribes[channel] &&
      subscribes[channel](options?.err, {
        subject: "",
        data: data,
        sid: 1,
        reply: options?.reply,
        headers: options?.headers,
        respond: (data, resOpts) => {
          if (!isClosed && options?.reply && data) {
            publish(options.reply, data, {
              headers: resOpts?.headers as nats.MsgHdrs,
              err: options.resErr,
            });
          }
          return true;
        },
      });
  };

  return {
    subscribe: subscribe,
    publish: publish,
    close() {
      isClosed = true;
    },
    isClosed() {
      return isClosed;
    },
    connect() {
      isClosed = false;
    },
  };
}

export function createMock(singleton = true) {
  const headers: Record<string, string> = {};
  const client = createMockClient();

  return {
    connect: () => {
      if (singleton) {
        client.connect();
        return client;
      } else {
        return createMockClient();
      }
    },
    headers: () => {
      return {
        hasError: false,
        status: "",
        code: 0,
        description: "",
        get(k: string) {
          return headers[k];
        },
        set(k: string, v: string) {
          headers[k] = v;
        },
        append(k: string, v: string) {
          if (headers[k]) {
            headers[k] += "," + v;
          } else {
            this.set(k, v);
          }
        },
        has(k: string) {
          return !!headers[k];
        },
        keys(): string[] {
          return Object.keys(headers);
        },
        values() {
          return Object.values(headers);
        },
        delete(k: string) {
          delete headers[k];
        },
      };
    },
  };
}
