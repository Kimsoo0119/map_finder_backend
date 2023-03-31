export interface PlaceInformation {
  title: string;
  address: string;
  category: string;
  telephone?: string;
  starts?: number;
  id?: number;
}

export interface PlaceSummary {
  title: string;
  address: string;
}
