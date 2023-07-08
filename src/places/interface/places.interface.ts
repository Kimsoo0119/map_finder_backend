import { NaverReview } from 'src/common/interface/common-interface';

export interface PlaceInformation {
  title: string;
  regionId?: number;
  address: string;
  category: string;
  telephone?: string;
  starts?: number;
  id?: number;
  mapX?: number;
  mapY?: number;
  naverReviewerCounts?: string;
  naverStars?: string;
  thumUrl?: string;
  naverPlaceId?: string;
}

export interface PlaceSummary {
  title: string;
  address: string;
}

export interface PlaceAndReviews {
  createdPlace: PlaceInformation;
  reviews: NaverReview[];
}
