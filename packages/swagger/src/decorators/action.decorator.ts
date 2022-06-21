import { SetActionMetadata } from "@sfajs/router";
import {
  ACTION_METADATA_API_TAGS,
  ACTION_METADATA_API_SUMMARY,
} from "../constant";

export function ApiTags(...tags: string[]) {
  return SetActionMetadata(ACTION_METADATA_API_TAGS, tags);
}

export function ApiSummary(summary: string) {
  return SetActionMetadata(ACTION_METADATA_API_SUMMARY, summary);
}
