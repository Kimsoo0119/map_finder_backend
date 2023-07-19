import { LocationType } from '@prisma/client';

export interface ToiletReview {
  id: number;
  stars: number;
  place_id: number;
  created_at: Date;
  updated_at: Date;
  is_unisex: boolean;
  location: LocationType;
  description: string;
  visited_at: Date;
  user: {
    id: number;
    nickname: string;
  };
}
