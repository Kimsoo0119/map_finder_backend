import { Injectable } from '@nestjs/common';
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
  }

  private async crawlAndCreatePlace(place: PlaceDto): Promise<PlaceAndReviews> {
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
  }

  private async createPlace(
    place: PlaceInformation,
  ): Promise<PlaceInformation> {
    const createdPlace: PlaceInformation = await this.prisma.places.create({
      data: place,
    });

    return createdPlace;
  }

  private async createNaverReviews(
    placeId: number,
    reviews: NaverReview[],
  ): Promise<void> {
    const reviewData = reviews
      .filter((review) => review.description)
      .map((review) => ({
        placeId,
        description: review.description,
      }));

    await this.prisma.naverReviews.createMany({
      data: reviewData,
    });
  }

  async getPlacesWithNaver(placeTitle: string): Promise<PlaceInformation[]> {
    const places: PlaceInformation[] = await this.sendNaverSearchApi(
      placeTitle,
    );

    return places;
  }

  private async sendNaverSearchApi(
    placeTitle: string,
  ): Promise<Array<PlaceInformation>> {
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
    const selectedPlace: PlaceInformation = await this.prisma.places.findFirst({
      where: { ...place },
    });

    return selectedPlace;
  }
}
