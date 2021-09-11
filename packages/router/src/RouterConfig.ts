import { Startup } from "sfa";

export default interface RouterConfig {
  dir?: string;
  prefix?: string;
  onParserAdded?: (startup: Startup) => void;
}
