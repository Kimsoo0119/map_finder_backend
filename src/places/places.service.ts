import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import { PlaceDto } from './dto/place.dto';
import { PlaceInformation, PlaceSummary } from './interface/places.interface';
import { parseStringPromise } from 'xml2js';
import { CrawledNaverReview } from 'src/common/interface/common-interface';
import { ReviewsRepository } from 'src/reviews/repository/reviews.repository';
import { PrismaService } from 'src/prisma/prisma.service';

const headers = {
  'X-Naver-Client-Id': process.env.CLIENT_ID,
  'X-Naver-Client-Secret': process.env.CLIENT_SECRET,
};

@Injectable()
export class PlacesService {
  constructor(
    private readonly reviewsRepository: ReviewsRepository,
    private readonly prisma: PrismaService,
  ) {}

  private readonly naverSearchApiUrl = process.env.NAVER_SEARCH_URL;
  private readonly crawlServerUrl = process.env.CRAWL_SERVER_URL;

  async getPlaceWithCrawl(place: PlaceDto): Promise<PlaceInformation> {
    try {
      const { title, address } = place;
      const selectedPlace: PlaceInformation = await this.getPlace({
        title,
        address,
      });
      const { naverReviewerCounts, naverStars, reviews } = await axios
        .get<CrawledNaverReview>(`${this.crawlServerUrl}/${title}`)
        .then((res) => res.data);

      const crawledPlace: PlaceInformation = {
        ...place,
        naverReviewerCounts,
        naverStars,
      };

      const createdPlace: PlaceInformation = await this.createPlace(
        crawledPlace,
      );

      if (createdPlace.id) {
      }
      return;
    } catch (error) {
      console.log(error);
    }
  }

  async getPlacesWithNaver(placeTitle: string): Promise<PlaceInformation[]> {
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

  private async getPlace(place: PlaceSummary): Promise<PlaceInformation> {
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
  private async createPlace(
    place: PlaceInformation,
  ): Promise<PlaceInformation> {
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
