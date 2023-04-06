import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PlacesController } from './places.controller';
import { PlacesRepository } from './repository/places.repository';
import { PlacesService } from './places.service';
import { ReviewsRepository } from 'src/reviews/repository/reviews.repository';

@Module({
  imports: [PlacesRepository, ReviewsRepository],
  controllers: [PlacesController],
  providers: [PlacesService],
})
export class PlacesModule {}
