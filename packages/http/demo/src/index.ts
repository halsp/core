import { SfaHttp } from "@sfajs/http";

new SfaHttp()
  .use(async (ctx) => {
    ctx.res.setHeader("demo", "@sfajs/http");
    ctx.ok("@sfajs/http");
  })
  .listen(2333);
console.log("Server running at http://127.0.0.1:2333/");
