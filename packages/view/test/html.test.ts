import { TestStartup } from "@ipare/core";
import "../src";

function runHtml(renderAgain: boolean) {
  test("html", async function () {
    const res = await new TestStartup()
      .useView({
        dir: "test/views",
      })
      .use(async (ctx) => {
        await ctx.view("html/");
        if (renderAgain) {
          await ctx.view("html/");
        }
      })
      .run();

    expect(res.status).toBe(200);
    expect(res.body).toBe("html content");
    expect(res.getHeader("content-type")).toBe("text/html");
  });
}

runHtml(true);
runHtml(false);
