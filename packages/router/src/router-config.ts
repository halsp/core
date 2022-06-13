import MapItem from "./map/map-item";

export interface RouterConfig {
  dir?: string;
  prefix?: string;
  customMethods?: string[];
}

export interface RouterDistConfig {
  dir: string;
  map: MapItem[];
}

export interface RouterConfigMerged {
  dir: string;
  map?: MapItem[];
  prefix?: string;
  customMethods?: string[];
}
