import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  //onModuleInit을 사용하여 DB연결
  async onModuleInit() {
    await this.$connect();
  }

  async enableShutdownHook(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }
}
