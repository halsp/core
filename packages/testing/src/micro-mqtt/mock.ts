import type mqtt from "mqtt";

function createMockClient() {
  const topics: string[] = [];
  const events: Record<
    string,
    ((topic: string, payload: Buffer, packet: mqtt.IPublishPacket) => void)[]
  > = {};

  const publish = (
    topic: string,
    data: string,
    options?: mqtt.IClientPublishOptions
  ) => {
    if (options && !!options["test_equal"] && !topics.includes(topic)) {
      return;
    }

    const cbs = events["message"];
    if (!cbs) return;
    cbs.forEach((cb) => {
      cb(topic, Buffer.from(data, "utf-8"), {
        ...options,
        payload: data,
        topic,
        cmd: "publish",
      } as mqtt.IPublishPacket);
    });
  };

  return {
    subscribe: (topic: string) => {
      topics.push(topic);
    },
    unsubscribe: (topic: string) => {
      if (topics.includes(topic)) {
        topics.splice(topics.indexOf(topic), 1);
      }
    },
    publish: publish,
    on: (
      event: string,
      callback: (
        topic: string,
        payload: Buffer,
        packet: mqtt.IPublishPacket
      ) => void
    ) => {
      if (events[event]) {
        events[event].push(callback);
      } else {
        events[event] = [callback];
      }
    },
    emit: (event: string, ...args: any[]) => {
      const cbs = events[event] ?? [];
      cbs.forEach((cb) => {
        (cb as any)(...args);
      });
    },
    removeAllListeners() {
      for (const key in events) {
        delete events[key];
      }
    },
    end() {
      this.connected = false;
      this.disconnected = true;
    },
    connected: false,
    disconnected: undefined as boolean | undefined,
    reset() {
      this.connected = false;
      this.disconnected = undefined;
    },
  };
}

export function createMock(singleton = true) {
  const client = createMockClient();

  return {
    connect: () => {
      const result = singleton ? client : createMockClient();
      result.reset();
      setTimeout(() => {
        result.connected = true;
        result.emit("connect");
      }, 500);
      return result;
    },
  };
}

export const mockPkgName = "";
Object.defineProperty(exports, "mockPkgName", {
  get: () => {
    return process.env.IS_LOCAL_TEST ? "jest" : "mqtt";
  },
});
