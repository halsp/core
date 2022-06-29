import MapItem from "./map/map-item";

export interface RouterOptions {
  dir?: string;
  prefix?: string;
  customMethods?: string[];
}

export interface RouterInitedOptions extends RouterOptions {
  dir: string;
}

export interface RouterDistOptions {
  dir: string;
  map: MapItem[];
}

export interface RouterOptionsMerged extends RouterInitedOptions {
  map?: MapItem[];
}
