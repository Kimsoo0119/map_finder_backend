import { Controller, Get, Param, Query } from '@nestjs/common';
import { PlaceDto } from './dto/place.dto';
import { PlacesService } from './places.service';
import { PlaceInformation } from './interface/places.interface';

@Controller('places')
export class PlacesController {
  constructor(private readonly placeService: PlacesService) {}
  @Get('/:placeTitle')
  async getPlaces(
    @Param('placeTitle') placeTitle: string,
  ): Promise<PlaceInformation[]> {
    const places: PlaceInformation[] = await this.placeService.getPlaces(
      placeTitle,
    );
    return places;
  }
  @Get('/')
  async getPlace(@Query() places: PlaceDto) {
    const place = await this.placeService.getPlace(places);
    return place;
  }
}
