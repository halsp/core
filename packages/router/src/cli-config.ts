import "@halsp/cli";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
declare module "@halsp/cli" {
  interface Configuration {
    routerActionsDir?: string;
  }
}
