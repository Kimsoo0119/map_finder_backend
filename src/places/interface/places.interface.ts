import { NaverReview } from 'src/common/interface/common-interface';

export interface PlaceInformation {
  title: string;
  region_id?: number;
  address: string;
  category: string;
  telephone?: string;
  starts?: number;
  id?: number;
  mapX?: number;
  mapY?: number;
  naver_reviewer_counts?: string;
  naver_stars?: string;
  thum_url?: string;
  naver_place_id?: string;
}

export interface PlaceSummary {
  title: string;
  address: string;
}

export interface PlaceAndReviews {
  createdPlace: PlaceInformation;
  reviews: NaverReview[];
}
