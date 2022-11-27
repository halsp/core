import { MicroRedisClient } from "../src";

describe("redis client", () => {
  describe("emit", () => {
    it("should not emit message before connect", async () => {
      const client = new MicroRedisClient();

      let error: any;
      try {
        client.emit("", "");
      } catch (err) {
        error = err;
      }
      expect(error.message).toBe("The connection is not connected");
    });

    it("should not emit message if pub.isReady is false", async () => {
      const client = new MicroRedisClient();
      (client as any).pub = {
        isReady: false,
      };

      let error: any;
      try {
        client.emit("", "");
      } catch (err) {
        error = err;
      }
      expect(error.message).toBe("The connection is not connected");
    });

    it("should emit message when connected", async () => {
      let published = false;
      const client = new MicroRedisClient();
      (client as any).pub = {
        isReady: true,
        publish: () => {
          published = true;
        },
      };

      client.emit("", "");
      expect(published).toBeTruthy();
    });
  });

  describe("send", () => {
    it("should not send message before connect", async () => {
      const client = new MicroRedisClient();
      const result = await client.send("", "");
      await client.dispose();
      expect(result).toEqual({
        error: "The connection is not connected",
      });
    });

    it("should not send message if sub.isReady is false", async () => {
      const client = new MicroRedisClient();
      (client as any).sub = {
        isReady: true,
        isOpen: true,
        quit: () => undefined,
      };
      const result = await client.send("", "");
      await client.dispose();
      expect(result).toEqual({
        error: "The connection is not connected",
      });
    });

    it("should not send message if hub.isReady is false", async () => {
      const client = new MicroRedisClient();
      (client as any).sub = {
        isReady: true,
      };
      (client as any).pub = {
        isReady: false,
      };
      const result = await client.send("", "");
      await client.dispose();
      expect(result).toEqual({
        error: "The connection is not connected",
      });
    });
  });

  describe("timeout", () => {
    it("should return timeout without callback", async () => {
      const client = new MicroRedisClient();
      (client as any).sub = {
        isReady: true,
        subscribe: () => undefined,
        unsubscribe: () => undefined,
      };
      (client as any).pub = {
        isReady: true,
        publish: () => undefined,
      };

      const result = await client.send("", "", 1000);
      expect(result).toEqual({
        error: "Send timeout",
      });
    });
  });

  describe("prefix", () => {
    it("should subscribe and publish pattern with prefix", async () => {
      let publishPattern = "";
      let subscribePattern = "";
      const client = new MicroRedisClient({
        prefix: "pt_",
      });
      (client as any).sub = {
        isReady: true,
        subscribe: (pattern: string) => {
          subscribePattern = pattern;
        },
        unsubscribe: () => undefined,
      };
      (client as any).pub = {
        isReady: true,
        publish: (pattern) => {
          publishPattern = pattern;
        },
      };

      await client.send("test_pattern", "", 1000);
      expect(publishPattern).toBe("pt_test_pattern");
      expect(subscribePattern.startsWith("pt_test_pattern.")).toBeTruthy();
    });
  });

  describe("return", () => {
    it("should return when subscribe callback", async () => {
      const client = new MicroRedisClient();
      (client as any).sub = {
        isReady: true,
        subscribe: (pattern: string, callback: (buffer: Buffer) => void) => {
          const str = JSON.stringify({
            id: "123",
            pattern: "test",
            data: "d",
          });
          callback(Buffer.from(str));
        },
        unsubscribe: () => undefined,
      };
      (client as any).pub = {
        isReady: true,
        publish: () => undefined,
      };

      const result = await client.send("", "");
      await client.dispose();
      expect(result).toEqual({
        data: "d",
        error: undefined,
      });
    });

    it("should return when subscribe callback response", async () => {
      const client = new MicroRedisClient();
      (client as any).sub = {
        isReady: true,
        subscribe: (pattern: string, callback: (buffer: Buffer) => void) => {
          const str = JSON.stringify({
            id: "123",
            pattern: "test",
            response: "d",
          });
          callback(Buffer.from(str));
        },
        unsubscribe: () => undefined,
      };
      (client as any).pub = {
        isReady: true,
        publish: () => undefined,
      };

      const result = await client.send("", "");
      await client.dispose();
      expect(result).toEqual({
        data: "d",
        error: undefined,
      });
    });
  });

  describe("connect", () => {
    jest.mock("redis", () => {
      return {
        createClient: (opt: any) => {
          return {
            opt,
            connect: () => undefined,
          };
        },
      };
    });

    it("should connect with default host and port", async () => {
      const client = new MicroRedisClient();
      await client.connect();

      expect((client as any)["sub"]["opt"]).toEqual({
        url: `redis://localhost:6379`,
      });
    });
  });
});
