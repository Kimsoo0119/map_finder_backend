import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PlaceDto } from '../dto/place.dto';
import { PlaceInformation, PlaceSummary } from '../interface/places.interface';

@Injectable()
export class PlacesRepository {
  constructor(private readonly prisma: PrismaService) {}
  async getPlace(place: PlaceSummary): Promise<PlaceInformation> {
    try {
      const selectedPlace: PlaceInformation = await this.prisma.place.findFirst(
        {
          where: { ...place },
        },
      );

      return selectedPlace;
    } catch (error) {
      throw new InternalServerErrorException({
        location: 'getPlace',
        error,
        message: '알 수 없는 서버 에러입니다.',
      });
    }
  }
  async createPlace(place: PlaceInformation): Promise<PlaceInformation> {
    try {
      const selectedPlace: PlaceInformation = await this.prisma.place.create({
        data: place,
      });

      return selectedPlace;
    } catch (error) {
      throw new InternalServerErrorException({
        location: 'createPlace',
        error,
        message: '알 수 없는 서버 에러입니다.',
      });
    }
  }
}
