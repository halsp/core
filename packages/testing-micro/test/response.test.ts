import { Response } from "@ipare/core";
import "../src";

describe("response.expect", () => {
  it("should expect body", async () => {
    new Response()
      .setBody({
        a: 1,
      })
      .expect({
        a: 1,
      });
  });
});
