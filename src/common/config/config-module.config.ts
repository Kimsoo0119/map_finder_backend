import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

export const CustomConfigModule = ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: '.env',
  cache: true,
  validationSchema: Joi.object({
    DATABASE_URL: Joi.string().required(),
    REDIS_URL: Joi.string().required(),
    REDIS_PORT: Joi.number().required(),
    REDIS_DATA_TTL: Joi.number().required(),

    JWT_SECRET_KEY: Joi.string().required(),
    ACCESS_TOKEN_EXPIRESIN: Joi.string().required(),
    REFRESH_TOKEN_EXPIRESIN: Joi.string().required(),

    CLIENT_ID: Joi.string().required(),
    CLIENT_SECRET: Joi.string().required(),

    NAVER_LOCAL_SEARCH_URL: Joi.string().required(),
    NAVER_MAP_URL: Joi.string().required(),
    NAVER_MAP_URL_OPTION: Joi.string().required(),
    NAVER_PLACE_URL: Joi.string().required(),
    NAVER_PLACE_BASE_URL: Joi.string().required(),

    KAKAO_OAUTH_TOKEN_API_URL: Joi.string().required(),
    KAKAO_JAVASCRIPT_KEY: Joi.string().required(),
    KAKAO_GRANT_TYPE: Joi.string().required(),
    KAKAO_CONTENT_TYPE: Joi.string().required(),
    KAKAO_REDIRECT_URI: Joi.string().required(),
    KAKAO_GET_USER_URI: Joi.string().required(),
  }),
});
