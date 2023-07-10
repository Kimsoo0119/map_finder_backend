import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import axios from 'axios';
import { PlaceDto } from './dto/place.dto';
import {
  CrawledNaverPlace,
  ExtractAddress,
  PlaceInformation,
  PlaceSummary,
  PlacesCreateInput,
} from './interface/places.interface';
import { parseStringPromise } from 'xml2js';
import {
  CrawledNaverPlaceInformations,
  NaverReview,
} from 'src/common/interface/common-interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { load } from 'cheerio';
import { ConfigService } from '@nestjs/config';
import { Places } from '@prisma/client';

@Injectable()
export class PlacesService {
  private readonly naverLocalSearchApiUrl: string;
  private readonly naverMapUrl: string;
  private readonly naverMapUrlOption: string;
  private readonly naverPlaceBaseUrl: string;
  private readonly naverHeaders: object;
  private readonly apiHeaders: object;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.naverLocalSearchApiUrl = configService.get<string>(
      'NAVER_LOCAL_SEARCH_URL',
    );
    this.naverMapUrl = configService.get<string>('NAVER_MAP_URL');
    this.naverMapUrlOption = configService.get<string>('NAVER_MAP_URL_OPTION');
    this.naverPlaceBaseUrl = configService.get<string>('NAVER_PLACE_BASE_URL');
    this.naverHeaders = {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.93 Safari/537.36',
    };
    this.apiHeaders = {
      'X-Naver-Client-Id': configService.get<string>('CLIENT_ID'),
      'X-Naver-Client-Secret': configService.get<string>('CLIENT_SECRET'),
    };
  }

  async getPlace(
    place: PlaceDto,
  ): Promise<PlaceInformation | PlacesCreateInput> {
    const { title, address } = place;

    const extractAddress: ExtractAddress =
      this.extractDistrictAndAddress(address);
    place.address = extractAddress.detailAddress;

    const selectedPlace: PlaceInformation = await this.checkPlaceExists({
      title,
      address: extractAddress.detailAddress,
    });
    if (!selectedPlace) {
      const createdPlace: PlacesCreateInput = await this.createPlaceWithCrawl(
        place,
        extractAddress,
      );

      return createdPlace;
    }

    return selectedPlace;
  }

  private async createPlaceWithCrawl(
    place,
    extractAddress,
  ): Promise<PlacesCreateInput> {
    const { crawledNaverPlace, naverReviews } = await this.crawlPlace(
      place.title,
    );

    const crawledPlace: PlacesCreateInput = {
      ...place,
      ...crawledNaverPlace,
    };

    const createdPlaceId: number = await this.createPlace(
      crawledPlace,
      extractAddress,
    );

    if (naverReviews) {
      await this.createNaverReviews(createdPlaceId, naverReviews);
    }

    return crawledPlace;
  }

  private async crawlPlace(title: string): Promise<{
    crawledNaverPlace: CrawledNaverPlace;
    naverReviews: any[];
  }> {
    const { naverPlaceId, thumUrl: thum_url }: CrawledNaverPlaceInformations =
      await this.crawlPlaceDetails(title);

    const { naver_stars, naver_reviewer_counts, naverReviews } =
      await this.crawlNaverReviewsAndStars(naverPlaceId);

    const crawledNaverPlace: CrawledNaverPlace = {
      naver_place_id: naverPlaceId,
      thum_url,
      naver_stars,
      naver_reviewer_counts,
    };

    return { crawledNaverPlace, naverReviews };
  }

  private async crawlNaverReviewsAndStars(naverPlaceId: string) {
    const naverPlaceReviewUrl = await this.getNaverPlaceReviewUrl(naverPlaceId);

    const naverReviews = [];

    try {
      const { data } = await axios.get(naverPlaceReviewUrl, {
        headers: this.naverHeaders,
      });

      const $ = load(data);

      const naver_stars = $(
        '#app-root > div > div > div > div.place_section.OP4V8 > div.zD5Nm > div.dAsGb > span.PXMot.LXIwF > em',
      ).text();
      const naver_reviewer_counts = $(
        '#app-root > div > div > div > div.place_section.OP4V8 > div.zD5Nm > div.dAsGb > span:nth-child(2) > a > em',
      ).text();

      $('.zPfVt').each(function () {
        naverReviews.push({ description: $(this).text() });
      });

      return { naver_stars, naver_reviewer_counts, naverReviews };
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
      headers: this.apiHeaders,
    });

    const naverPlaceReviewUrl = request.res.responseUrl.replace(
      '/home',
      '/review/visitor',
    );

    return naverPlaceReviewUrl;
  }

  private async createPlace(
    place: PlacesCreateInput,
    extractAddress: ExtractAddress,
  ): Promise<number> {
    console.log(extractAddress);

    const { id } = await this.prisma.regions.findFirst({
      where: {
        administrative_district: extractAddress.administrativeDistrict,
        district: extractAddress.district,
      },
      select: {
        id: true,
      },
    });
    place.region_id = id;

    const createdPlace: Places = await this.prisma.places.create({
      data: { ...place },
    });
    if (!createdPlace) {
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
        place_id: placeId,
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
      headers: this.apiHeaders,
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

  private async checkPlaceExists({
    title,
    address,
  }: PlaceSummary): Promise<PlaceInformation> {
    const selectedPlace: PlaceInformation = await this.prisma.places.findFirst({
      where: { title, address },
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

  private extractDistrictAndAddress(address): ExtractAddress {
    const addressParts = address.split(' ');
    let administrativeDistrict = null;
    let district = null;

    if (addressParts[0] === '세종특별자치시') {
      administrativeDistrict = addressParts.shift();
    } else if (
      addressParts[0].endsWith('시') ||
      addressParts[0].endsWith('도')
    ) {
      administrativeDistrict = addressParts.shift();
    }

    if (
      addressParts.length >= 2 &&
      (addressParts[0].endsWith('시') ||
        addressParts[0].endsWith('군') ||
        addressParts[0].endsWith('구'))
    ) {
      district = addressParts.shift();
    }
    const detailAddress = addressParts.join(' ');

    return { administrativeDistrict, district, detailAddress };
  }
}
