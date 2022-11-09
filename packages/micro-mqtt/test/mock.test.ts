import { createMockMqtt } from "../src/mock";

describe("mock", () => {
  it("should not emit event without listen", () => {
    const con = createMockMqtt();
    con.publish("", "");
  });

  it("should set connected true when connect() called", () => {
    const con = createMockMqtt();

    expect(con.connected()).toBeFalsy();
    expect(con.disconnected()).toBeTruthy();
    con.connect();
    expect(con.connected()).toBeTruthy();
    expect(con.disconnected()).toBeFalsy();
  });
});
