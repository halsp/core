import { HttpRequest } from "../../src";
import { TestStartup } from "../test-startup";

beforeAll(() => {
  new TestStartup();
});

describe("body", () => {
  it("should set req.body", async () => {
    const req = new HttpRequest().setBody("abc");
    expect(req.body).toBe("abc");
  });

  it("str body", async () => {
    const req = new HttpRequest().setBody("test body");

    expect(typeof req.body).toBe("string");
    expect(req.body).toBe("test body");
  });

  it("obj body", async () => {
    const req = new HttpRequest().setBody({
      b1: 1,
      b2: "2",
    });

    expect(req.body.b1).toBe(1);
    expect(req.body.b2).toBe("2");
  });
});
