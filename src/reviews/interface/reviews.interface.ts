import { Emoji, LocationType, ToiletReviews } from '@prisma/client';

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
  like_count: number;
  sad_count: number;
  smile_count: number;
  helpful_count: number;
  user: {
    id: number;
    nickname: string;
  };
}

export interface EmojiLog {
  id: number;
  emoji: Emoji;
  toilet_reviews: ToiletReviews;
}
