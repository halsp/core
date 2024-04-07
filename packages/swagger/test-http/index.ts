import "@halsp/native";
import "@halsp/body";
import chalk from "chalk";
import "../src";
import "@halsp/router";
import { HALSP_ROUTER_DIR } from "@halsp/router/constant";
import { Startup } from "@halsp/core";

async function bootstrap() {
  // const startup = new NativeStartup()
  //   .useHttpJsonBody()
  //   .useSwagger({})
  //   .useRouter({
  //     dir: "test-http/actions",
  //   });

  const startup = new Startup()
    .useNative({
      port: 2333,
    })
    .useSwagger({
      path: "",
    })
    .useRouter();
  process.env[HALSP_ROUTER_DIR] = "test/parser";

  await startup.listen();
  console.log(chalk.blue(`start: http://localhost:${2333}`));
}

bootstrap();
