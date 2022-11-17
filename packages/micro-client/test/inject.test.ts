import { Middleware } from "@ipare/core";
import { TestStartup } from "@ipare/testing";
import "../src";
import {
  IMicroClient,
  InjectMicroClient,
  MicroClient,
  useMicroClient,
} from "../src";
import * as net from "net";
import { InjectType } from "@ipare/inject";

class TestClient extends IMicroClient {
  async connect() {
    return;
  }
  dispose(): void {
    return;
  }
  async send(): Promise<any> {
    return;
  }
  emit(): void {
    return;
  }
}

declare module "@ipare/core" {
  interface Startup {
    useTestClient(options?: InjectMicroClient): this;
  }
}

useMicroClient("useTestClient", TestClient);

describe("inject", () => {
  it("should get micro client by getMicroClient", async () => {
    const server1 = net.createServer(() => undefined);
    server1.listen(23377);
    const server2 = net.createServer(() => undefined);
    server2.listen(23378);

    const { ctx } = await new TestStartup()
      .useTestClient()
      .useTestClient({
        identity: "custom_id",
      })
      .use(async (ctx) => {
        const client1 = await ctx.getMicroClient<TestClient>();
        ctx.bag("logger1", client1.logger);
        client1.dispose();

        client1.logger = undefined as any;
        const client2 = await ctx.getMicroClient<TestClient>("custom_id");
        ctx.bag("logger2", client2.logger);
        client2.dispose();
      })
      .run();

    server1.removeAllListeners();
    server1.close();
    server2.removeAllListeners();
    server2.close();

    expect(!!ctx.bag("logger1")).toBeTruthy();
    expect(!!ctx.bag("logger2")).toBeFalsy();
  });

  it("should get micro client by decorator", async () => {
    class TestMiddleware extends Middleware {
      @MicroClient()
      readonly injectDefaultClient!: IMicroClient;
      @MicroClient("custom_id")
      readonly injectIdentityClient!: IMicroClient;

      invoke() {
        this.ctx.bag(
          "equal",
          this.injectDefaultClient == this.injectIdentityClient
        );
        this.ctx.bag("instance", !!this.injectDefaultClient);
      }
    }

    const server1 = net.createServer(() => undefined);
    server1.listen(23379);

    const server2 = net.createServer(() => undefined);
    server2.listen(23380);

    const { ctx } = await new TestStartup()
      .useTestClient({
        injectType: InjectType.Scoped,
      })
      .useTestClient({
        identity: "custom_id",
        injectType: InjectType.Scoped,
      })
      .add(TestMiddleware)
      .run();

    server1.removeAllListeners();
    server1.close();
    server2.removeAllListeners();
    server2.close();

    expect(ctx.bag("equal")).toBeFalsy();
    expect(ctx.bag("instance")).toBeTruthy();
  });

  it("should set default options", async () => {
    const server = net.createServer(() => undefined);
    server.listen(2333);

    const { ctx } = await new TestStartup()
      .useTestClient()
      .use(async (ctx) => {
        const client1 = await ctx.getMicroClient<TestClient>();
        ctx.bag("logger", client1.logger);
        client1.dispose();
      })
      .run();

    server.removeAllListeners();
    server.close();

    expect(!!ctx.bag("logger")).toBeTruthy();
  });
});
