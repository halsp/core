#!/usr/bin/env node

import { Config } from "../dist";
import DocsCreater from "../dist/ApiDocs/ApiDocsCreater";

const config = Config.default;
if (!config) {
  throw new Error("the config file is not exist");
}
if (!config.doc) {
  throw new Error("there is no doc config");
}
new DocsCreater(config).write(config.doc.output);
