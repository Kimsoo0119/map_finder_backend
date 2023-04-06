import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { ReviewsRepository } from './repository/reviews.repository';

@Module({
  imports: [ReviewsRepository],
  providers: [ReviewsService],
  controllers: [ReviewsController],
})
export class ReviewsModule {}
