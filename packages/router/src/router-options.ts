import MapItem from "./map/map-item";

export interface RouterOptions {
  prefix?: string;
  decorators?: ClassDecorator[] | ((mapItem: MapItem) => ClassDecorator[]);
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
