import { Controller, Get, Param, Query } from '@nestjs/common';
import { PlaceDto } from './dto/place.dto';
import { PlacesService } from './places.service';
import { PlaceInformation } from './interface/places.interface';

@Controller('places')
export class PlacesController {
  constructor(private readonly placeService: PlacesService) {}
  @Get('/:placeTitle')
  async getPlacesWithNaver(
    @Param('placeTitle') placeTitle: string,
  ): Promise<PlaceInformation[]> {
    const places: PlaceInformation[] =
      await this.placeService.getPlacesWithNaver(placeTitle);

    return places;
  }

  @Get('/')
  async getPlaceWithCrawl(@Query() places: PlaceDto) {
    const place = await this.placeService.getPlaceWithCrawl(places);

    return place;
  }
}
