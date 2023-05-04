import { LocationType } from '@prisma/client';

export interface DetailedReview {
  id: number;
  description: string;
  user: {
    name: string;
  };
  createdAt: Date;
  updatedAt: Date;
  isUnisex: boolean;
  location: LocationType;
}

export interface SimpleReview {
  id: number;
  description: string;
  stars: number;
  user: {
    name: string;
  };
}
