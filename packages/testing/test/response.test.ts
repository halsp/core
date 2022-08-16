import { Response } from "@ipare/core";
import "../src";

describe("response.expect", () => {
  it("should expect status 200", async () => {
    new Response(200).expect(200);
  });

  it("should expect body", async () => {
    new Response(200, {
      a: 1,
    }).expect({
      a: 1,
    });
  });

  it("should expect status and body", async () => {
    new Response(200, {
      a: 1,
    }).expect(200, {
      a: 1,
    });
  });

  it("should expect checker", async () => {
    new Response(200).expect((res) => {
      expect(res.status).toBe(200);
    });
  });
});
