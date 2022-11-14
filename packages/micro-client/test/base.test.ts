import { MicroBaseClient } from "../src";

describe("client", () => {
  it("should create packet", async () => {
    class TestClient extends MicroBaseClient {
      connect(): Promise<void> {
        throw new Error("Method not implemented.");
      }
      dispose(): void {
        throw new Error("Method not implemented.");
      }
      send<T>(): Promise<T> {
        throw new Error("Method not implemented.");
      }
      emit(): void {
        throw new Error("Method not implemented.");
      }
      test1(pattern: string, data: any) {
        return super.createServerPacket(pattern, data, true);
      }
      test2(pattern: string, data: any) {
        return super.createServerPacket(pattern, data, false);
      }
    }

    const packet1 = new TestClient().test1("pt", "data");
    expect(packet1.pattern).toBe("pt");
    expect(packet1.data).toBe("data");
    expect(!!packet1.id).toBeTruthy();

    const packet2 = new TestClient().test2("pt", "data");
    expect(packet2.pattern).toBe("pt");
    expect(packet2.data).toBe("data");
    expect(!!packet2["id"]).toBeFalsy();
  });
});
