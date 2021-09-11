import { SfaRequest, TestStartup } from "sfa";
import "../../src";
import { runMva } from "../global";

test("default", async function () {
  await runMva(async () => {
    const res = await new TestStartup(new SfaRequest().setMethod("GET"))
      .useMva()
      .run();

    expect(res.getHeader("content-type")).toBe("text/html");
    expect(res.status).toBe(200);
    expect(res.body).toBe("<p>@sfajs/mvc</p>");
  });
});
