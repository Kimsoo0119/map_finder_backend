import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import axios from 'axios';
import { PlaceDto } from './dto/place.dto';
import {
  CrawledNaverPlace,
  CrawledPlace,
  ExtractAddress,
  Place,
  PlaceDataToUpdate,
  PlaceInformation,
  PlacesCreateInput,
  PlacesCreateManyInput,
} from './interface/places.interface';
import { parseStringPromise } from 'xml2js';
import {
  CrawledNaverPlaceInformations,
  NaverReview,
} from 'src/common/interface/common-interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { load } from 'cheerio';
import { ConfigService } from '@nestjs/config';
import { PlaceCategories, Places, Prisma } from '@prisma/client';
import { RecommendedTarget } from './enum/place.enum';
import { data } from 'cheerio/lib/api/attributes';
import { response } from 'express';

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

  async getPlace(place: PlaceDto): Promise<Place> {
    const { title, address } = place;

    const extractAddress: ExtractAddress =
      this.extractDistrictAndAddress(address);
    place.address = extractAddress.detailAddress;

    const selectedPlace: Place = await this.getPlaceByTitleAndAddress(
      title,
      extractAddress,
    );

    if (!selectedPlace) {
      const { naverPlaceId, thumUrl: thum_url }: CrawledNaverPlaceInformations =
        await this.crawlNaverPlace(title);

      const updatedPlace: Place = await this.checkPlaceAndUpdate(
        title,
        naverPlaceId,
      );
      if (!updatedPlace) {
        const crawledPlaceInfo: CrawledPlace =
          await this.createCrawledPlaceInfo(naverPlaceId, thum_url);

        const placeDataToCreate: PlacesCreateInput = await this.createPlaceData(
          place,
          crawledPlaceInfo,
        );

        const createdPlace: Place = await this.createPlace(
          placeDataToCreate,
          extractAddress,
        );
        if (crawledPlaceInfo.naverReviews) {
          await this.createNaverReviews(
            createdPlace.id,
            crawledPlaceInfo.naverReviews,
          );
        }

        return createdPlace;
      }

      return updatedPlace;
    }

    if (!selectedPlace.is_init) {
      const { naver_stars, naver_reviewer_counts, naverReviews } =
        await this.crawlNaverReviewsAndStars(selectedPlace.naver_place_id);
      const placeDataToUpdate: PlaceDataToUpdate = {
        naver_stars,
        naver_reviewer_counts,
        is_init: true,
      };

      const updatedPlace: Place = await this.updatePlace(
        selectedPlace.id,
        placeDataToUpdate,
      );

      if (naverReviews) {
        await this.createNaverReviews(selectedPlace.id, naverReviews);
      }

      return updatedPlace;
    }
    return selectedPlace;
  }

  private async createPlaceData(
    place,
    crawledPlace,
  ): Promise<PlacesCreateInput> {
    place.category_id = await this.getPlaceCategoryId(place.category);
    delete place.category;

    const placeDataToCreate: PlacesCreateInput = {
      ...place,
      ...crawledPlace.placeInfo,
    };

    return placeDataToCreate;
  }

  private async createCrawledPlaceInfo(
    naverPlaceId: string,
    thum_url: string,
  ): Promise<{
    placeInfo: CrawledNaverPlace;
    naverReviews: any[];
  }> {
    const { naver_stars, naver_reviewer_counts, naverReviews } =
      await this.crawlNaverReviewsAndStars(naverPlaceId);

    const placeInfo: CrawledNaverPlace = {
      naver_place_id: naverPlaceId,
      thum_url,
      naver_stars,
      naver_reviewer_counts,
    };

    return { placeInfo, naverReviews };
  }

  private async checkPlaceAndUpdate(
    title: string,
    naverPlaceId: string,
  ): Promise<Place> {
    const selectedPlace = await this.prisma.places.findFirst({
      where: { naver_place_id: naverPlaceId },
      select: { id: true, title: true },
    });
    if (selectedPlace.id) {
      const updatedPlace: Place = await this.updatePlace(selectedPlace.id, {
        title,
      });
      return updatedPlace;
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
    placeDataToCreate: PlacesCreateInput,
    extractAddress: ExtractAddress,
  ): Promise<Place> {
    const selectedRegion = await this.prisma.regions.findFirst({
      where: {
        administrative_district: extractAddress.administrativeDistrict,
        district: extractAddress.district,
      },
      select: {
        id: true,
      },
    });
    placeDataToCreate.region_id = selectedRegion.id;

    const createdPlace: Place = await this.prisma.places.create({
      data: { ...placeDataToCreate, is_init: true },
      select: {
        id: true,
        title: true,
        address: true,
        telephone: true,
        stars: true,
        naver_reviewer_counts: true,
        naver_stars: true,
        thum_url: true,
        is_init: true,
        region: { select: { administrative_district: true, district: true } },
        place_category: { select: { main: true, sub: true } },
      },
    });

    return createdPlace;
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

  private async updatePlace(
    placeId: number,
    placeDataToUpdate: PlaceDataToUpdate,
  ): Promise<Place> {
    const updatedPlace = await this.prisma.places.update({
      where: { id: placeId },
      data: { ...placeDataToUpdate },
      select: {
        id: true,
        title: true,
        address: true,
        telephone: true,
        stars: true,
        naver_reviewer_counts: true,
        naver_stars: true,
        thum_url: true,
        is_init: true,
        naver_place_id: true,
        region: { select: { administrative_district: true, district: true } },
        place_category: { select: { main: true, sub: true } },
      },
    });
    return updatedPlace;
  }

  async getPlacesWithNaver(placeTitle: string): Promise<PlaceInformation[]> {
    const params = {
      query: placeTitle,
      display: 5,
    };

    const response = await axios.get(this.naverLocalSearchApiUrl, {
      headers: this.apiHeaders,
      params,
    });
    if (!response.data) {
      throw new InternalServerErrorException(`요청 실패`);
    }

    const parsedData = await parseStringPromise(response.data, {
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
      title: place.title.replace(/<([^>]+)>|&amp;/gi, ''),
      category: place.category,
      address: place.address,
      telephone: place.telephone,
    };
  }

  private async crawlNaverPlace(title): Promise<CrawledNaverPlaceInformations> {
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

  private async getPlaceCategoryId(category): Promise<number> {
    const [mainCategory, subCategory] = category.split('>');

    const categoryId: PlaceCategories =
      await this.prisma.placeCategories.findUnique({
        where: { main_sub: { main: mainCategory, sub: subCategory } },
      });
    if (!categoryId) {
      const createdCategoryId: PlaceCategories =
        await this.prisma.placeCategories.create({
          data: { main: mainCategory, sub: subCategory },
        });
      return createdCategoryId.id;
    }

    return categoryId.id;
  }

  async getRecommendPlace(
    address: string,
    target: RecommendedTarget,
  ): Promise<Place[]> {
    const extractAddress: ExtractAddress = await this.getExtractAddress(
      address,
    );
    const searchedPlaces: PlaceInformation[] =
      await this.getRecommendedPlaceBySearchApi(extractAddress, target);

    const recommendedPlaces: Place[] = await this.createRecommendPlaces(
      searchedPlaces,
    );

    return recommendedPlaces;
  }

  private async getExtractAddress(address: string): Promise<ExtractAddress> {
    const extractAddress: ExtractAddress =
      this.extractDistrictAndAddress(address);
    const region = await this.prisma.regions.findFirst({
      where: {
        administrative_district: extractAddress.administrativeDistrict,
        district: extractAddress.district,
      },
      select: {
        id: true,
      },
    });
    if (!region) {
      throw new BadRequestException(`잘못된 주소 형식입니다.`);
    }
    extractAddress.regionId = region.id;

    return extractAddress;
  }

  private async getRecommendedPlaceBySearchApi(
    extractAddress: ExtractAddress,
    target: RecommendedTarget,
  ) {
    const params = {
      query: `${extractAddress.district} ${extractAddress.detailAddress}${target}`,
      display: '5',
      sort: 'comment',
    };

    const response = await axios.get(this.naverLocalSearchApiUrl, {
      headers: this.apiHeaders,
      params,
    });

    if (!response.data) {
      throw new InternalServerErrorException(`요청 실패`);
    }

    const parsedData = await parseStringPromise(response.data, {
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

  private async getPlaceByTitleAndAddress(
    title: string,
    extractAddress: ExtractAddress,
  ): Promise<Place> {
    const selectedPlace: Place = await this.prisma.places.findFirst({
      where: { title, address: extractAddress.detailAddress },
      select: {
        id: true,
        title: true,
        address: true,
        telephone: true,
        stars: true,
        naver_reviewer_counts: true,
        naver_stars: true,
        thum_url: true,
        is_init: true,
        naver_place_id: true,
        region: { select: { administrative_district: true, district: true } },
        place_category: { select: { main: true, sub: true } },
      },
    });

    return selectedPlace;
  }

  private async createRecommendPlaces(recommendedPlaces: PlaceInformation[]) {
    const selectedPlaces: Place[] = [];
    const placeDataToCreate: PlacesCreateManyInput[] = [];

    for (const recommendedPlace of recommendedPlaces) {
      const extractAddress: ExtractAddress = await this.getExtractAddress(
        recommendedPlace.address,
      );

      const selectedPlace: Place = await this.getPlaceByTitleAndAddress(
        recommendedPlace.title,
        extractAddress,
      );
      if (!selectedPlace) {
        const placeDetails: CrawledNaverPlaceInformations =
          await this.crawlNaverPlace(recommendedPlace.title);

        const category_id: number = await this.getPlaceCategoryId(
          recommendedPlace.category,
        );
        delete recommendedPlace.category;

        const data = {
          ...recommendedPlace,
          naver_place_id: placeDetails.naverPlaceId,
          thum_url: placeDetails.thumUrl,
          region_id: extractAddress.regionId,
          address: extractAddress.detailAddress,
          category_id,
        };

        placeDataToCreate.push(data);
      } else {
        selectedPlaces.push(selectedPlace);
      }
    }

    await this.prisma.places.createMany({ data: placeDataToCreate });

    for (const placeData of placeDataToCreate) {
      const selectedPlace: Place = await this.prisma.places.findFirst({
        where: { title: placeData.title, address: placeData.address },
        select: {
          id: true,
          title: true,
          address: true,
          telephone: true,
          stars: true,
          naver_reviewer_counts: true,
          naver_stars: true,
          thum_url: true,
          is_init: true,
          naver_place_id: true,
          region: { select: { administrative_district: true, district: true } },
          place_category: { select: { main: true, sub: true } },
        },
      });
      selectedPlaces.push(selectedPlace);
    }

    return selectedPlaces;
  }
}
