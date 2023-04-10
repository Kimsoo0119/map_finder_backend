import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import { PlaceDto } from './dto/place.dto';
import {
  PlaceAndReviews,
  PlaceInformation,
  PlaceSummary,
} from './interface/places.interface';
import { parseStringPromise } from 'xml2js';
import {
  CrawledNaverReview,
  NaverReview,
} from 'src/common/interface/common-interface';
import { PrismaService } from 'src/prisma/prisma.service';

const headers = {
  'X-Naver-Client-Id': process.env.CLIENT_ID,
  'X-Naver-Client-Secret': process.env.CLIENT_SECRET,
};

@Injectable()
export class PlacesService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly naverSearchApiUrl = process.env.NAVER_SEARCH_URL;
  private readonly crawlServerUrl = process.env.CRAWL_SERVER_URL;

  async getPlaceWithCrawl(place: PlaceDto) {
    try {
      const { title, address } = place;
      const selectedPlace: PlaceInformation = await this.checkPlaceExists({
        title,
        address,
      });
      if (selectedPlace) {
        return selectedPlace;
      }

      const { createdPlace, reviews }: PlaceAndReviews =
        await this.crawlAndCreatePlace(place);

      if (createdPlace.id && reviews[0]) {
        await this.createNaverReviews(createdPlace.id, reviews);
      }

      return createdPlace;
    } catch (error) {
      throw new InternalServerErrorException(
        `알 수 없는 서버 에러입니다.`,
        error,
      );
    }
  }

  private async crawlAndCreatePlace(place: PlaceDto): Promise<PlaceAndReviews> {
    try {
      const { title } = place;
      const { data } = await axios.get<CrawledNaverReview>(
        `${this.crawlServerUrl}/${title}`,
      );
      const {
        naverReviewerCounts = undefined,
        naverStars = undefined,
        reviews = [],
      } = data;

      const crawledPlace: PlaceInformation = {
        ...place,
        naverReviewerCounts,
        naverStars,
      };

      const createdPlace = await this.createPlace(crawledPlace);

      return { createdPlace, reviews };
    } catch (error) {
      throw new InternalServerErrorException(
        ` Place 정보 등록에 실패햇습니다.`,
        error,
      );
    }
  }

  private async createPlace(
    place: PlaceInformation,
  ): Promise<PlaceInformation> {
    try {
      const createdPlace: PlaceInformation = await this.prisma.places.create({
        data: place,
      });

      return createdPlace;
    } catch (error) {
      throw new InternalServerErrorException({
        location: 'createPlace',
        error,
        message: 'DB 생성 오류입니다.',
      });
    }
  }

  private async createNaverReviews(
    placeId: number,
    reviews: NaverReview[],
  ): Promise<void> {
    try {
      const reviewData = reviews.map((review) => ({
        placeId,
        description: review.description,
      }));

      await this.prisma.naverReviews.createMany({
        data: reviewData,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `DB 데이터 생성 오류입니다.`,
        error,
      );
    }
  }

  async getPlacesWithNaver(placeTitle: string): Promise<PlaceInformation[]> {
    try {
      const places: PlaceInformation[] = await this.sendNaverSearchApi(
        placeTitle,
      );

      return places;
    } catch (error) {
      throw new InternalServerErrorException(
        `알 수 없는 서버 에러입니다.`,
        error,
      );
    }
  }

  private async sendNaverSearchApi(
    placeTitle: string,
  ): Promise<Array<PlaceInformation>> {
    try {
      const params = {
        query: placeTitle,
        display: 5,
      };

      const { data } = await axios.get(this.naverSearchApiUrl, {
        headers,
        params,
      });

      const parsedData = await parseStringPromise(data, {
        explicitArray: false,
        ignoreAttrs: true,
      });

      const places = parsedData?.rss?.channel?.item ?? null;

      if (!places) {
        return [];
      }

      const placeInformations: Array<PlaceInformation> = Array.isArray(places)
        ? places.map((place) => this.mapPlace(place))
        : [this.mapPlace(places)];

      return placeInformations;
    } catch (error) {
      throw new InternalServerErrorException(
        `Naver API 사용에 실패했습니다`,
        error,
      );
    }
  }

  private mapPlace(place): PlaceInformation {
    return {
      title: place.title.replace(/(<([^>]+)>)/gi, ''),
      category: place.category,
      address: place.address,
      telephone: place.telephone,
      mapX: place.mapx,
      mapY: place.mapy,
    };
  }

  private async checkPlaceExists(
    place: PlaceSummary,
  ): Promise<PlaceInformation> {
    try {
      const selectedPlace: PlaceInformation =
        await this.prisma.places.findFirst({
          where: { ...place },
        });

      return selectedPlace;
    } catch (error) {
      throw new InternalServerErrorException({
        location: 'getPlace',
        error,
        message: '알 수 없는 서버 에러입니다.',
      });
    }
  }
}
