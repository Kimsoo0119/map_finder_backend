export interface CrawledNaverReview {
  naverReviewerCounts: string;
  naverStars: string;
  reviews: NaverReview[];
}

export interface NaverReview {
  description: string;
}

export interface CrawledNaverPlaceInformations {
  naverPlaceId: string;
  thumUrl: string | null;
}

export interface User {
  id: number;
  email: string;
  nickname: string;
}
