import { MapItem } from "../src";

const mapItem = new MapItem(
  "restful/^id/animals.connect.delete.get.head.options.patch.post.trace.ts"
);
console.log("mapItem", {
  actionName: mapItem.actionName,
  fileName: mapItem.fileName,
  fileNameWithoutExtension: mapItem.fileNameWithoutExtension,
  methods: mapItem.methods,
  path: mapItem.path,
  reqPath: mapItem.reqPath,
});
