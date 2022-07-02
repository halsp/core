import { MapItem } from "@sfajs/router";
import { OpenApiBuilder, TagObject } from "openapi3-ts";
import { ACTION_METADATA_API_TAGS } from "../constant";

export class TagsParser {
  constructor(
    private readonly routerMap: readonly MapItem[],
    private readonly builder: OpenApiBuilder
  ) {}

  public parse() {
    const tags = this.builder.getSpec().tags as TagObject[];
    this.builder.getSpec().tags = tags;

    this.routerMap.forEach((mapItem) => {
      const actionTags: string[] = mapItem[ACTION_METADATA_API_TAGS] ?? [];
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
