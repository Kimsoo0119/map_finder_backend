import { NaverReview } from 'src/common/interface/common-interface';

export interface PlaceInformation {
  id?: number;
  title: string;
  region_id?: number;
  category?: string;
  address?: string;
  telephone?: string;
  starts?: number;
  mapX?: number;
  mapY?: number;
  naver_reviewer_counts?: string;
  naver_stars?: string;
  thum_url?: string;
  naver_place_id?: string;
  administrativeDistrict?: string;
  district?: string;
  detailAddress?: string;
}

export interface PlacesCreateInput {
  title: string;
  address: string;
  region_id?: number;
  category?: string | null;
  thum_url?: string | null;
  telephone?: string | null;
  stars?: string | null;
  naver_place_id?: string | null;
  naver_stars?: string | null;
  naver_reviewer_counts?: string | null;
}

export interface PlaceSummary {
  title: string;
  address: string;
}

export interface PlaceAndReviews {
  createdPlace: PlaceInformation;
  reviews: NaverReview[];
}

export interface ExtractAddress {
  administrativeDistrict: string;
  district: string;
  detailAddress: string;
}

export interface CrawledNaverPlace {
  naver_place_id: string;
  thum_url: string;
  naver_stars: string;
  naver_reviewer_counts: string;
}
