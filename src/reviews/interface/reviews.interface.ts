import { LocationType } from '@prisma/client';

export interface DetailedReview {
  id: number;
  description: string;
  user: {
    nickname: string;
  };
  created_at: Date;
  updated_at: Date;
  is_unisex: boolean;
  location: LocationType;
}

export interface SimpleReview {
  id: number;
  description: string;
  stars: number;
  user: {
    nickname: string;
  };
}
