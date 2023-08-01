import { NaverReview } from 'src/common/interface/common-interface';

export interface Place {
  address: string;
  id: number;
  title: string;
  telephone: string;
  stars: string;
  naver_reviewer_counts: string;
  naver_stars: string;
  thum_url: string;
  is_init: boolean;
  naver_place_id?: string;
  region: {
    district: string;
    administrative_district: string;
  };
  place_category: {
    main: string;
    sub: string;
  };
}

export interface PlaceInformation {
  id?: number;
  title: string;
  region_id?: number;
  category?: string;
  address?: string;
  telephone?: string;
  starts?: number;
  category_id?: number;
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
  region_id?: number | null;
  category_id: number;
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
  regionId?: number;
}

export interface CrawledNaverPlace {
  naver_place_id: string;
  thum_url: string;
  naver_stars: string;
  naver_reviewer_counts: string;
}

export interface CrawledPlace {
  placeInfo: CrawledNaverPlace;
  naverReviews: any[];
}

export interface PlacesCreateManyInput {
  id?: number;
  title: string;
  region_id?: number | null;
  address: string;
  category_id: number;
  thum_url?: string | null;
  telephone?: string | null;
  stars?: string | null;
  naver_place_id?: string | null;
  naver_stars?: string | null;
  naver_reviewer_counts?: string | null;
  is_init?: boolean;
}
