import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PlaceDto } from './dto/place.dto';
import { PlaceInformation } from './interface/places.interface';
import { PlacesRepository } from './repository/places.repository';

@Injectable()
export class PlacesService {
  constructor(private readonly placesRepository: PlacesRepository) {}
  async getPlace(place: PlaceDto): Promise<PlaceInformation> {
    try {
      const { title, address } = place;
      const selectedPlace: PlaceInformation =
        await this.placesRepository.getPlace({
          title,
          address,
        });

      if (!selectedPlace) {
        const selectedPlace: PlaceInformation =
          await this.placesRepository.createPlace(place);

        return selectedPlace;
      }

      return selectedPlace;
    } catch (error) {
      console.log(error);
    }
  }
}
