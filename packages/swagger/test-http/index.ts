import { HttpStartup } from "@sfajs/http";
import chalk from "chalk";
import "../src";
import "@sfajs/router";

async function bootstrap() {
  // const startup = new HttpStartup()
  //   .useHttpJsonBody()
  //   .useSwagger({
  //     modelCwd: "test-http/actions",
  //   })
  //   .useRouter({
  //     dir: "test-http/actions",
  //   });

  const startup = new HttpStartup().useHttpJsonBody().useSwagger({}).useRouter({
    dir: "test/parser",
  });

  const result = await startup.dynamicListen(2333);
  console.log(chalk.blue(`start: http://localhost:${result.port}`));
  return result;
}

bootstrap();
