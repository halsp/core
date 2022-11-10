import { HttpServerStartup } from "@ipare/http-server";
import chalk from "chalk";
import "../src";
import "@ipare/router";
import { TEST_ACTION_DIR } from "@ipare/router/dist/constant";

async function bootstrap() {
  // const startup = new HttpServerStartup()
  //   .useHttpJsonBody()
  //   .useSwagger({})
  //   .useRouter({
  //     dir: "test-http/actions",
  //   });

  const startup = new HttpServerStartup()
    .useHttpJsonBody()
    .useSwagger({
      path: "",
    })
    .useRouter();
  startup[TEST_ACTION_DIR] = "test/parser";

  const result = await startup.dynamicListen(2333);
  console.log(chalk.blue(`start: http://localhost:${result.port}`));
  return result;
}

bootstrap();
