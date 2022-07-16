import "@ipare/cli";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
declare module "@ipare/cli" {
  interface Configuration {
    routerActionsDir?: string;
  }
}
