import { MapItem, RouterInitedOptions } from "@ipare/router";
import { OpenApiBuilder, OperationObject, TagObject } from "openapi3-ts";
import { ACTION_DECORATORS } from "../constant";
import { ActionCallback } from "../decorators";

export class TagsParser {
  constructor(
    private readonly routerMap: readonly MapItem[],
    private readonly builder: OpenApiBuilder,
    private readonly routerOptions: RouterInitedOptions
  ) {}

  public parse() {
    const tags = this.builder.getSpec().tags as TagObject[];
    this.builder.getSpec().tags = tags;

    this.routerMap.forEach((mapItem) => {
      const operation: OperationObject = {
        responses: {},
      };

      const action = mapItem.getAction(this.routerOptions.dir);
      const actionCbs: ActionCallback[] =
        Reflect.getMetadata(ACTION_DECORATORS, action.prototype) ?? [];
      actionCbs.forEach((cb) => cb(operation));
      const actionTags = operation.tags ?? [];
      actionTags.forEach((tag) => {
        if (!tags.some((t) => t.name == tag)) {
          this.builder.addTag({
            name: tag,
          });
        }
      });
    });
  }
}
