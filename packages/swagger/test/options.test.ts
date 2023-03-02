import { HttpMethods } from "@halsp/methods";
import { Request } from "@halsp/core";
import { TestHttpStartup } from "@halsp/testing/dist/http";
import "../src";
import { TEST_ACTION_DIR } from "@halsp/router/dist/constant";
import { OpenApiBuilder } from "openapi3-ts-remove-yaml";
import { SwaggerMiddlware } from "../src/swagger.middleware";
import * as fs from "fs";

declare module "@halsp/core" {
  interface Startup {
    setTestDir(dir: string): this;
  }
}

TestHttpStartup.prototype.setTestDir = function (dir: string) {
  this[TEST_ACTION_DIR] = dir;
  return this;
};

describe("options", () => {
  it("should ignore use again", async () => {
    const res = await new TestHttpStartup()
      .setContext(
        new Request().setMethod(HttpMethods.get).setPath("swagger/index.json")
      )
      .use(async (ctx, next) => {
        await next();
        expect(typeof ctx.swaggerOptions.builder).toBe("function");
      })
      .useSwagger({
        builder: (builder) => {
          builder.addDescription("desc-test1");
        },
      })
      .useSwagger({
        builder: (builder) => {
          builder.addDescription("desc-test2");
        },
      })
      .setTestDir("test/parser")
      .useRouter()
      .run();

    expect(res.status).toBe(200);
    expect(res.body.info.description).toBe("desc-test1");
  });

  it("should create custom builder", async () => {
    const res = await new TestHttpStartup()
      .setContext(
        new Request().setMethod(HttpMethods.get).setPath("swagger/index.json")
      )
      .useSwagger({
        builder: () => {
          return new OpenApiBuilder().addDescription("new-desc");
        },
      })
      .useSwagger({})
      .setTestDir("test/parser")
      .useRouter()
      .run();

    expect(res.status).toBe(200);
    expect(res.body.info.description).toBe("new-desc");
  });

  it("should set lang when set options.html.lang", async () => {
    const res = await new TestHttpStartup()
      .setContext(
        new Request().setMethod(HttpMethods.get).setPath("swagger/index.html")
      )
      .useSwagger({
        html: {
          lang: "zh",
        },
      })
      .setTestDir("test/parser")
      .useRouter()
      .run();

    expect(res.status).toBe(200);
    const html = res.body as string;
    expect(html.includes(`<html lang="zh">`)).toBeTruthy();
  });

  it("should remove default style when options.html.removeDefaultStyle=true", async () => {
    const res = await new TestHttpStartup()
      .setContext(
        new Request().setMethod(HttpMethods.get).setPath("swagger/index.html")
      )
      .useSwagger({
        html: {
          removeDefaultStyle: true,
        },
      })
      .setTestDir("test/parser")
      .useRouter()
      .run();

    expect(res.status).toBe(200);
    const html = res.body as string;
    expect(html.includes("stylesheet")).toBeFalsy();
  });

  it("should set title when set options.html.title", async () => {
    const res = await new TestHttpStartup()
      .setContext(
        new Request().setMethod(HttpMethods.get).setPath("swagger/index.html")
      )
      .useSwagger({
        html: {
          title: "test-title",
        },
      })
      .setTestDir("test/parser")
      .useRouter()
      .run();

    expect(res.status).toBe(200);
    const html = res.body as string;
    expect(html.includes(`<title>test-title</title>`)).toBeTruthy();
  });

  it("should add favicon when set options.html.favicon", async () => {
    const res = await new TestHttpStartup()
      .setContext(
        new Request().setMethod(HttpMethods.get).setPath("swagger/index.html")
      )
      .useSwagger({
        html: {
          favicon: "domain.com/favicon.ico",
        },
      })
      .setTestDir("test/parser")
      .useRouter()
      .run();

    expect(res.status).toBe(200);
    expect(res.body).toBe(
      `<!-- HTML for static distribution bundle build -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Swagger UI</title>
    <link rel="stylesheet" type="text/css" href="./swagger-ui.css" />
    <link rel="stylesheet" type="text/css" href="index.css" />
    <link rel="icon" type="image/png" href="domain.com/favicon.ico" />
  </head>

  <body>
    <div id="swagger-ui"></div>
    <script src="./swagger-ui-bundle.js" charset="UTF-8"> </script>
    <script src="./swagger-ui-standalone-preset.js" charset="UTF-8"> </script>
    <script src="./swagger-initializer.js" charset="UTF-8"> </script>
  </body>
</html>
`
    );
  });

  it("should add multiple favicon when set options.html.favicon", async () => {
    const res = await new TestHttpStartup()
      .setContext(
        new Request().setMethod(HttpMethods.get).setPath("swagger/index.html")
      )
      .useSwagger({
        html: {
          favicon: [
            "domain.com/favicon-32x32.png",
            "domain.com/favicon-16x16.png",
          ],
        },
      })
      .setTestDir("test/parser")
      .useRouter()
      .run();

    expect(res.status).toBe(200);
    expect(res.body).toBe(
      `<!-- HTML for static distribution bundle build -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Swagger UI</title>
    <link rel="stylesheet" type="text/css" href="./swagger-ui.css" />
    <link rel="stylesheet" type="text/css" href="index.css" />
    <link rel="icon" type="image/png" href="domain.com/favicon-32x32.png" />
    <link rel="icon" type="image/png" href="domain.com/favicon-16x16.png" />
  </head>

  <body>
    <div id="swagger-ui"></div>
    <script src="./swagger-ui-bundle.js" charset="UTF-8"> </script>
    <script src="./swagger-ui-standalone-preset.js" charset="UTF-8"> </script>
    <script src="./swagger-initializer.js" charset="UTF-8"> </script>
  </body>
</html>
`
    );
  });

  it("should add style when set options.html.style", async () => {
    const res = await new TestHttpStartup()
      .setContext(
        new Request().setMethod(HttpMethods.get).setPath("swagger/index.html")
      )
      .useSwagger({
        html: {
          style: `html {
      height: 100%;
    }`,
        },
      })
      .setTestDir("test/parser")
      .useRouter()
      .run();

    expect(res.status).toBe(200);
    expect(res.body).toBe(
      `<!-- HTML for static distribution bundle build -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Swagger UI</title>
    <link rel="stylesheet" type="text/css" href="./swagger-ui.css" />
    <link rel="stylesheet" type="text/css" href="index.css" />
    <style>
    html {
      height: 100%;
    }
    </style>
  </head>

  <body>
    <div id="swagger-ui"></div>
    <script src="./swagger-ui-bundle.js" charset="UTF-8"> </script>
    <script src="./swagger-ui-standalone-preset.js" charset="UTF-8"> </script>
    <script src="./swagger-initializer.js" charset="UTF-8"> </script>
  </body>
</html>
`
    );
  });

  it("should add css when set options.html.css", async () => {
    const res = await new TestHttpStartup()
      .setContext(
        new Request().setMethod(HttpMethods.get).setPath("swagger/index.html")
      )
      .useSwagger({
        html: {
          css: `/css/index.css`,
        },
      })
      .setTestDir("test/parser")
      .useRouter()
      .run();

    expect(res.status).toBe(200);
    expect(res.body).toBe(
      `<!-- HTML for static distribution bundle build -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Swagger UI</title>
    <link rel="stylesheet" type="text/css" href="./swagger-ui.css" />
    <link rel="stylesheet" type="text/css" href="index.css" />
    <link rel="stylesheet" type="text/css" href="/css/index.css" />
  </head>

  <body>
    <div id="swagger-ui"></div>
    <script src="./swagger-ui-bundle.js" charset="UTF-8"> </script>
    <script src="./swagger-ui-standalone-preset.js" charset="UTF-8"> </script>
    <script src="./swagger-initializer.js" charset="UTF-8"> </script>
  </body>
</html>
`
    );
  });

  it("should add script when set options.html.script", async () => {
    const res = await new TestHttpStartup()
      .setContext(
        new Request().setMethod(HttpMethods.get).setPath("swagger/index.html")
      )
      .useSwagger({
        html: {
          script: `const a = 1;`,
        },
      })
      .setTestDir("test/parser")
      .useRouter()
      .run();

    expect(res.status).toBe(200);
    expect(res.body).toBe(
      `<!-- HTML for static distribution bundle build -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Swagger UI</title>
    <link rel="stylesheet" type="text/css" href="./swagger-ui.css" />
    <link rel="stylesheet" type="text/css" href="index.css" />
    
  </head>

  <body>
    <div id="swagger-ui"></div>
    <script src="./swagger-ui-bundle.js" charset="UTF-8"> </script>
    <script src="./swagger-ui-standalone-preset.js" charset="UTF-8"> </script>
    <script src="./swagger-initializer.js" charset="UTF-8"> </script>
    <script>
    const a = 1;
    </script>
  </body>
</html>
`
    );
  });

  it("should js file when set options.html.js", async () => {
    const res = await new TestHttpStartup()
      .setContext(
        new Request().setMethod(HttpMethods.get).setPath("swagger/index.html")
      )
      .useSwagger({
        html: {
          js: `domain.com/js/index.js`,
        },
      })
      .setTestDir("test/parser")
      .useRouter()
      .run();

    expect(res.status).toBe(200);
    expect(res.body).toBe(
      `<!-- HTML for static distribution bundle build -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Swagger UI</title>
    <link rel="stylesheet" type="text/css" href="./swagger-ui.css" />
    <link rel="stylesheet" type="text/css" href="index.css" />
    
  </head>

  <body>
    <div id="swagger-ui"></div>
    <script src="./swagger-ui-bundle.js" charset="UTF-8"> </script>
    <script src="./swagger-ui-standalone-preset.js" charset="UTF-8"> </script>
    <script src="./swagger-initializer.js" charset="UTF-8"> </script>
    <script src="domain.com/js/index.js" charset="UTF-8"> </script>
  </body>
</html>
`
    );
  });

  it("should be error when index.html body stream emit error", async () => {
    const res = await new TestHttpStartup()
      .setContext(
        new Request().setMethod(HttpMethods.get).setPath("swagger/index.html")
      )
      .setSkipThrow()
      .use(async (ctx, next) => {
        Object.defineProperty(ctx, "swaggerOptions", {
          configurable: false,
          enumerable: false,
          get: () => {
            return {
              path: "swagger",
            };
          },
        });
        ctx.res.status = 200;
        ctx.res.body = fs.createReadStream("not-exist");

        try {
          await next();
        } catch (err) {
          console.log("err", err);
          throw err;
        }
      })
      .add(
        () =>
          new SwaggerMiddlware({
            path: "swagger",
          })
      )
      .setTestDir("test/parser")
      .run();

    console.log("body", res.body);
    expect(res.status).toBe(500);
    expect(res.body.status).toBe(500);
    expect(res.body.code).toBe("ENOENT");
  });
});

describe("swagger-initializer.js", () => {
  it("should set default swagger config", async () => {
    const res = await new TestHttpStartup()
      .setContext(
        new Request()
          .setMethod(HttpMethods.get)
          .setPath("swagger/swagger-initializer.js")
      )
      .useSwagger()
      .setTestDir("test/parser")
      .useRouter()
      .run();

    expect(res.status).toBe(200);

    const json = JSON.stringify({
      url: `./index.json`,
      dom_id: "#swagger-ui",
      presets: [
        "%SwaggerUIBundle.presets.apis%",
        "%SwaggerUIStandalonePreset%",
      ],
      plugins: ["%SwaggerUIBundle.plugins.DownloadUrl%"],
    })
      .replace(/"%/g, "")
      .replace(/%"/g, "");
    expect(res.body).toBe(`window.onload = function() {
  const ui = SwaggerUIBundle(${json});
  
  window.ui = ui;
  };`);
  });

  it("should set custom swagger config", async () => {
    const res = await new TestHttpStartup()
      .setContext(
        new Request()
          .setMethod(HttpMethods.get)
          .setPath("swagger/swagger-initializer.js")
      )
      .useSwagger({
        uiBundleOptions: {
          url: "swagger.json",
          deepLinking: true,
          presets: [],
          plugins: [],
        },
      })
      .setTestDir("test/parser")
      .useRouter()
      .run();

    expect(res.status).toBe(200);

    const json = JSON.stringify({
      url: `swagger.json`,
      dom_id: "#swagger-ui",
      presets: [],
      plugins: [],
      deepLinking: true,
    });
    expect(res.body).toBe(`window.onload = function() {
  const ui = SwaggerUIBundle(${json});
  
  window.ui = ui;
  };`);
  });

  it("should initOAuth when set options.initOAuth = true", async () => {
    const res = await new TestHttpStartup()
      .setContext(
        new Request()
          .setMethod(HttpMethods.get)
          .setPath("swagger/swagger-initializer.js")
      )
      .useSwagger({
        uiBundleOptions: {
          url: "swagger.json",
          presets: [],
          plugins: [],
        },
        initOAuth: true,
      })
      .setTestDir("test/parser")
      .useRouter()
      .run();

    expect(res.status).toBe(200);

    const json = JSON.stringify({
      url: `swagger.json`,
      dom_id: "#swagger-ui",
      presets: [],
      plugins: [],
    });
    expect(res.body).toBe(`window.onload = function() {
  const ui = SwaggerUIBundle(${json});
  ui.initOAuth(true);

  window.ui = ui;
  };`);
  });
});
