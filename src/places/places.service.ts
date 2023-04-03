import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { PlaceDto } from './dto/place.dto';
import { PlaceInformation } from './interface/places.interface';
import { PlacesRepository } from './repository/places.repository';
import { parseStringPromise } from 'xml2js';

const headers = {
  'X-Naver-Client-Id': process.env.CLIENT_ID,
  'X-Naver-Client-Secret': process.env.CLIENT_SECRET,
};

@Injectable()
export class PlacesService {
  constructor(private readonly placesRepository: PlacesRepository) {}

  private readonly naverSearchApiUrl = process.env.NAVER_SEARCH_URL;

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

  async getPlaces(placeTitle: string) {
    const result = await this.sendNaverSearchApi(placeTitle);
    return result;
  }
  private async sendNaverSearchApi(placeTitle) {
    try {
      const params = {
        query: placeTitle,
        display: 4,
      };

      const naverResponse = await axios.get(this.naverSearchApiUrl, {
        headers,
        params,
        responseType: 'text',
      });
      const parsedData = await parseStringPromise(naverResponse.data, {
        explicitArray: false,
        ignoreAttrs: true,
      });
      const { item: items } = parsedData.rss.channel;

      if (!items[0]) {
        return null;
      }

      const result = items.map((item) => {
        const title = item.title.replace(/(<([^>]+)>)/gi, '');

        return {
          title,
          category: item.category,
          address: item.address,
          telephone: item.telephone,
          mapX: item.mapx,
          mapY: item.mapy,
        };
      });

      return result;
    } catch (error) {
      throw new Error(error);
    }
  }
}
