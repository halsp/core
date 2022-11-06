import { MicroRedisClient, MicroRedisStartup } from "../src/redis";

const testOptions = {
  host: "redis-18129.c56.east-us.azure.cloud.redislabs.com",
  port: 18129,
  username: "default",
  password: "zOxXE0nkIdMjk2KhGkjFwIMNFamHmXiH",
};

(async () => {
  const startup = new MicroRedisStartup(testOptions)
    .use((ctx) => {
      ctx.res.setBody(ctx.req.body);
      if (ctx.bag("pt") != true) {
        throw new Error();
      }
    })
    .pattern("test_return", (ctx) => {
      ctx.bag("pt", true);
    });
  await startup.listen();

  await new Promise<void>((resolve) => {
    setTimeout(async () => {
      resolve();
    }, 500);
  });

  const client = new MicroRedisClient(testOptions);
  await client.connect();

  const result = await client.send("test_return", true);

  await startup.close();
  await client.dispose();

  if (!result) throw new Error();

  console.log("success");
})();
