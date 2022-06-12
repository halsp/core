import MapItem from "./map/map-item";

export interface RouterConfig {
  dir?: string;
  prefix?: string;
  customMethods?: string[];
}

export interface RouterDistConfig {
  dir: string;
  prefix: string;
  customMethods: string[];
  map: MapItem[];
}
