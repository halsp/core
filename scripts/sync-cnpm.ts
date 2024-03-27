import { getPackages } from "./get-packages";

const dynamicImport = new Function(
  "specifier",
  `return import(specifier);
  `,
) as <T = any>(specifier: string) => Promise<T>;

async function dynamicImportDefault<T = any>(specifier: string) {
  const module = await dynamicImport(specifier);
  return module.default as T;
}

type Fetch = typeof import("node-fetch").default;

async function sync(fetch: Fetch, name: string) {
  const url = `https://registry-direct.npmmirror.com/-/package/@halsp/${name}/syncs`;
  const res = await fetch(url, {
    method: "PUT",
  });
  const json: any = await res.json();
  console.log(`sync ${name} ${json.ok ? "success" : "failed"}`);
}

(async () => {
  const fetch: Fetch = await dynamicImportDefault("node-fetch");
  const packages: string[] = getPackages();
  for (const pkg of packages) {
    await sync(fetch, pkg);
  }
})();
