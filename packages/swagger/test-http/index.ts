import "@halsp/native";
import "@halsp/body";
import chalk from "chalk";
import "../src";
import "@halsp/router";
import { TEST_ACTION_DIR } from "@halsp/router/dist/constant";
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
    .useHttpJsonBody()
    .useSwagger({
      path: "",
    })
    .useRouter();
  startup[TEST_ACTION_DIR] = "test/parser";

  await startup.listen();
  console.log(chalk.blue(`start: http://localhost:${2333}`));
}

bootstrap();
