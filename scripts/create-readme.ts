import * as fs from "fs";
import prettier from "prettier";
import { getPackages } from "./packages";

const baseReadme = fs.readFileSync("./README.md", "utf-8");
const introRegExp = /<!--intro-->([\s\S]+?)<!--intro-end-->/m;
const matchArr = introRegExp.exec(baseReadme) as RegExpExecArray;
const baseIntro = matchArr[1];

function getInstallIntro(name: string) {
  return `
## 安装

\`\`\`
npm install @ipare/${name}
\`\`\`
  `;
}

function getPackageIntro(name: string) {
  const readme = fs.readFileSync(`packages/${name}/base.readme.md`, "utf-8");
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

function getPackageReadme(name: string) {
  const intro = getPackageIntro(name);
  return baseReadme.replace(introRegExp, intro);
}

getPackages().forEach((item) => {
  fs.writeFileSync(
    `packages/${item}/README.md`,
    prettier.format(getPackageReadme(item), {
      parser: "markdown",
    })
  );
});
