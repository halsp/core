import ApiDocsNoteParser from "../../src/ApiDocs/ApiDocsNoteParser";
import path = require("path");
import "../UseTest";
import "../../src";

test("note parser", async function () {
  const file = path.join(process.cwd(), "./test/controllers", "docs/get.ts");
  const parser = new ApiDocsNoteParser(file);
  parser.docs;
});
