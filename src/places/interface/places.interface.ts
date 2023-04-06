export interface PlaceInformation {
  title: string;
  address: string;
  category: string;
  telephone?: string;
  starts?: number;
  id?: number;
  mapX?: number;
  mapY?: number;
  naverReviewerCounts?: string;
  naverStars?: string;
}

export interface PlaceSummary {
  title: string;
  address: string;
}
