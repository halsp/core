import { Startup } from "@sfajs/core";

export default interface RouterConfig {
  dir?: string;
  prefix?: string;
  onParserAdded?: (startup: Startup) => void;
}
