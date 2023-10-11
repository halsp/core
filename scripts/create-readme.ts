import * as fs from "fs";
import prettier from "prettier";
import { getPackages } from "./get-packages";

const baseReadme = fs.readFileSync("./README.md", "utf-8");
const introRegExp = /<!--intro-->([\s\S]+?)<!--intro-end-->/m;
const matchArr = introRegExp.exec(baseReadme) as RegExpExecArray;
const baseIntro = matchArr[1];

function getInstallIntro(name: string) {
  return `
## 安装

\`\`\`
npm install @halsp/${name}
\`\`\`
  `;
}

function getPackageIntro(name: string) {
  const readme = getPackageBaseReadme(name);
  const install = readme.includes("<!--install-->");
  const useBaseIntro = readme.includes("<!--base-intro-->");
  const useDescIntro = readme.includes("<!--intro-desc-->");
  const useCustomIntro = readme.includes("<!--intro-->");

  let intro = "";
  if (useDescIntro) {
    const pkgStr = fs.readFileSync(`packages/${name}/package.json`, "utf-8");
    const pkg = JSON.parse(pkgStr);
    intro = pkg.description;
  } else if (useCustomIntro) {
    const customMatchArr = introRegExp.exec(readme) as RegExpExecArray;
    intro = customMatchArr[1];
  } else if (useBaseIntro) {
    intro = baseIntro;
  }

  if (install) {
    return intro + getInstallIntro(name);
  } else {
    return intro;
  }
}

function getPackageBaseReadme(name: string) {
  const readmePath = `packages/${name}/base.readme.md`;
  if (fs.existsSync(readmePath)) {
    return fs.readFileSync(readmePath, "utf-8");
  } else {
    let result = "<!--intro-desc-->";
    if (name != "core") {
      result += "\n<!--install-->";
    }
    return result;
  }
}

function createPackageReadme(name: string) {
  const intro = getPackageIntro(name);
  return baseReadme.replace(introRegExp, intro);
}

(async () => {
  for (const pkg of getPackages() as string[]) {
    await fs.promises.writeFile(
      `packages/${pkg}/README.md`,
      await prettier.format(createPackageReadme(pkg), {
        parser: "markdown",
      }),
    );
  }
})();
