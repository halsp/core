import "@halsp/cli";

declare module "@halsp/cli" {
  interface Configuration {
    routerActionsDir?: string;
  }
}
