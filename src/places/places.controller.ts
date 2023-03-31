import { Controller, Get, Param, Query } from '@nestjs/common';
import { PlaceDto } from './dto/place.dto';
import { PlacesService } from './places.service';

@Controller('places')
export class PlacesController {
  constructor(private readonly placeService: PlacesService) {}
  @Get('/')
  async getPlace(@Query() places: PlaceDto) {
    const place = await this.placeService.getPlace(places);
    return place;
  }
}
