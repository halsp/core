import MapItem from "./map/map-item";

export interface RouterOptions {
  dir?: string;
  prefix?: string;
  customMethods?: string[];
}

export interface RouterDistOptions {
  dir: string;
  map: MapItem[];
}

export interface RouterOptionsMerged {
  dir: string;
  map?: MapItem[];
  prefix?: string;
  customMethods?: string[];
}
