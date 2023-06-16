import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import axios from 'axios';
import { PlaceDto } from './dto/place.dto';
import {
  PlaceAndReviews,
  PlaceInformation,
  PlaceSummary,
} from './interface/places.interface';
import { parseStringPromise } from 'xml2js';
import {
  CrawledNaverPlaceInformations,
  NaverReview,
} from 'src/common/interface/common-interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { load } from 'cheerio';

const apiHeaders = {
  'X-Naver-Client-Id': process.env.CLIENT_ID,
  'X-Naver-Client-Secret': process.env.CLIENT_SECRET,
};

@Injectable()
export class PlacesService {
  constructor(private readonly prisma: PrismaService) {}
  private readonly naverLocalSearchApiUrl = process.env.NAVER_LOCAL_SEARCH_URL;
  private readonly naverMapUrl = process.env.NAVER_MAP_URL;
  private readonly naverMapUrlOption = process.env.NAVER_MAP_URL_OPTION;
  private readonly naverPlaceUrl = process.env.NAVER_PLACE_URL;
  private readonly naverPlaceBaseUrl = process.env.NAVER_PLACE_BASE_URL;
  private readonly naverHeaders = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.93 Safari/537.36',
  };

  async getPlaceWithCrawl(place: PlaceDto) {
    const { title, address } = place;
    const selectedPlace: PlaceInformation = await this.checkPlaceExists({
      title,
      address,
    });
    if (selectedPlace) {
      return selectedPlace;
    }

    const { naverPlaceId, thumUrl }: CrawledNaverPlaceInformations =
      await this.crawlPlaceDetails(title);

    const { naverStars, naverReviewerCounts, naverReviews } =
      await this.crawlNaverReviewsAndStars(naverPlaceId);
    if (naverReviews) {
      const crawledPlace: PlaceInformation = {
        ...place,
        naverStars,
        naverReviewerCounts,
        naverPlaceId,
        thumUrl,
      };

      const createdPlaceId: number = await this.createPlace(crawledPlace);

      await this.createNaverReviews(createdPlaceId, naverReviews);
      return crawledPlace;
    }
  }

  private async crawlNaverReviewsAndStars(naverPlaceId: string) {
    const naverPlaceReviewUrl = await this.getNaverPlaceReviewUrl(naverPlaceId);

    const naverReviews = [];

    try {
      const { data } = await axios.get(naverPlaceReviewUrl, {
        headers: this.naverHeaders,
      });

      const $ = load(data);

      const naverStars = $(
        '#app-root > div > div > div > div.place_section.OP4V8 > div.zD5Nm > div.dAsGb > span.PXMot.LXIwF > em',
      ).text();
      const naverReviewerCounts = $(
        '#app-root > div > div > div > div.place_section.OP4V8 > div.zD5Nm > div.dAsGb > span:nth-child(2) > a > em',
      ).text();

      $('.zPfVt').each(function () {
        naverReviews.push({ description: $(this).text() });
      });

      return { naverStars, naverReviewerCounts, naverReviews };
    } catch (error) {
      if (error.response.status === 404) {
        return;
      }
    }
  }

  private async getNaverPlaceReviewUrl(placeId: string): Promise<string> {
    const extractedPlaceId = placeId.match(/\d+/g).join('');
    const naverPlaceUrl = `${this.naverPlaceBaseUrl}${extractedPlaceId}`;

    const { request } = await axios.get(naverPlaceUrl, {
      headers: apiHeaders,
    });

    const naverPlaceReviewUrl = request.res.responseUrl.replace(
      '/home',
      '/review/visitor',
    );

    return naverPlaceReviewUrl;
  }

  private async createPlace(place: PlaceInformation): Promise<number> {
    const createdPlace: PlaceInformation = await this.prisma.places.create({
      data: place,
    });
    if (!createdPlace.id) {
      throw new InternalServerErrorException(`데이터 생성에 실패했습니다.`);
    }

    return createdPlace.id;
  }

  private async createNaverReviews(
    placeId: number,
    naverReviews: NaverReview[],
  ): Promise<void> {
    const reviewData = naverReviews
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

    const { data } = await axios.get(this.naverLocalSearchApiUrl, {
      headers: apiHeaders,
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

  private async crawlPlaceDetails(
    title,
  ): Promise<CrawledNaverPlaceInformations> {
    const naverPlaceUrl = `${this.naverMapUrl}?query=${title}${this.naverMapUrlOption}`;

    const { data } = await axios.get(naverPlaceUrl, {
      headers: this.naverHeaders,
    });

    if (data.result.type === 'NO_RESULT') {
      throw new NotFoundException(`검색 결과가 존재하지 않습니다.`);
    }

    const { id: naverPlaceId, thumUrl } = data.result.site.list[0];

    return { naverPlaceId, thumUrl };
  }
}
