import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { PlaceDto } from './dto/place.dto';
import { PlacesService } from './places.service';
import {
  Place,
  PlaceInformation,
  PlacesCreateInput,
  RecommendedPlaces,
} from './interface/places.interface';
import { RecommendedTarget } from './enum/place.enum';

@Controller('places')
export class PlacesController {
  constructor(private readonly placeService: PlacesService) {}

  @Get('/')
  async getPlace(@Query() places: PlaceDto): Promise<Place> {
    const place: Place = await this.placeService.getPlace(places);

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

  @Get('/recommended/list/:address/restaurant')
  async getRecommendRestaurants(@Param('address') address: string) {
    const recommendedRestaurants: RecommendedPlaces =
      await this.placeService.getRecommendPlace(
        address,
        RecommendedTarget.RESTAURANT,
      );

    return recommendedRestaurants;
  }

  @Get('/recommended/list/:address/accommodation')
  async getRecommendAccommodations(@Param('address') address: string) {
    const recommendedAccommodations: RecommendedPlaces =
      await this.placeService.getRecommendPlace(
        address,
        RecommendedTarget.ACCOMMODATION,
      );

    return recommendedAccommodations;
  }

  @Get('/recommended/list/:address/cafe')
  async getRecommendCafes(@Param('address') address: string) {
    const recommendCafes: RecommendedPlaces =
      await this.placeService.getRecommendPlace(
        address,
        RecommendedTarget.CAFE,
      );

    return recommendCafes;
  }
}
