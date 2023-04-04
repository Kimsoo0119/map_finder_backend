import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { PlaceDto } from './dto/place.dto';
import { PlaceInformation } from './interface/places.interface';
import { PlacesRepository } from './repository/places.repository';
import { parseStringPromise } from 'xml2js';
import { title } from 'process';

const headers = {
  'X-Naver-Client-Id': process.env.CLIENT_ID,
  'X-Naver-Client-Secret': process.env.CLIENT_SECRET,
};

@Injectable()
export class PlacesService {
  constructor(private readonly placesRepository: PlacesRepository) {}

  private readonly naverSearchApiUrl = process.env.NAVER_SEARCH_URL;
  private readonly crawlServerUrl = process.env.CRAWL_SERVER_URL;

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

      return;
    } catch (error) {
      console.log(error);
    }
  }

  async getPlaces(placeTitle: string): Promise<PlaceInformation[]> {
    const places: PlaceInformation[] = await this.sendNaverSearchApi(
      placeTitle,
    );
    return places;
  }

  private async sendNaverSearchApi(placeTitle): Promise<PlaceInformation[]> {
    try {
      const params = {
        query: placeTitle,
        display: 4,
      };

      const { data } = await axios.get(this.naverSearchApiUrl, {
        headers,
        params,
        responseType: 'text',
      });

      const parsedData = await parseStringPromise(data, {
        explicitArray: false,
        ignoreAttrs: true,
      });

      const places = parsedData?.rss?.channel?.item ?? null;

      if (!places) {
        return null;
      }

      const mappedPlaces: PlaceInformation[] = Array.isArray(places)
        ? places.map(this.mapPlace)
        : [this.mapPlace(places)];

      return mappedPlaces;
    } catch (error) {
      throw new Error(error);
    }
  }

  mapPlace(place): PlaceInformation {
    return {
      title: place.title.replace(/(<([^>]+)>)/gi, ''),
      category: place.category,
      address: place.address,
      telephone: place.telephone,
      mapX: place.mapx,
      mapY: place.mapy,
    };
  }
}
