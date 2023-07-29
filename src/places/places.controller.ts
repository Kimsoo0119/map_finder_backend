import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { PlaceDto } from './dto/place.dto';
import { PlacesService } from './places.service';
import {
  PlaceInformation,
  PlacesCreateInput,
} from './interface/places.interface';

@Controller('places')
export class PlacesController {
  constructor(private readonly placeService: PlacesService) {}

  @Get('/')
  async getPlace(@Query() places: PlaceDto) {
    const place = await this.placeService.getPlace(places);
    console.log(place);
    return place;
  }

  @Get('/list/:placeTitle')
  async getPlacesWithNaver(
    @Param('placeTitle') placeTitle: string,
  ): Promise<PlaceInformation[]> {
    const places: PlaceInformation[] =
      await this.placeService.getPlacesWithNaver(placeTitle);

    return places;
  }

  @Get('/recommended/:address')
  async getRecommendPlace(@Param('address') address: string) {
    const recommendedPlace = await this.placeService.getRecommendedPlace(
      address,
    );

    return recommendedPlace;
  }
}
