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
  @Get('/:placeTitle')
  async getPlacesWithNaver(
    @Param('placeTitle') placeTitle: string,
  ): Promise<PlaceInformation[]> {
    const places: PlaceInformation[] =
      await this.placeService.getPlacesWithNaver(placeTitle);

    return places;
  }

  @Get('/')
  async getPlace(
    @Query() places: PlaceDto,
  ): Promise<PlaceInformation | PlacesCreateInput> {
    const place: PlaceInformation | PlacesCreateInput =
      await this.placeService.getPlace(places);

    return place;
  }
}
