import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime';
import { Request, Response } from 'express';

@Catch(
  Prisma.PrismaClientInitializationError,
  Prisma.PrismaClientKnownRequestError,
  Prisma.PrismaClientUnknownRequestError,
  Prisma.PrismaClientRustPanicError,
  Prisma.PrismaClientValidationError,
)
export class PrismaExceptionFilter implements ExceptionFilter {
  private logger = new Logger('prisma-exception');

  catch(
    exception:
      | Prisma.PrismaClientInitializationError
      | Prisma.PrismaClientKnownRequestError
      | Prisma.PrismaClientUnknownRequestError
      | Prisma.PrismaClientRustPanicError
      | Prisma.PrismaClientValidationError,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status;
    let message;
    let logMessage;
    let code;
    let meta;
    console.log(exception);

    switch (exception.constructor) {
      case Prisma.PrismaClientInitializationError:
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'Prisma Client 초기화에 실패했습니다';
        break;

      case Prisma.PrismaClientKnownRequestError:
        status = HttpStatus.BAD_REQUEST;
        switch ((exception as PrismaClientKnownRequestError).code) {
          case 'P1001':
            code = 'P1001';
            message = '데이터베이스 서버에 연결할 수 없습니다.';
            break;
          case 'P2001':
            code = 'P2001';
            message = '검색하는 정보가 존재하지 않습니다.';
            break;
          case 'P2002':
            code = 'P2002';
            message = '데이터 중복입니다.';
            break;
        }
        if ((exception as PrismaClientKnownRequestError).meta) {
          meta = (exception as PrismaClientKnownRequestError).meta;
        }
        if (!exception.message) {
          message = 'DB 오류입니다. 잠시 후 다시 시도해주세요';
        }
        logMessage = exception.message;
        break;

      case Prisma.PrismaClientUnknownRequestError:
        status = HttpStatus.BAD_REQUEST;
        logMessage = exception.message;
        message = 'DB 오류입니다.';
        break;

      case Prisma.PrismaClientRustPanicError:
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        logMessage = exception.message;
        message = '알 수 없는 서버 에러입니다.';
        break;

      case Prisma.PrismaClientValidationError:
        meta = exception as PrismaClientValidationError;
        console.log(meta);

        status = HttpStatus.UNPROCESSABLE_ENTITY;
        logMessage = exception.message;
        message = '잘못된 형식의 요청입니다. 확인 후 재시도 해주세요';
        break;
    }

    const log = {
      code,
      meta,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      logMessage,
    };

    this.logger.error(log);

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
